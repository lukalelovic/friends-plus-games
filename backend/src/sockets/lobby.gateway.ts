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
  path: '/lobby',
})
@Dependencies(TagGateway)
export class LobbyGateway {
  @WebSocketServer()
  server: Server;

  lobbyMap = new Map<string, Player[]>(); // Contains <lobby id>:<player list>

  constructor(private readonly tagGatway: TagGateway) {}

  handleConnection(socket: Socket): void {
    console.log(`Client ${socket.id} connected to the lobby namespace`);
  }

  @SubscribeMessage('joinLobby')
  handleJoinLobby(socket: Socket, data: string): void {
    const lobbyId = data[0];
    socket.join(lobbyId);

    // Initialize player object
    const p = new Player(socket.id, 0, 0);
    p.setName(data[1]);

    // Add player to lobby map list
    let lobbyList: Player[] = [];
    if (this.lobbyMap.has(lobbyId)) {
      lobbyList = this.lobbyMap.get(lobbyId);
    } else {
      console.log(`Game lobby ${lobbyId} created`);
    }

    lobbyList.push(p);
    this.lobbyMap.set(lobbyId, lobbyList);

    // Send update of all players in lobby
    this.server.to(lobbyId).emit('lobbyState', lobbyList);
    console.log(`Player ${socket.id} (${p.name}) joined lobby ${lobbyId}`);
  }

  @SubscribeMessage('startGame')
  handleStartGame(socket: Socket, data: string): void {
    const lobbyId: string = data[0];
    const gameName: string = data[1];

    // Send current lobby to matching game name
    if (gameName.toLowerCase() === 'tag') {
      // Get the current lobby state
      const lobbyList: Player[] = this.lobbyMap.get(lobbyId);

      // Get all player id to object mapping
      const playerMap = new Map<string, Player>();
      lobbyList.forEach((player) => {
        playerMap.set(player.id, player);
      });

      // Update tag map with players
      this.tagGatway.setPlayerMap(lobbyId, playerMap);

      this.server.to(lobbyId).emit('gameStarted');
      console.log(`Starting ${gameName} game for lobby ${lobbyId}...`);
    } else {
      console.error('Invalid game name: ' + gameName);
    }
  }

  handleDisconnect(socket: Socket): void {
    let lobbyId: string;
    let lobbyList: Player[];
    let playerIndex: number;

    // Get the current lobby and player index within it
    for (const [id, list] of this.lobbyMap.entries()) {
      playerIndex = list.findIndex((p) => p.id === socket.id);
      lobbyId = id;
      lobbyList = list;

      if (playerIndex > -1) {
        break;
      }
    }

    if (playerIndex == -1) return;

    // Find player from lobby list and remove
    lobbyList.splice(playerIndex, 1);

    // Update lobby map
    this.lobbyMap.set(lobbyId, lobbyList);

    // Send update of all players in lobby
    this.server.to(lobbyId).emit('lobbyState', lobbyList);
    console.log(`Player ${socket.id} left lobby ${lobbyId}`);

    if (lobbyList.length === 0) {
      this.lobbyMap.delete(lobbyId);
      console.log(`Lobby ${lobbyId} has ended`);
    }
  }
}
