<script>
  import { onMount } from "svelte";
  import GameWindow from "../generic/GameWindow.svelte";
  import Navbar from "../generic/Navbar.svelte";
  import { ChatStack } from "./generic/chatStack";
  import { io } from "socket.io-client";
  import { DRAW_PATH, PROD_SOCKET_URI } from "../config";
  import { joinGame } from "./generic/joinGame";
  import { checkIsMobile } from "./generic/isMobile";
  import Konva from "konva";

  let socket;
  let lobbyId;

  let isMobile = false;
  let isMouseDown = false;

  let chats = new ChatStack();
  let allowedColors = [];

  let players = {};

  let currColor = 'black';
  let currMsg = "";

  onMount(() => {
    socket = io(PROD_SOCKET_URI, {
      path: DRAW_PATH,
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
    allowedColors.push(selectionColor(10, 10, 'blue'));
    allowedColors.push(selectionColor(40, 10, 'red'));
    allowedColors.push(selectionColor(70, 10, 'green'));
    allowedColors.push(selectionColor(100, 10, 'yellow'));
    allowedColors.push(selectionColor(130, 10, 'black'));

    allowedColors.forEach((color) => {
      layer.add(color);
    });
  }

  function update(stage, layer) {
    socket.on("playerJoined", (currPlayers, oldSockId) => {
      if (oldSockId in players) {
        delete players[oldSockId];
      }

      currPlayers.forEach(player => {
        players[player.id] = {
          name: player.name,
        };
      });
    });

    socket.on('playerGuess', (msg) => {
      chats.push(msg);
    });

    socket.on('correctGuess', (playerId) => {
      chats.push( (socket.id == playerId) ? 'You' : players[playerId].name + " correctly guessed the drawing!");
    });
  
    if (isMouseDown) {
      let colorClicked = false;

      allowedColors.forEach((color) => {
        if (color.intersects(stage.getPointerPosition())) {
          currColor = color.fill();
          colorClicked = true;
        }
      });

      if (!colorClicked) {
        layer.add(new Konva.Circle({
          x: stage.getPointerPosition().x,
          y: stage.getPointerPosition().y,
          radius: 10,
          fill: currColor
        }));
      }
    }
  }

  function selectionColor(x, y, color) {
    const colorRect = new Konva.Rect({
      x: x,
      y: y,
      width: 25,
      height: 25,
      fill: color
    });

    return colorRect;
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleSendChat();
    }
  }

  function handleTypeMsg(e) {
    currMsg = e.target.value;
  }

  function handleSendChat() {
    socket.emit("guessDrawing", lobbyId, currMsg);
    currMsg = "";
  }

  function handleMouseDown() {
    isMouseDown = true;
  }

  function handleMouseUp() {
    isMouseDown = false;
  }
</script>

<div class="min-h-screen flex flex-col">
  <Navbar />

  {#if isMobile}
    <div class="flex flex-col justify-center items-center">
      <h1 class="mt-2 text-4xl text-white">
        Game is not playable on mobile devices. Sorry :/
      </h1>
    </div>
  {:else}
    <div class="flex flex-col justify-center items-center">
      <h1 class="mt-2 text-4xl text-white">Draw Something!</h1>

      <div class="flex flex-wrap mt-4" on:mousedown={handleMouseDown} on:mouseup={handleMouseUp}>
        <GameWindow
          background="white"
          width={640}
          height={480}
          {start}
          {update}
        />

        <div
          class="w-full md:w-auto ml-0 md:ml-8 flex flex-col min-h-full border-4 border-gray-900"
        >
          <div
            class="flex flex-col bg-gray-800 p-4 h-96 overflow-y-scroll flex-1"
          >
            {#each chats.all() as chat}
              <p class="p-1 bg-gray-700 rounded-md text-white">{chat}</p>
            {/each}
          </div>
          <div class="flex border-t-4 border-gray-900">
            <input
              type="text"
              class="bg-gray-800 text-white focus:outline-none p-2 w-full md:w-56"
              placeholder="Type your guess..."
              bind:value={currMsg}
              on:input={handleTypeMsg}
              on:keydown={handleKeyDown}
            />
            <button
              class="bg-gray-700 text-white px-4 py-2"
              on:click={handleSendChat}>Send</button
            >
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Bungee+Shade&display=swap');

  h1 {
    font-family: 'Bungee Shade', sans-serif;
  }

  ::-webkit-scrollbar {
    width: 12px;
    background-color: #202027;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 6px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #555;
  }
</style>
