import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Dependencies } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
@Dependencies(Server, Socket)
export class LobbyGateway {
    @WebSocketServer()
    server;
    
    @Bind(ConnectedSocket(), MessageBody())
    @SubscribeMessage('join-room')
    handleJoinRoom(client, room) {
        // Handle client joining a room
        client.join(room);
        console.log(`Client ${client.id} joined room ${room}`);
    }
}