import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Player } from '../../models/player';
import { GameGateway } from './game.gateway';
import { Mafia } from 'src/models/mafia';

@WebSocketGateway({
  path: '/mafia',
})
@Injectable()
export class MafiaGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private gameMap = new Map<string, Mafia>(); // <lobby id>:<Mafia object>
  private readonly TICK_RATE: number = 30;

  afterInit(server: any) {
    server.engine.pingInterval = this.TICK_RATE;
  }

  handleConnection(socket: Socket): void {
    console.log(`Client ${socket.id} connected to the mafia namespace`);
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
    console.log([...playerMap.values()]);
    this.server
      .to(lobbyId)
      .emit('playerJoined', [...playerMap.values()], oldSockId);
    console.log(`Player ${socket.id} joined mafia game ${lobbyId}`);

    // If starting countdown has not begun, initialize it
    if (!this.gameMap.has(lobbyId)) {
      this.gameMap.set(lobbyId, new Mafia(lobbyId));
      this.gameMap.get(lobbyId).beginCountdown(this.server);
    }
  }

  @SubscribeMessage('assignRoles')
  handleAssignRoles(socket: Socket, lobbyId: string): void {
    // Get player id list in current game
    const playerMap: Map<string, Player> =
      GameGateway.lobbyPlayerMap.get(lobbyId);
    const playerIds = Array.from(playerMap.keys());

    // Method already executed/executing?
    if (this.gameMap.get(lobbyId).rolesAssigned()) {
      return;
    }

    // Else assign player roles
    this.gameMap.get(lobbyId).assignRoles(this.server, playerIds);
  }

  @SubscribeMessage('castVote')
  handleCastVote(socket: Socket, data: string) {
    const lobbyId = data[0];
    const votedId = data[1];

    if (socket.id == votedId) {
      return;
    }

    if (!this.gameMap.get(lobbyId).getIsDay()) {
      return;
    }

    this.gameMap.get(lobbyId).castVote(socket.id, votedId);
  }

  @SubscribeMessage('nightAction')
  handleNightAction(socket: Socket, data: string) {
    const lobbyId = data[0];
    const playerId = data[1];

    if (socket.id == playerId) {
      return;
    }

    this.gameMap.get(lobbyId).performNightAction(socket.id, playerId);
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
