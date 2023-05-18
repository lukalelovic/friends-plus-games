<script>
  import Konva from "konva";
  import { onDestroy, onMount } from "svelte";
  import { io } from "socket.io-client";
  import Game from "../pages/Game.svelte";
  import { detectCollisions } from "./detectCollisions";
  import { PROD_SOCKET_URI, TAG_PATH } from "../config";
  import { Keyboard } from "./Keyboard";

  let lobbyId, oldSocketId;

  const JOIN_WAIT = 150;
  const MOVE_OFFSET = 20;
  const PLAYER_SIZE = 50;
  const FIXED_DELAY = 50;

  let keyboard = new Keyboard();
  let socket;
  let playerCircles = {};
  let taggedId;

  let canSendMovementUpdate = true;

  onMount(() => {
    socket = io(PROD_SOCKET_URI, {
      path: TAG_PATH,
      transports: ["websocket"],
    });

    setTimeout(() => {
      const url = new URL(window.location.href);

      lobbyId = url.pathname.substring(url.pathname.lastIndexOf("/") + 1);
      oldSocketId = url.searchParams.get("player");

      socket.emit("joinGame", lobbyId, oldSocketId);
    }, JOIN_WAIT);
  });

  function start(stage, layer) {
    // Any initialization logic
  }

  function update(stage, layer) {
    drawPlayer(stage, layer);
    checkPlayerMovement(stage);
    checkTagPlayer();
  }

  function drawPlayer(stage, layer) {
    if (!socket) return;

    socket.on("currentState", (player) => {
      let fill;

      if (player.id == taggedId) {
        fill = "red";
      } else if (player.id == socket.id) {
        fill = "green";
      } else {
        fill = "blue";
      }

      updateShape(stage, layer, player.id, player.x, player.y, fill);
    });

    socket.on("playerTagged", (newId) => {
      if (taggedId) {
        updateShape(
          stage,
          layer,
          taggedId,
          playerCircles[taggedId].x(),
          playerCircles[taggedId].y(),
          taggedId == socket.id ? "green" : "blue"
        );
      }

      updateShape(
        stage,
        layer,
        newId,
        playerCircles[newId].x(),
        playerCircles[newId].y(),
        "red"
      );

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

  function checkPlayerMovement(stage) {
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
    if (keyboard.isKeyPressed(39) && xPos < stage.width() - PLAYER_SIZE) {
      // Right arrow
      xPos = xPos + MOVE_OFFSET;
    }
    if (keyboard.isKeyPressed(40) && yPos < stage.height() - PLAYER_SIZE) {
      // Down arrow
      yPos = yPos + MOVE_OFFSET;
    }

    // Send position to server (if it changed)
    if (
      canSendMovementUpdate &&
      (xPos != playerShape.x() || yPos != playerShape.y())
    ) {
      socket.emit("movePlayer", lobbyId, xPos, yPos);
      canSendMovementUpdate = false;

      setTimeout(() => {
        canSendMovementUpdate = true;
      }, FIXED_DELAY);
    }
  }

  function checkTagPlayer() {
    if (!taggedId) {
      console.log(taggedId);
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

  function updateShape(stage, layer, id, x, y, fill) {
    let circ = playerCircles[id];

    if (!circ) {
      // Create new
      circ = new Konva.Circle({
        x: x,
        y: y,
        radius: PLAYER_SIZE,
        fill: "green",
      });

      layer.add(circ);

      // Initialize random x,y pos
      if (socket.id == id) {
        socket.emit(
          "movePlayer",
          lobbyId,
          getRandomPos(PLAYER_SIZE, stage.width() - PLAYER_SIZE), // random x
          getRandomPos(PLAYER_SIZE, stage.height() - PLAYER_SIZE) // random y
        );
      }
    } else {
      // Else update
      circ.setAttrs({
        x: x,
        y: y,
        fill: fill,
      });
    }

    playerCircles[id] = circ;
  }

  function getRandomPos(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  onDestroy(() => {
    keyboard.cleanup();
  });
</script>

<Game background="black" width={1280} height={640} {start} {update} />
