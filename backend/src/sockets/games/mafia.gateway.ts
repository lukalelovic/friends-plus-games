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

@WebSocketGateway({
  path: '/mafia',
})
@Injectable()
export class MafiaGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private countingMap = new Map<string, number>(); // <lobby id>:<countdown val>
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
      playerMap.set(socket.id, playerMap.get(oldSockId));

      playerMap.delete(oldSockId);
      playerMap.get(socket.id).id = socket.id;
    }

    // Return lobby players to the socket
    this.server.to(lobbyId).emit('playerJoined', playerMap.get(socket.id));
    console.log(`Player ${socket.id} joined mafia game ${lobbyId}`);

    // If starting countdown has not begun, initialize it
    if (!this.countingMap.has(lobbyId)) {
      this.countingMap.set(lobbyId, 10);
      this.beginCountdown(lobbyId);
    }
  }

  beginCountdown(lobbyId) {
    // Countdown from specified value (and then return role assignment)
    setInterval(() => {
      const prevVal = this.countingMap.get(lobbyId);

      if (prevVal > 0) {
        this.countingMap.set(lobbyId, prevVal - 1);
        this.server.to(lobbyId).emit('countingDown', prevVal - 1);
      } else {
        this.assignRoles(lobbyId);
        return;
      }
    }, 1000);
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

  assignRoles(lobbyId) {
    const playerMap: Map<string, Player> =
      GameGateway.lobbyPlayerMap.get(lobbyId);

    const playerIds = Array.from(playerMap.keys());
    const assignedMap = new Map<string, string>();

    const uniqueRoles = ['Assassin', 'King', 'Herbalist', 'Jester'];

    // Assign unique roles to random players
    for (const role of uniqueRoles) {
      // Select random player to be assassin
      let randId;
      do {
        const randNdx = Math.floor(Math.random() * playerIds.length);
        randId = playerIds.splice(randNdx, 1);
      } while (assignedMap.has(randId) && playerIds.length > 0);

      // Assign non-assigned random ID to role
      console.log(`${randId} was assigned the role of ${role}`);
      this.server.to(lobbyId).emit('assignRole', randId, role);
    }

    // Assign standard role to rest of players
    for (const playerId in playerIds) {
      console.log(
        `Player ${playerId} (${
          playerMap.get(playerId).name
        }) was assigned the role of Noble`,
      );
      this.server.to(lobbyId).emit('assignRole', playerId, 'Noble');
    }
  }
}
