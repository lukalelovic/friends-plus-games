import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Dependencies } from '@nestjs/common';
import { TagGateway } from './games/tag.gateway';
import { Player } from '../models/player';

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URI,
    },
    path: '/lobby'
})
@Dependencies(TagGateway)
export class LobbyGateway {
    @WebSocketServer()
    server;

    lobbyMap = new Map(); // Contains <lobby id>:<player object>
    lobbyId;

    constructor(tagGatway) {
        this.tagGatway = tagGatway;
    }

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

    @SubscribeMessage('startGame')
    handleStartGame(socket, data) {
        let id = data[0];
        let gameName = data[1];

        // Send current lobby to matching game name
        if (gameName.toLowerCase() === "tag") {
            // Get the current lobby state
            const lobbyList = this.lobbyMap.get(id);

            // Get all player id to object mapping
            let playerMap = new Map();
            lobbyList.forEach(player => {
                playerMap.set(player.id, player);
            });
            
            // Update tag map with players
            this.tagGatway.setPlayerMap(playerMap);

            this.server.to(this.lobbyId).emit('gameStarted');
            console.log(`Starting ${gameName} game for lobby ${this.lobbyId}...`);
        } else {
            console.error('Invalid game name: ' + gameName);
        }
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