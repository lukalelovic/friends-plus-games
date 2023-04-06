const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.static(__dirname));

// Setup server on port 3000
const server = app.listen(8080, () => {
    console.log('Server started on port 8080');
});

// Socket.IO logic
const io = require('socket.io')(server);
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

const playerJson = () => JSON.stringify([...players]);