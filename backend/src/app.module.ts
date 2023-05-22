import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { User } from './entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { SocketsModule } from './sockets/sockets.module';
import { JwtModule } from '@nestjs/jwt';
import { Game } from './entities/game.entity';
import { GameController } from './controllers/game.controller';
import { GameService } from './services/game.service';

@Module({
  imports: [
    SocketsModule,
    ConfigModule.forRoot(),
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true,
      entities: [User, Game],
    }),
    TypeOrmModule.forFeature([User, Game]),
  ],
  controllers: [UserController, GameController],
  providers: [UserService, GameService],
})
export class AppModule {}
