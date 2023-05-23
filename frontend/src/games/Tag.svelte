<script>
  import Konva from "konva";
  import { onDestroy, onMount } from "svelte";
  import { io } from "socket.io-client";
  import Game from "../pages/Game.svelte";
  import { detectCollisions } from "./detectCollisions";
  import { PROD_SOCKET_URI, TAG_PATH } from "../config";
  import { Keyboard } from "./Keyboard";

  let lobbyId, oldSocketId;

  const WIDTH = 1280;
  const HEIGHT = 640;

  const MOVE_OFFSET = 10;
  const PLAYER_SIZE = 50;

  let keyboard = new Keyboard();

  let socket;

  let playerCircles = {};
  let taggedId;

  onMount(() => {
    socket = io(PROD_SOCKET_URI, {
      path: TAG_PATH,
      transports: ["websocket"],
    });

    // Connecte to the server
    socket.on('connect', () => {
      console.log('Connected to server');

      joinGame();
    });
  });

  function start() {
    // Any initialization logic
  }

  function update(stage, layer) {
    updatePlayers(stage, layer);

    checkPlayerMovement();
    checkTagPlayer();
  }

  function joinGame() {
    const url = new URL(window.location.href);

    lobbyId = url.pathname.substring(url.pathname.lastIndexOf("/") + 1);
    oldSocketId = url.searchParams.get("player");

    socket.emit("joinGame", lobbyId, oldSocketId);
  }

  function updatePlayers(stage, layer) {
    if (!socket) return;

    // Create new player shape
    socket.on("playerJoined", (player) => {
      if (player.id in playerCircles) return;

      const fill = player.id == socket.id ? "green" : "blue";

      const circ = new Konva.Circle({
        x: getRandomPos(PLAYER_SIZE, WIDTH - PLAYER_SIZE), // random x
        y: getRandomPos(PLAYER_SIZE, HEIGHT - PLAYER_SIZE), // random y
        radius: PLAYER_SIZE,
        fill: fill,
      });

      layer.add(circ);
      playerCircles[player.id] = circ;

      // Initialize random x,y pos
      socket.emit("movePlayer", lobbyId, circ.x(), circ.y());
    });

    socket.on("currentState", (player) => {
      let fill;

      if (player.id == taggedId) {
        fill = "red";
      } else if (player.id == socket.id) {
        fill = "green";
      } else {
        fill = "blue";
      }

      updateShape(player.id, player.x, player.y, fill);
    });

    socket.on("playerTagged", (newId) => {
      // Update previously tagged player (if any)
      if (taggedId) {
        updateShape(
          taggedId,
          playerCircles[taggedId].x(),
          playerCircles[taggedId].y(),
          taggedId == socket.id ? "green" : "blue"
        );
      }

      // Update color of newly tagged player
      updateShape(
        newId,
        playerCircles[newId].x(),
        playerCircles[newId].y(),
        "red"
      );

      // Store newly tagged ID
      taggedId = newId;
    });

    socket.on("playerLeft", (socketId) => {
      if (socketId in playerCircles) {
        const shape = playerCircles[socketId];

        shape.remove();
        shape.destroy();
      }
    });
  }

  function checkPlayerMovement() {
    const playerShape = playerCircles[socket.id];
    if (!playerShape) return;

    let xPos = playerShape.x();
    let yPos = playerShape.y();

    // Check if any arrow keys are pressed
    if (keyboard.isKeyPressed(37) && xPos > PLAYER_SIZE) {
      // Left arrow
      xPos = xPos - MOVE_OFFSET;
    }
    if (keyboard.isKeyPressed(38) && yPos > PLAYER_SIZE) {
      // Up arrow
      yPos = yPos - MOVE_OFFSET;
    }
    if (keyboard.isKeyPressed(39) && xPos < WIDTH - PLAYER_SIZE) {
      // Right arrow
      xPos = xPos + MOVE_OFFSET;
    }
    if (keyboard.isKeyPressed(40) && yPos < HEIGHT - PLAYER_SIZE) {
      // Down arrow
      yPos = yPos + MOVE_OFFSET;
    }

    // Send position to server (if it changed)
    socket.emit("movePlayer", lobbyId, xPos, yPos);
  }

  function checkTagPlayer() {
    if (!taggedId) {
      let pIds = Object.keys(playerCircles);
      let randId = pIds[Math.floor(Math.random() * pIds.length)];

      socket.emit("tagPlayer", lobbyId, randId);
      taggedId = randId;
    }

    // If you are tagged and delay has passed, check collisions
    const collidedId = detectCollisions(
      playerCircles[socket.id], // current shape
      playerCircles // all shapes
    );

    // Collision occurred? Other player is it!
    if (collidedId) {
      // If I'm not 'it' and I collided with the tagged player
      if (taggedId != socket.id && collidedId == taggedId) {
        socket.emit("tagPlayer", lobbyId, socket.id); // I'm 'it'
      } else if (taggedId == socket.id) {
        // Else if I am 'it' and I collided with someone
        socket.emit("tagPlayer", lobbyId, collidedId); // Other person is 'it'
      }
    }
  }

  function updateShape(id, x, y, fill) {
    const circ = playerCircles[id];
    if (!circ) return;

    circ.setAttrs({
      fill: fill,
      x: x,
      y: y,
    });
    
    playerCircles[id] = circ;
  }

  function getRandomPos(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  onDestroy(() => {
    keyboard.cleanup();
  });
</script>

<Game background="black" width={WIDTH} height={HEIGHT} {start} {update} />
