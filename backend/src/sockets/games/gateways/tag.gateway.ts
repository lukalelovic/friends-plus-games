import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Player } from '../models/player';
import { GameGateway } from './game.gateway';

@WebSocketGateway({
  path: '/tag',
})
@Injectable()
export class TagGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;
  readonly SEND_DELAY: number = 20;
  canTagMap = new Map<string, boolean>(); // <lobby id>:<canTag>

  private readonly TICK_RATE: number = 30;

  afterInit(server: any) {
    server.engine.pingInterval = this.TICK_RATE;
  }

  handleConnection(socket: Socket): void {
    console.log(`Client ${socket.id} connected to the tag namespace`);
  }

  @SubscribeMessage('joinGame')
  handleJoinGame(socket: Socket, data: string): void {
    const lobbyId = data[0];
    const oldSockId: string = data[1];

    const playerMap: Map<string, Player> =
      GameGateway.lobbyPlayerMap.get(lobbyId);

    if (!playerMap) return;

    socket.join(lobbyId);
    if (!this.canTagMap.has(lobbyId)) {
      this.canTagMap.set(lobbyId, true);
    }

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
      .emit('playerJoined', [...playerMap.values()], oldSockId, socket.id);
    console.log(`Player ${socket.id} joined tag game ${lobbyId}`);
  }

  @SubscribeMessage('movePlayer')
  handleMovePlayer(socket: Socket, data: string): void {
    const lobbyId: string = data[0];
    const x = Number(data[1]);
    const y = Number(data[2]);

    const playerId: string = socket.id;

    const playerMap: Map<string, Player> =
      GameGateway.lobbyPlayerMap.get(lobbyId);

    if (!playerMap) return;

    // Update the player's position in the players map
    let player: Player = playerMap.get(playerId);
    if (player && (x != player.x || y != player.y)) {
      player.x = x;
      player.y = y;
    } else {
      player = new Player(socket.id, x, y);
    }

    playerMap.set(playerId, player);
    GameGateway.setPlayerMap(lobbyId, playerMap);

    // Broadcast the new state to all connected clients
    this.server.to(lobbyId).emit('currentState', playerMap.get(playerId));
  }

  @SubscribeMessage('tagPlayer')
  handleTagPlayer(socket: Socket, data: string): void {
    const lobbyId: string = data[0];
    const tagId: string = data[1];

    if (lobbyId == null || tagId == null) {
      return;
    }

    // Lobby exists and player is in it? Emit tagged player ID
    if (GameGateway.lobbyPlayerMap.has(lobbyId)) {
      if (
        GameGateway.lobbyPlayerMap.get(lobbyId).has(tagId) &&
        this.canTagMap.get(lobbyId) == true
      ) {
        this.server.to(lobbyId).emit('playerTagged', tagId);
        console.log(`Player ${tagId} in game ${lobbyId} was tagged!`);
        this.canTagMap.set(lobbyId, false);

        // Tag cooldown for 3 seconds
        setTimeout(() => {
          this.canTagMap.set(lobbyId, true);
        }, 3000);
      } else if (!GameGateway.lobbyPlayerMap.get(lobbyId).has(tagId)) {
        console.error(`Player ${tagId} in game ${lobbyId} not found`);
        this.server.to(lobbyId).emit('playerLeft', tagId);
      }
    }
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
    this.server.to(lobbyId).emit('playerLeft', socket.id);
    console.log(`Socket ${socket.id} disconnected from game namespace`);

    // End lobby session when all players disconnected
    if (playerMap.size == 0) {
      console.log(`Game session ${lobbyId} ended`);
    }
  }
}
