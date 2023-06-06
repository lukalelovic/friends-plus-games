import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SocketsModule } from './sockets/sockets.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ConfigModule.forRoot(), SocketsModule, AuthModule],
})
export class AppModule {}
