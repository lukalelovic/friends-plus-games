<script>
  import Konva from "konva";
  import { onDestroy, onMount } from "svelte";
  import { io } from "socket.io-client";
  import Game from "../pages/Game.svelte";
  import { detectCollisions } from "./detectCollisions";
  import { PROD_SOCKET_URI, TAG_PATH } from "../config";

  let lobbyId, oldSocketId;

  const JOIN_WAIT = 150;
  const MOVE_OFFSET = 5;
  const PLAYER_SIZE = 50;

  let keys = {};

  let socket;
  let players = [];
  let playerCircles = {};
  let taggedPlayer;

  let canDetectCollisions = true;

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
    drawPlayers(stage, layer);

    // add event listeners for keydown and keyup events
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    checkPlayerMovement(stage);
  }

  function drawPlayers(stage, layer) {
    if (!socket) return;

    socket.on("currentState", (listString) => {
      // Update the local player list with the latest state from the server
      players = JSON.parse(listString);
      checkTagPlayer();

      // Add each player shape to layer
      players.forEach((player) => {
        let fill;

        if (taggedPlayer && player.id == taggedPlayer) {
          fill = "red";
        } else if (player.id == socket.id) {
          fill = "green";
        } else {
          fill = "blue";
        }

        // check if the player's rect already exists in playerCircles
        if (player.id in playerCircles) {
          // update the existing rect with the player's new position and color
          const circ = playerCircles[player.id];
          circ.setAttrs({
            x: player.x,
            y: player.y,
            fill: fill,
          });
          playerCircles[player.id] = circ;
        } else {
          // create a new rect for the player and add it to the layer and playerCircles
          const circ = new Konva.Circle({
            x: getRandomPos(PLAYER_SIZE, stage.width() - PLAYER_SIZE),
            y: getRandomPos(PLAYER_SIZE, stage.height() - PLAYER_SIZE),
            radius: PLAYER_SIZE,
            fill: fill,
          });

          layer.add(circ);
          playerCircles[player.id] = circ;
          socket.emit("movePlayer", lobbyId, socket.id, circ.x(), circ.y());
        }
      });
    });

    // Get the current tagged player
    socket.on("playerTagged", (p) => {
      taggedPlayer = p;
    });

    socket.on("playerLeft", (socketId) => {
      if (socketId in playerCircles) {
        const shape = playerCircles[socketId];

        shape.remove();
        shape.destroy();
      }
    });
  }

  function handleKeyDown(event) {
    keys[event.keyCode] = true;
  }

  function handleKeyUp(event) {
    keys[event.keyCode] = false;
  }

  function checkPlayerMovement(stage) {
    const player = players.find((p) => p.id === socket.id);
    if (player == undefined) {
      return;
    }

    // check if any arrow keys are pressed
    if (keys[37] && player.x > PLAYER_SIZE) {
      // left arrow
      player.x = player.x - MOVE_OFFSET;
    }
    if (keys[38] && player.y > PLAYER_SIZE) {
      // up arrow
      player.y = player.y - MOVE_OFFSET;
    }
    if (keys[39] && player.x < stage.width() - PLAYER_SIZE) {
      // right arrow
      player.x = player.x + MOVE_OFFSET;
    }
    if (keys[40] && player.y < stage.height() - PLAYER_SIZE) {
      // down arrow
      player.y = player.y + MOVE_OFFSET;
    }

    // Send the new position to the server
    socket.emit("movePlayer", lobbyId, socket.id, player.x, player.y);
  }

  function checkTagPlayer() {
    if (!taggedPlayer) {
      const randPlayer = players[Math.floor(Math.random() * players.length)];

      // Tag player at random (if no one is tagged)
      socket.emit(
        "tagPlayer",
        lobbyId,
        randPlayer.id
      );

      taggedPlayer = randPlayer.id;
    } else if (canDetectCollisions) {
      // Else if you are tagged, check collisions
      const collidedId = detectCollisions(
        playerCircles[socket.id],
        playerCircles
      );

      let youAreIt = (socket.id == taggedPlayer);

      // Collision occurred? Other player is it!
      if (collidedId) {
        socket.emit("tagPlayer", lobbyId, (youAreIt) ? collidedId : socket.id);
      }

      canDetectCollisions = false;
      setTimeout(() => {
        canDetectCollisions = true;
      }, 3000); // 500-milli-second cooldown period
    }
  }

  function getRandomPos(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  onDestroy(() => {
    // remove the event listeners when the component is destroyed
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  });
</script>

<Game background="black" width={1280} height={640} {start} {update} />
