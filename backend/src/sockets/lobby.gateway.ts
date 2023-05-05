import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Dependencies } from '@nestjs/common';
import { TagGateway } from './games/tag.gateway';
import { Player } from '../models/player';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URI,
  },
  path: '/lobby',
})
@Dependencies(TagGateway)
export class LobbyGateway {
  @WebSocketServer()
  server: Server;

  lobbyMap = new Map<string, Player[]>();
  lobbyId: string;

  constructor(private readonly tagGatway: TagGateway) {}

  handleConnection(socket: Socket): void {
    console.log(`Client ${socket.id} connected to the lobby namespace`);
  }

  @SubscribeMessage('joinLobby')
  handleJoinLobby(socket: Socket, data: string): void {
    this.lobbyId = data[0];
    socket.join(this.lobbyId);

    console.log(`Game lobby ${this.lobbyId} created`);

    // Initialize player object
    const p = new Player(socket.id, 0, 0);
    p.setName(data[1]);

    // Add player to lobby map list
    let lobbyList: Player[] = [];
    if (this.lobbyMap.has(this.lobbyId)) {
      lobbyList = this.lobbyMap.get(this.lobbyId);
    }
    lobbyList.push(p);
    this.lobbyMap.set(this.lobbyId, lobbyList);

    // Send update of all players in lobby
    this.server.to(this.lobbyId).emit('lobbyState', lobbyList);
    console.log(`Player ${socket.id} (${p.name}) joined lobby ${this.lobbyId}`);
  }

  @SubscribeMessage('startGame')
  handleStartGame(socket: Socket, data: string): void {
    const id: string = data[0];
    const gameName: string = data[1];

    // Send current lobby to matching game name
    if (gameName.toLowerCase() === 'tag') {
      // Get the current lobby state
      const lobbyList: Player[] = this.lobbyMap.get(id);

      // Get all player id to object mapping
      const playerMap = new Map<string, Player>();
      lobbyList.forEach((player) => {
        playerMap.set(player.id, player);
      });

      // Update tag map with players
      this.tagGatway.setPlayerMap(playerMap);

      this.server.to(this.lobbyId).emit('gameStarted');
      console.log(`Starting ${gameName} game for lobby ${this.lobbyId}...`);
    } else {
      console.error('Invalid game name: ' + gameName);
    }
  }

  handleDisconnect(socket: Socket): void {
    if (!this.lobbyId) return;

    const lobbyList: Player[] = this.lobbyMap.get(this.lobbyId);
    if (!lobbyList) return;

    // Find player from lobby list and remove
    const playerIndex: number = lobbyList.findIndex((p) => p.id === socket.id);
    lobbyList.splice(playerIndex, 1);

    // Update lobby map
    this.lobbyMap.set(this.lobbyId, lobbyList);

    // Send update of all players in lobby
    this.server.to(this.lobbyId).emit('lobbyState', lobbyList);
    console.log(`Player ${socket.id} left lobby ${this.lobbyId}`);

    if (lobbyList.length === 0) {
      this.lobbyMap.delete(this.lobbyId);
      console.log(`Lobby ${this.lobbyId} has ended`);
    }
  }
}
