const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');

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

// Socket.IO logic
const players = new Map();

io.on('connection', (socket) => {
    console.log(`Socket ${socket.id} connected`);
    //socket.emit('update-lobby', JSON.stringify([...players]))

    socket.on('join-lobby', (name) => {
      console.log(`Player ${name} joined the lobby`);

      socket.join('lobby');

      // Add player to player map
      players.set(socket.id, name);
      io.to('lobby').emit('update-lobby', playerJson());
    });

    socket.on('disconnect', () => {
      // Remove player from lobby
      if (players.has(socket.id)) {
        players.delete(socket.id);
        io.to('lobby').emit('update-lobby', playerJson());
      }

      console.log(`Socket ${socket.id} disconnected`);
    });
});

// Run server on port 3000
server.listen(3000, () => {
    console.log('Server listening on port 3000');
});

const playerJson = () => JSON.stringify([...players]);