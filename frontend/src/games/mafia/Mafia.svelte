<script>
  import { onMount } from "svelte";
  import { io } from "socket.io-client";
  import { MAFIA_PATH, PROD_SOCKET_URI } from "../../config";
  import { joinGame } from "../generic/joinGame";
  import Navbar from "../../generic/Navbar.svelte";

  let socket;
  let lobbyId;

  let topText = "Starting in...";
  let countDownValue = 10;
  let isDay = false;

  let visitTarget = null;

  let players = {};

  let showDialog = false;

  const roleColor = {
    Assassin: "#B799FF",
    Noble: "#B70404",
    King: "#E8AA42",
    Herbalist: "#1B9C85",
    Jester: "#FF55BB",
  };

  onMount(() => {
    const dialog = document.getElementById('modal-dialog');
    dialog.addEventListener('close', closeModal);

    socket = io(PROD_SOCKET_URI, {
      path: MAFIA_PATH,
      transports: ["websocket"],
    });

    // Connecte to the server
    socket.on("connect", () => {
      console.log("Connected to server");
      lobbyId = joinGame(socket);
    });

    gameLoop();
  });

  function gameLoop() {
    socket.on("playerJoined", (player) => {
      players[player.id] = {
        name: player.name,
        isAlive: true,
        roll: null,
      };
    });

    socket.on("beginCount", (val) => {
      countDownValue = val;
    });

    socket.on("endBegin", () => {
      socket.emit("assignRoles", lobbyId);
    });

    socket.on("roleAssigned", (playerId, role) => {
      console.log(players[playerId].name + " was assigned to " + role);
      players[playerId].role = role;
    });

    socket.on("dayCount", (dayNum, dayCount) => {
      topText = "Day " + dayNum;
      countDownValue = dayCount;

      isDay = true;
    });

    socket.on("nightCount", (nightNum, nightCount) => {
      topText = "Night " + nightNum;
      countDownValue = nightCount;

      isDay = false;
    });

    socket.on("voteResult", (winnerId) => {
      topText = "Vote Result: ";

      if (!winnerId || !players[winnerId]) {
        topText += "Draw";
      }

      topText += players[winnerId].name;
      countDownValue = null;

      players[winnerId].name += " (VOTED OUT)";
    });

    socket.on("playerKilled", (playerId) => {
      players[playerId].name += " (KILLED)";
    });

    socket.on("numVisits", (playerId, numVisits) => {
      if (
        players[socket.id].role == "Noble" &&
        visitTarget &&
        visitTarget == playerId
      ) {
        topText = players[playerId] + " was visited " + numVisits + " times.";
      }
    });

    socket.on("playerLeft", (playerId) => {
      players[playerId].name += " (DISCONNECTED)";
    });

    socket.on("drawWin", () => {
      topText = "Game Draw";
      countDownValue = null;
    });

    socket.on("evilWin", () => {
      let assassin = null;

      for (const id in players) {
        if (players[id].hasOwnProperty('role') && players[id].role == 'Assassin') {
          assassin = players[id].name;
          break;
        }
      }

      topText = "Assassin ("+assassin+") Wins";
      countDownValue = null;
    });

    socket.on("goodWin", () => {
      topText = "King Wins!";
      countDownValue = null;
    });

    socket.on("jesterWin", (jesterId) => {
      topText = "Jester "+players[jesterId].name+" Wins!";
      countDownValue = null;
    });
  }

  function handleAction(playerId) {
    if (isDay) {
      socket.emit("castVote", lobbyId, playerId);
      console.log("Vote has been cast against " + players[playerId].name);
    } else {
      socket.emit("nightAction", lobbyId, playerId);
      console.log("Action will be performed against " + players[playerId].name);

      if (players[socket.id].role == "Noble") {
        visitTarget = playerId;
      }
    }
  }

  function getRoleColor() {
    return roleColor[players[socket.id].role];
  }

  function openModal() {
    showDialog = true;
  }

  function closeModal() {
    showDialog = false;
  }
</script>

<div class="min-h-screen flex flex-col">
  <Navbar />

  <div class="p-4">
    <button on:click={openModal} class="absolute mt-1 ml-1 float-right text-white px-3 py-1 bg-slate-400 sm:bg-transparent font-bold sm:hover:text-[#ffbf09] rounded-lg">?</button>

    <dialog id="modal-dialog" class="bg-none p-0 mt-5 z-40" open={showDialog}>
      <div class="mafia text-white border border-solid border-[#ffbf09] p-4 w-96">
        <h2 class="text-xl text-center">How to Play <b class="text-[#ffbf09]">The King's Feast</b></h2>
        <div>
          <h3 class="text-center underline text-lg">Roles</h3>

          <div class="space-y-4">
            <div class="flex space-x-2 flex-wrap">
              Assassin - Wins by eliminating all players. Each night the assassin eliminates 1 player, unless that player is healed.
            </div>
            <div class="flex space-x-2 flex-wrap">
              King - 1 vote counts as two each voting day. Wins when the Assassin is voted out.
            </div>
            <div class="flex space-x-2 flex-wrap">
              Herbalist - Can heal 1 player each night (except self). Wins with the King.
            </div>
            <div class="flex space-x-2 flex-wrap">
              Jester - Wins when voted out.
            </div>
            <div class="flex space-x-2 flex-wrap">
              Noble - Can spy on 1 player each night, and see how many people visited that player. Wins with the King.
            </div>
          </div>
        </div>

        <div class="flex justify-center mt-3">
          <button on:click={closeModal} class="bg-gray-500 hover:bg-gray-600 p-1 rounded-lg">Close</button>
        </div>
      </div>
    </dialog>    

    <div class="mafia flex flex-col items-center min-h-screen">
      <div class="text-white mb-4 text-2xl text-center p-3">
        <h1>{topText}</h1>
        {#if (countDownValue)}
          <h2>{countDownValue} seconds</h2>
        {/if}
      </div>

      <div class="mb-4">
        {#each Object.entries(players) as [playerId, player]}
          <button
            class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2 mb-2"
            on:click={() => handleAction(playerId)}
          >
            {player.name}
          </button>
        {/each}
      </div>

      {#if socket && players[socket.id] && players[socket.id].hasOwnProperty("role")}
        <div class="mt-16 text-white text-center text-xl bg-[#21182d]">
          Your Role:
          <h3 style={`color: ${getRoleColor()};`}>
            {players[socket.id].role}
          </h3>
        </div>
      {/if}
    </div>

    <div class="relative flex justify-center">
      <img class="absolute object-cover bottom-0 z-10 h-96 w-auto" src="/game-imgs/mafia-bg-long.png" alt="">
    </div>
  </div>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair:wght@300&display=swap');

  .mafia {
    background-color: #21182d;
    font-family: 'Playfair', serif;
  }
</style>
