const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const Player = require('./Player');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: 'http://127.0.0.1:5173',
        methods: ['GET', 'POST'],
    }
});

app.use(cors());
app.use(express.static(__dirname));

// Lobby socket.io code
const lobbyNamespace = io.of('/lobby');
const lobbyMap = new Map(); // Contains <lobby id>:<player object>

lobbyNamespace.on('connection', (socket) => {
    let lobbyId;

    socket.on('joinLobby', (id, name) => {
        lobbyId = id;
        socket.join(lobbyId);

        // Initialize player object
        let p = new Player(socket.id, 0, 0);
        p.setName(name);

        // Add player to lobby map list
        let lobbyList = [];
        if (lobbyMap.has(lobbyId)) {
            lobbyList = lobbyMap.get(lobbyId);
        }
        lobbyList.push(p);
        lobbyMap.set(lobbyId, lobbyList);

        // Send update of all players in lobby
        socket.to(lobbyId).emit('lobbyState', lobbyList);

        console.log(`Player ${socket.id} (${p.name}) joined lobby ${lobbyId}`);
    });

    socket.on('startGame', (id) => {
        // Get the current lobby state and send it to the tag game namespace
        const state = getLobbyState(id);
        tagGameNamespace.to(lobbyId).emit('startGame', state);

        console.log(`Starting game for lobby ${lobbyId}`);
    });

    socket.on('disconnect', () => {
        let lobbyList = lobbyMap.get(lobbyId);
        if (lobbyList == undefined) {
            return;
        }

        // Find player from lobby list and remove
        let pNdx = lobbyList.findIndex(p => p.id == socket.id);
        lobbyList.splice(pNdx, 1);

        // Update lobby map
        lobbyMap.set(lobbyId, lobbyList);

        // Send update of all players in lobby
        socket.to(lobbyId).emit('lobbyState', lobbyList);
        console.log(`Player ${socket.id} left lobby ${lobbyId}`);
    });
});

// Tag game socket.io code
const tagGameNamespace = io.of('/tag-game');
const players = new Map();

tagGameNamespace.on('connection', (socket) => {
    const player = new Player(socket.id, 50, 50);
    players.set(socket.id, player);

    // Send the current game state to the new client
    socket.emit('join', player);

    socket.on('movePlayer', (id, x, y) => {
        // Update the player's position in the players map
        const player = players.get(id);
        if (player) {
            player.x = x;
            player.y = y;
        }

        // Broadcast the new state to all connected clients
        io.emit('currentState', Array.from(players.values()));
    });

    socket.on('disconnect', () => {
        // Remove player from lobby
        if (players.has(socket.id)) {
            players.delete(socket.id);
            // io.to('lobby').emit('update-lobby', playerJson());
        }

        console.log(`Socket ${socket.id} disconnected`);
    });
});

const port = process.env.PORT || 3000;

// Run server on port 3000
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});