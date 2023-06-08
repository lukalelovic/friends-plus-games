import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
} from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GameGateway } from './game.gateway';
import { Player } from '../models/player';
import { Wackbox } from '../models/wackbox';

@WebSocketGateway({
  path: '/wackbox',
})
@Injectable()
export class WackboxGateway implements OnGatewayInit {
  @WebSocketServer()
  private server: Server;

  private gameMap = new Map<string, Wackbox>();
  private readonly TICK_RATE: number = 30;

  afterInit(server: any) {
    server.engine.pingInterval = this.TICK_RATE;
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

    // If prompt countdown has not begun, initialize game, add player, and start it
    if (!this.gameMap.has(lobbyId)) {
      this.gameMap.set(lobbyId, new Wackbox(lobbyId));

      this.gameMap.get(lobbyId).addPlayer(socket.id);
      this.gameMap.get(lobbyId).gameLoop(this.server);
    } else {
      this.gameMap.get(lobbyId).addPlayer(socket.id);
    }
  }

  @SubscribeMessage('submitAnswer')
  handleSubmitAnswer(socket: Socket, data: string) {
    const lobbyId = data[0];
    const answer = data[1];

    const player = this.gameMap
      .get(lobbyId)
      .getPlayers()
      .find((p) => p.id == socket.id);

    if (!player) {
      console.error(
        `Player ${socket.id} not found in wackbox game ${lobbyId}.`,
      );
      return;
    }

    this.gameMap.get(lobbyId).addRoundAnswer(socket.id, answer);
  }

  @SubscribeMessage('submitVote')
  handleSubmitVote(socket: Socket, data: string) {
    const lobbyId = data[0];
    const voteId = data[1];

    this.gameMap.get(lobbyId).castVote(socket.id, voteId);
  }

  handleDisconnect(socket: Socket): void {
    // Get the lobby ID of the current socket
    let lobbyId: string;
    let playerMap = new Map<string, Player>();

    // Find the current player's lobby
    for (const [id, map] of GameGateway.lobbyPlayerMap.entries()) {
      if (map.has(socket.id)) {
        playerMap = map;
        lobbyId = id;
        break;
      }
    }

    if (lobbyId == undefined) return;

    // Remove player from lobby
    if (playerMap.has(socket.id)) {
      playerMap.delete(socket.id);
    }

    GameGateway.setPlayerMap(lobbyId, playerMap);

    this.gameMap.get(lobbyId).removePlayer(socket.id);
    this.server.to(lobbyId).emit('playerLeft', socket.id);

    // End lobby session when all players disconnected
    if (playerMap.size == 0) {
      console.log(`Game session ${lobbyId} ended`);
      this.gameMap.delete(lobbyId);
    }

    console.log(`Socket ${socket.id} disconnected from game namespace`);
  }
}
