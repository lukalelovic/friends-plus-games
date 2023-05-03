const socketIO = require('socket.io');
const Player = require('./player');

function initializeGames(server) {
    return socketIO(server, {
        cors: {
            origin: process.env.FRONTEND_URI, // TODO: environment variable
            methods: ['GET', 'POST'],
        }
    });
}

// Lobby socket.io code
const lobbyMap = new Map(); // Contains <lobby id>:<player object>

function handleLobbies(io) {
    const lobbyNamespace = io.of('/lobby');

    lobbyNamespace.on('connection', (socket) => {
        let lobbyId;

        socket.on('joinLobby', (id, name) => {
            lobbyId = id;
            socket.join(lobbyId);

            console.log(`Game lobby ${lobbyId} created`);

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
            lobbyNamespace.to(lobbyId).emit('lobbyState', lobbyList);

            console.log(`Player ${socket.id} (${p.name}) joined lobby ${lobbyId}`);
        });

        socket.on('startGame', (id, gameName) => {
            // Send current lobby to matching game name
            if (gameName.toLowerCase() === "tag") {
                // Get the current lobby state
                const lobbyList = lobbyMap.get(id);

                // Add all players in lobby to tagGameNamespace
                let playerMap = new Map();
                lobbyList.forEach(player => {
                    playerMap.set(player.id, player);
                });
                tagLobbyPlayerMap.set(lobbyId, playerMap);

            } else {
                console.error('Invalid game name: ' + gameName);
            }

            lobbyNamespace.to(lobbyId).emit('gameStarted');
            console.log(`Starting ${gameName} game for lobby ${lobbyId}...`);
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

            if (lobbyList.length == 0) {
                lobbyMap.delete(lobbyId);
                console.log(`Lobby ${lobbyId} has ended`);
            }
        });
    });
}

// Tag code
const tagLobbyPlayerMap = new Map(); // Contains <lobby id:><socketId:player>

function handleTag(io) {
    // Tag game socket.io code
    const tagGameNamespace = io.of('/tag-game');

    tagGameNamespace.on('connection', (socket) => {
        let lobbyId;
        let playerMap;

        socket.on('joinGame', (id, oldSockId) => {
            lobbyId = id;
            socket.join(lobbyId);

            // Game created with given lobby?
            if (tagLobbyPlayerMap.has(lobbyId)) {
                playerMap = tagLobbyPlayerMap.get(lobbyId);

                // Update socket mapping
                if (playerMap.has(oldSockId)) {
                    playerMap.set(socket.id, playerMap.get(oldSockId));
                    playerMap.delete(oldSockId);
                    playerMap.get(socket.id).id = socket.id;
                }

                // Return lobby players to the socket
                tagGameNamespace.to(lobbyId).emit('currentState', getPlayerJson());
                console.log(`Player ${socket.id} joined tag game ${lobbyId}`);
            } else {
                console.error(`Game lobby ${lobbyId} was not created.`);
            }
        });

        socket.on('movePlayer', (id, x, y) => {
            if (!playerMap) return;

            // Update the player's position in the players map
            const player = playerMap.get(id);
            if (player) {
                player.x = x;
                player.y = y;
            }
            playerMap.set(id, player);

            // Broadcast the new state to all connected clients
            tagGameNamespace.to(lobbyId).emit('currentState', getPlayerJson());
        });

        socket.on('disconnect', () => {
            if (!playerMap) return;

            // Remove player from lobby
            if (playerMap.has(socket.id)) {
                playerMap.delete(socket.id);
            }

            tagGameNamespace.to(lobbyId).emit('playerLeft', socket.id);
            console.log(`Socket ${socket.id} disconnected from game`);

            // End lobby session when all players disconnected
            if (playerMap.size == 0) {
                tagLobbyPlayerMap.delete(lobbyId);
                console.log(`Game session ${lobbyId} ended`);
            }
        });

        function getPlayerJson() {
            return JSON.stringify(Array.from(playerMap.values()));
        }
    });
}

module.exports = {initializeGames, handleLobbies, handleTag}