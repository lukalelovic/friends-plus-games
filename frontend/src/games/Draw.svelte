<script>
  import { onMount } from "svelte";
  import GameWindow from "../generic/GameWindow.svelte";
  import Navbar from "../generic/Navbar.svelte";
  import { io } from "socket.io-client";
  import { DRAW_PATH, PROD_SOCKET_URI } from "../config";
  import { joinGame } from "./generic/joinGame";
  import { checkIsMobile } from "./generic/isMobile";
  import Konva from "konva";

  let socket;
  let lobbyId;

  let isMobile = false;
  let isMouseDown = false;

  let chats = [];
  let allowedColors = [];

  let players = {};

  let isDrawer = true;
  let correctGuess = false;
  let showScores = false;

  let currDrawer = "";
  let timeLeft = 60;
  let blankWord = "___";

  let currShapes = [];

  let currColor = 'black';
  let currMsg = "";

  onMount(() => {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.scrollTop = chatContainer.scrollHeight - chatContainer.clientHeight;

    socket = io(PROD_SOCKET_URI, {
      path: DRAW_PATH,
      transports: ["websocket"],
    });

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
    // listen for mouse down
    if (isMouseDown) {
      let colorClicked = false;

      allowedColors.forEach((color) => {
        if (color.intersects(stage.getPointerPosition())) {
          currColor = color.fill();
          colorClicked = true;
        }
      });

      if (!colorClicked && isDrawer && blankWord.length > 0) {
        const x = stage.getPointerPosition().x;
        const y = stage.getPointerPosition().y;

        layer.add(new Konva.Circle({
          x: x,
          y: y,
          radius: 10,
          fill: currColor
        }));

        socket.emit("draw", lobbyId, x, y, currColor);
      }
    }
  }

  function subscribeToEvents(stage, layer) {
    socket.on("playerJoined", (currPlayers, oldSockId, newSockId) => {
      if (oldSockId in players) {
        delete players[oldSockId];

        if (currDrawer == oldSockId) {
          if (newSockId == socket.id) {
            currDrawer = 'You';
          } else {
            currDrawer = players[newSockId].name;
          }
        }
      }

      console.log(currPlayers);

      currPlayers.forEach(player => {
        players[player.id] = {
          name: player.name,
        };
      });
    });

    socket.on("assignDrawer", (drawerId) => {      
      // reset variables
      blankWord = "";
      showScores = false;
      isDrawer = false;
      correctGuess = false;

      currShapes.forEach((shape) => {
        shape.remove();
        shape.destroy();
      });

      currShapes.length = 0;

      // am I the current drawer?
      if (socket.id == drawerId) {
        isDrawer = true;
        currDrawer = 'You';
      } else {
        currDrawer = players[drawerId].name;
      }
    });

    socket.on("wordLength", (len) => {
      blankWord = "_".repeat(len);
    });

    socket.on("roundCountdown", (currCount) => {
      timeLeft = currCount;
    });

    socket.on("playerGuess", (playerId, msg) => {
      chats = [...chats, players[playerId].name + ': ' + msg];
    });

    socket.on("correctGuess", (playerId) => {
      if (socket.id == playerId) correctGuess = true;

      chats = [...chats, ((socket.id == playerId) ? 'You' : players[playerId].name) + " correctly guessed the drawing!"];
    });

    socket.on("playerScores", (drawPlayers) => {
      // TODO: set player scores for each player
      Object.entries(drawPlayers).forEach(([playerId, player]) => {
        players[playerId].score = player.points;
      });

      showScores = true;
    });

    socket.on("playerDraw", (shapes) => {
      if (isDrawer) return;

      shapes.forEach(shape => {
        const circ = new Konva.Circle({
          x: shape.x,
          y: shape.y,
          radius: 10,
          fill: shape.currColor
        });

        currShapes.push(circ);
        layer.add(circ);
      });
    });

    socket.on("playerLeft", (playerId) => {
      delete players[playerId];
    });
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

  function handleSetWord(e) {
    e.preventDefault();

    if (!isDrawer || blankWord != "") {
      return;
    }

    socket.emit('setWord', lobbyId, e.target[0].value);
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
    if (isDrawer || correctGuess) return;

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
      
      {#if currDrawer != ""}
        <p class="mt-2 text-lg text-white">{currDrawer} {(currDrawer == 'You') ? 'are' : 'is'} drawing!</p>
        <p class="my-2 text-xl text-white">{(blankWord.length > 0) ? blankWord : 'Waiting on '+currDrawer+'...'}</p>
        <p class="mt-1 text-md text-white">{timeLeft} seconds</p>
      {/if}

      <div class="flex flex-wrap mt-4" on:mousedown={handleMouseDown} on:mouseup={handleMouseUp}>
        {#if blankWord == "" && isDrawer}
          <div class="absolute justify-center items-center bg-gray-800 p-0 mt-5 z-40">
            <div class="text-white border border-solid bg-gray-800 border-white p-4 w-96">
              <form on:submit={handleSetWord} class="flex flex-col">
                <input type="text" placeholder="Enter word..." class="p-3 text-black" min="1" max="20" />
                <button type="submit" class="p-3 bg-white text-gray-800">Submit</button>
              </form>
            </div>
          </div>
        {/if}

        {#if showScores}
          <div class="absolute bg-gray-800 p-0 mt-5 z-40">
            <div class="text-white border border-solid border-white p-4 w-96">
              {#each players.values() as player}
                <p class="text-md p-2 bg-gray-600">{player.name}: {player.score}</p>
              {/each}
            </div>
          </div>
        {/if}

        <GameWindow
          background="white"
          width={640}
          height={480}
          {start}
          {update}
          {socket}
          {subscribeToEvents}
        />

        <div
          class="w-full h-96 md:w-auto ml-0 md:ml-8 flex flex-col border-4 border-gray-900"
        >
          <div
            id="chat-container"
            class="flex-1 bg-gray-800 p-4 overflow-y-scroll space-y-1"
          >
            {#each chats as chat}
              <p class="px-2 py-1 bg-gray-700 rounded-md text-white">{chat}</p>
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
