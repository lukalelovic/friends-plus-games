const express = require('express');
const cors = require('cors');
const http = require('http');
const { initializeGames, handleLobbies, handleTag } = require('./games');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.static(__dirname));

// Set up games middleware
const io = initializeGames(server);
handleLobbies(io);
handleTag(io);

const port = process.env.PORT;

// Run server on port 
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});