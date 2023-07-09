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
    const lobbyId: string = data[0];
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
    console.log(`Player ${socket.id} joined draw something game ${lobbyId}`);

    // If starting countdown has not begun, initialize it
    if (!this.gameMap.has(lobbyId)) {
      this.gameMap.set(lobbyId, new DrawSm(lobbyId));
      this.gameMap.get(lobbyId).addPlayer(socket.id);

      this.gameMap.get(lobbyId).gameLoop(this.server);
    } else {
      this.gameMap.get(lobbyId).addPlayer(socket.id);
    }

    // Old id joined game? Remove it
    if (this.gameMap.get(lobbyId).getPlayers()[oldSockId]) {
      if (oldSockId == this.gameMap.get(lobbyId).currDrawerId()) {
        this.gameMap.get(lobbyId).changeDrawerId(this.server, socket.id);
      }

      this.gameMap.get(lobbyId).removePlayer(oldSockId);
    }
  }

  @SubscribeMessage('setWord')
  handleSetWord(socket: Socket, data: string): void {
    const lobbyId = data[0];
    const word = data[1];

    if (socket.id != this.gameMap.get(lobbyId).currDrawerId()) {
      return;
    }

    this.gameMap.get(lobbyId).setCurrentWord(word);
    this.server.to(lobbyId).emit('wordLength', word.length);
  }

  @SubscribeMessage('draw')
  handleDraw(socket: Socket, data: string): void {
    const lobbyId: string = data[0];
    const xPos = Number(data[1]);
    const yPos = Number(data[2]);
    const color: string = data[3];

    // Ensure only current drawer draws on canvas
    if (socket.id != this.gameMap.get(lobbyId).currDrawerId()) {
      return;
    }

    // Add shape to shape buffer
    this.gameMap.get(lobbyId).addShape({ x: xPos, y: yPos, currColor: color });
  }

  @SubscribeMessage('guessDrawing')
  handleGuessDrawing(socket: Socket, data: string): void {
    const lobbyId: string = data[0];
    const currMsg: string = data[1];

    const currGame: DrawSm = this.gameMap.get(lobbyId);

    // Ensure the drawer does not type in chat
    if (socket.id == currGame.currDrawerId()) {
      return;
    }

    if (currMsg == currGame.currWord()) {
      this.server.to(lobbyId).emit('correctGuess', socket.id);
    } else {
      this.server.to(lobbyId).emit('playerGuess', currMsg);
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
