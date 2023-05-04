import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Player } from '../models/player';

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URI, // TODO: environment variable
    },
    path: '/lobby'
})
export class LobbyGateway {
    @WebSocketServer()
    server;

    lobbyMap = new Map(); // Contains <lobby id>:<player object>
    lobbyId;

    handleConnection(socket) {
        console.log(`Client ${socket.id} connected to the lobby namespace`);
    }

    @SubscribeMessage('joinLobby')
    handleJoinLobby(socket, data) {
        this.lobbyId = data[0];
        socket.join(this.lobbyId);

        console.log(`Game lobby ${this.lobbyId} created`);

        // Initialize player object
        let p = new Player(socket.id, 0, 0);
        p.setName(data[1]);

        // Add player to lobby map list
        let lobbyList = [];
        if (this.lobbyMap.has(this.lobbyId)) {
            lobbyList = this.lobbyMap.get(this.lobbyId);
        }
        lobbyList.push(p);
        this.lobbyMap.set(this.lobbyId, lobbyList);

        // Send update of all players in lobby
        this.server.to(this.lobbyId).emit('lobbyState', lobbyList);
        console.log(`Player ${socket.id} (${p.name}) joined lobby ${this.lobbyId}`);
    }

    handleDisconnect(socket) {
        if (!this.lobbyId) {
            return;
        }

        let lobbyList = this.lobbyMap.get(this.lobbyId);
        if (!lobbyList) {
            return;
        }

        // Find player from lobby list and remove
        const playerIndex = lobbyList.findIndex(p => p.id === socket.id);
        lobbyList.splice(playerIndex, 1);

        // Update lobby map
        this.lobbyMap.set(this.lobbyId, lobbyList);

        // Send update of all players in lobby
        this.server.to(this.lobbyId).emit('lobbyState', lobbyList);
        console.log(`Player ${socket.id} left lobby ${this.lobbyId}`);

        if (lobbyList.length === 0) {
            this.lobbyMap.delete(this.lobbyId);
            console.log(`Lobby ${this.lobbyId} has ended`);
        }
    }
}