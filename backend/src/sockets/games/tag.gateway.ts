import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Player } from '../../models/player';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URI,
  },
  path: '/tag',
})
@Injectable()
export class TagGateway {
  @WebSocketServer()
  server: Server;

  playerMap = new Map<string, Player>(); // Contains <socketId:player>
  lobbyId: string;

  handleConnection(socket: Socket): void {
    console.log(`Client ${socket.id} connected to the game namespace`);
  }

  @SubscribeMessage('joinGame')
  handleJoinGame(socket: Socket, data: string): void {
    if (!this.playerMap) return;

    this.lobbyId = data[0];
    const oldSockId: string = data[1];

    socket.join(this.lobbyId);

    // Update socket mapping
    if (this.playerMap.has(oldSockId)) {
      this.playerMap.set(socket.id, this.playerMap.get(oldSockId));

      this.playerMap.delete(oldSockId);
      this.playerMap.get(socket.id).id = socket.id;
    }

    // Return lobby players to the socket
    this.server.to(this.lobbyId).emit('currentState', this.getPlayerJson());
    console.log(`Player ${socket.id} joined tag game ${this.lobbyId}`);
  }

  @SubscribeMessage('movePlayer')
  handleMovePlayer(socket: Socket, data: string): void {
    const id: string = data[0];
    const x = Number(data[1]);
    const y = Number(data[2]);

    if (!this.playerMap) return;

    // Update the player's position in the players map
    const player: Player = this.playerMap.get(id);
    if (player) {
      player.x = x;
      player.y = y;
    }
    this.playerMap.set(id, player);

    // Broadcast the new state to all connected clients
    this.server.to(this.lobbyId).emit('currentState', this.getPlayerJson());
  }

  handleDisconnect(socket: Socket): void {
    if (!this.playerMap) return;

    // Remove player from lobby
    if (this.playerMap.has(socket.id)) {
      this.playerMap.delete(socket.id);
    }

    this.server.to(this.lobbyId).emit('playerLeft', socket.id);
    console.log(`Socket ${socket.id} disconnected from game`);

    // End lobby session when all players disconnected
    if (this.playerMap.size == 0) {
      console.log(`Game session ${this.lobbyId} ended`);
    }
  }

  setPlayerMap(playerMap): void {
    this.playerMap = playerMap;
  }

  getPlayerJson(): string {
    return JSON.stringify(Array.from(this.playerMap.values()));
  }
}
