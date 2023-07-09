<script>
  import Konva from "konva";
  import { onDestroy, onMount } from "svelte";
  import { io } from "socket.io-client";
  import Game from "../pages/Game.svelte";
  import { detectCollisions } from "./generic/detectCollisions";
  import { PROD_SOCKET_URI, TAG_PATH } from "../config";
  import { Keyboard } from "./generic/Keyboard";
  import { joinGame } from "./generic/joinGame";
  import { checkIsMobile } from "./generic/isMobile";
  import Navbar from "../generic/Navbar.svelte";

  let lobbyId;
  let isMobile = false;

  const WIDTH = 1280;
  const HEIGHT = 640;

  const MOVE_OFFSET = 10;
  const PLAYER_SIZE = 50;

  let keyboard = new Keyboard();

  let socket;

  let playerCircles = {};
  let playerText = {};
  let taggedId;

  onMount(() => {
    socket = io(PROD_SOCKET_URI, {
      path: TAG_PATH,
      transports: ["websocket"],
    });

    // Connecte to the server
    socket.on("connect", () => {
      console.log("Connected to server");
      lobbyId = joinGame(socket);
    });

    isMobile = checkIsMobile();
  });

  function start(stage, layer) {
    // Any initialization logic
  }

  function update(stage, layer) {
    checkPlayerMovement();
    checkTagPlayer();
  }

  function subscribeToEvents(stage, layer) {
    // Create new player shape
    socket.on("playerJoined", (players, oldSockId, newSockId) => {
      if (oldSockId in playerCircles) {
        playerCircles[oldSockId].destroy();
        playerText[oldSockId].destroy();

        // If old socket ID was tagged, set tagged ID to new one
        if (taggedId == oldSockId) {
          taggedId = newSockId;
        }

        delete playerCircles[oldSockId];
        delete playerText[oldSockId];
      }

      players.forEach((player) => {
        console.log(player);
        if (player.id in playerCircles) return;

        const fill = player.id == socket.id ? "green" : "blue";

        const circ = new Konva.Circle({
          x: getRandomPos(PLAYER_SIZE, WIDTH - PLAYER_SIZE), // random x
          y: getRandomPos(PLAYER_SIZE, HEIGHT - PLAYER_SIZE), // random y
          radius: PLAYER_SIZE,
          fill: fill,
        });

        const txt = new Konva.Text({
          x: circ.x(),
          y: circ.y(),
          text: player.name,
          fontSize: 14,
          fontFamily: "Arial",
          fill: "white",
          align: "center",
          width: circ.radius(),
          height: circ.radius(),
        });

        txt.offset({ x: txt.width() / 2, y: txt.height() / 2 });

        layer.add(circ);
        layer.add(txt);
        playerCircles[player.id] = circ;
        playerText[player.id] = txt;

        // Initialize random x,y pos
        socket.emit("movePlayer", lobbyId, circ.x(), circ.y());
      });
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
        const txt = playerText[socketId];

        shape.remove();
        shape.destroy();

        txt.remove();
        txt.destroy();
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
    if (xPos != playerShape.x() || yPos != playerShape.y()) {
      socket.emit("movePlayer", lobbyId, xPos, yPos);
    }
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
    const txt = playerText[id];
    if (!circ || !txt) return;

    circ.setAttrs({
      fill: fill,
      x: x,
      y: y,
    });

    txt.setAttrs({
      x: x,
      y: y,
    });

    playerCircles[id] = circ;
    playerText[id] = txt;
  }

  function getRandomPos(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  onDestroy(() => {
    keyboard.cleanup();
  });
</script>

{#if isMobile}
  <div class="min-h-screen flex flex-col">
    <Navbar />

    <div class="flex flex-col justify-center items-center">
      <h1 class="mt-2 text-4xl text-white">
        Game is not playable on mobile devices. Sorry :/
      </h1>
    </div>
  </div>
{:else}
  <Game background="black" width={WIDTH} height={HEIGHT} 
    {start} {update} {socket} {subscribeToEvents} />
{/if}
