import { Module } from '@nestjs/common';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { LobbyGateway } from './lobby.gateway';
import { TagGateway } from './games/tag.gateway';
import { GameGateway } from './games/game.gateway';
import { MafiaGateway } from './games/mafia.gateway';

@Module({
  providers: [
    {
      provide: 'SOCKET_IO',
      useFactory: () => {
        const httpServer = createServer();
        return new Server(httpServer, {
          cors: {
            origin: '*',
            methods: ['GET', 'POST'],
          },
        });
      },
    },
    LobbyGateway,
    TagGateway,
    MafiaGateway,
    GameGateway,
  ],
})
export class SocketsModule {}
