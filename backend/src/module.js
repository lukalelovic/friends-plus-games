import { Module, Injectable, Dependencies } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controller';
import { UserService } from './service';
import { User } from './entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { SocketsModule } from './sockets/sockets.module';

@Module({
    imports: [
        SocketsModule,
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: "mariadb",
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            synchronize: true,
            entities: [User],
        }),
        TypeOrmModule.forFeature([User]),
    ],
    providers: [UserService],
    controllers: [UserController],
})
export class AppModule { }