import { Module } from '@nestjs/common';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { LobbyGateway } from './lobby.gateway';
import { TagGateway } from './games/gateways/tag.gateway';
import { GameGateway } from './games/gateways/game.gateway';
import { MafiaGateway } from './games/gateways/mafia.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { WackboxGateway } from './games/gateways/wackbox.gateway';
import { DrawGateway } from './games/gateways/draw.gateway';

@Module({
  imports: [AuthModule],
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
    WackboxGateway,
    DrawGateway,
  ],
})
export class SocketsModule {}
