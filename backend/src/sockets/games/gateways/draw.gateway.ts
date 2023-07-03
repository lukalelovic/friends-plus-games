import { Injectable } from '@nestjs/common';
import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameGateway } from './game.gateway';
import { Player } from '../models/player';
import { DrawSm } from '../models/drawSm';

@WebSocketGateway({
  path: '/draw',
})
@Injectable()
export class DrawGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private gameMap = new Map<string, DrawSm>(); // <lobby id>:<Draw Something object>
  private readonly TICK_RATE: number = 30;

  afterInit(server: any) {
    server.engine.pingInterval = this.TICK_RATE;
  }

  handleConnection(socket: Socket): void {
    console.log(
      `Client ${socket.id} connected to the draw something namespace`,
    );
  }

  @SubscribeMessage('joinGame')
  handleJoinGame(socket: Socket, data: string): void {
    const lobbyId = data[0];
    const oldSockId: string = data[1];

    const playerMap: Map<string, Player> =
      GameGateway.lobbyPlayerMap.get(lobbyId);

    if (!playerMap) return;
    socket.join(lobbyId);

    // Update socket mapping
    if (playerMap.has(oldSockId)) {
      const player = playerMap.get(oldSockId);
      player.id = socket.id;

      playerMap.delete(oldSockId);
      playerMap.set(socket.id, player);
    }

    GameGateway.setPlayerMap(lobbyId, playerMap);

    // Return lobby players to the socket
    this.server
      .to(lobbyId)
      .emit('playerJoined', [...playerMap.values()], oldSockId);
    console.log(`Player ${socket.id} joined mafia game ${lobbyId}`);

    // If starting countdown has not begun, initialize it
    if (!this.gameMap.has(lobbyId)) {
      this.gameMap.set(lobbyId, new DrawSm(lobbyId));
    }
  }
}
