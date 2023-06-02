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

  const roleColor = {
    Assassin: "#B799FF",
    Noble: "#B70404",
    King: "#E8AA42",
    Herbalist: "#1B9C85",
    Jester: "#FF55BB",
  };

  onMount(() => {
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

      // if (currBg == nightBg) {
      //   switchBg(layer, true);
      // }
    });

    socket.on("nightCount", (nightNum, nightCount) => {
      topText = "Night " + nightNum;
      countDownValue = nightCount;

      isDay = false;
    });

    socket.on("voteResult", (winnerId) => {
      if (!winnerId || !players[winnerId]) {
        return;
      }

      topText = "Vote Result: " + players[winnerId].name;
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
</script>

<div class="min-h-screen flex flex-col">
  <Navbar />

  <div class="p-4">
    <div class="mafia flex flex-col items-center min-h-screen">
      <div class="text-white mb-4 text-2xl text-center p-3">
        <h1>{topText}</h1>
        <h2>{countDownValue} seconds</h2>
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
