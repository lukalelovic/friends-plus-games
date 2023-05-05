import { Module } from '@nestjs/common';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { LobbyGateway } from './lobby.gateway';
import { TagGateway } from './games/tag.gateway';

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
  ],
})
export class SocketsModule {}
