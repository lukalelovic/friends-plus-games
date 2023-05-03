const express = require('express');
const cors = require('cors');
const http = require('http');
const { initializeGames, handleLobbies, handleTag } = require('./games');
const typeorm = require("typeorm");

require('dotenv').config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.static(__dirname));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const dataSource = new typeorm.DataSource({
    type: "mariadb",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
});

dataSource
    .initialize()
    .then(() => {
        console.log('Success!');
    }).catch((err) => console.error(err));

// Set up games middleware
const io = initializeGames(server);
handleLobbies(io);
handleTag(io);

const port = process.env.PORT;

app.post('/login', (req, res) => {
    let data = req.body;
    console.log(data);

    // TODO: check user exists in database
    //res.send() // send back 200 or 400 response
});

// Run server on port 
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});