<script>
  import { onMount } from "svelte";
  import { io } from "socket.io-client";
  import { PROD_SOCKET_URI, WACKBOX_PATH } from "../config";
  import { joinGame } from "./generic/joinGame";
  import Navbar from "../generic/Navbar.svelte";

  let socket;
  let lobbyId;
  let players = {};
  let currAnswers = {};

  let myAnswer = "";
  let didAnswer = false;

  let isVoting = false;
  let votedId = null;

  let promptCountdownVal = 10;

  let currPrompt = "";
  let roundNum = 0;

  let winnerId = null;

  onMount(() => {
    socket = io(PROD_SOCKET_URI, {
      path: WACKBOX_PATH,
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
    socket.on('playerJoined', (currPlayers, oldSockId) => {
      if (oldSockId in players) {
        delete players[oldSockId];
      }

      currPlayers.forEach(player => {
        players[player.id] = {
          name: player.name + ((player.id == socket.id) ? ' (YOU) ' : ''),
          score: 0,
        };
      });
    });

    socket.on('promptCount', (pCountdown) => {
      promptCountdownVal = pCountdown;

      isVoting = false;
      currAnswers = {};
      didAnswer = false;
      myAnswer = "";
    });

    socket.on('roundPrompt', (currRound, prompt) => {
      promptCountdownVal = null;

      currPrompt = prompt;
      roundNum = currRound;
    });

    socket.on("answerWait", (answerWait) => {
      promptCountdownVal = answerWait;
    });

    socket.on("voteWait", (voteWait) => {
      promptCountdownVal = voteWait;
      isVoting = true;
    });

    socket.on('roundAnswers', (currRound, answers) => {
      currAnswers = answers;
    });

    socket.on('scoreUpdate', (playerId, s) => {
      players[playerId].score = s;
      votedId = null;
    });

    socket.on('gameWinner', (playerId) => {
      winnerId = playerId;
    });

    socket.on('playerLeft', (playerId) => {
      players[playerId].name += " (DISCONNECTED)";
    });
  }

  function handleAnswerPrompt() {
    if (myAnswer == "") return;

    socket.emit('submitAnswer', lobbyId, myAnswer);
    didAnswer = true;
  }

  function handleCastVote(playerId) {
    // Can't vote for self
    if (playerId == socket.id || !isVoting || votedId) return;

    votedId = playerId;
    socket.emit('submitVote', lobbyId, playerId);
  }
</script>

<div class="min-h-screen flex flex-col">
  <Navbar />

  <div class="p-4">
    <div class="wackbox flex flex-col items-center min-h-screen text-white">
      <h1 class="text-3xl p-3">Wackbox</h1>
      
      {#if roundNum > 0}
        <h2 class="text-md p-3">Round {roundNum}</h2>
      {/if}

      {#if winnerId}
        <h3>{players[winnerId].name} wins!</h3>
      {/if}

      {#if promptCountdownVal}
        {#if isVoting}
          <h3>Voting ends in</h3>
        {:else if currPrompt != ""}
          <h3>Answers in</h3>
        {:else}
          <h3>Prompt in</h3>
        {/if}
        <h3>{promptCountdownVal}</h3>
      {/if}
      {#if currPrompt != ""}
        <h3>{currPrompt}</h3>

        {#if !didAnswer}
        <div class="flex flex-wrap space-x-2 space-y-2 sm:space-y-0 justify-center items-center mt-3 mb-2">
          <input
            class="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            placeholder="Your answer..."
            bind:value={myAnswer}
          />

          <button on:click={() => handleAnswerPrompt()} class="bg-white rounded-lg px-3 py-2 text-gray-700">Submit</button>
        </div>
        {/if}
      {/if}

      {#if votedId}
        <h3>You voted for {players[votedId].name}</h3>
      {/if}

      <div class="min-w-full flex flex-col justify-center p-3 space-y-2">
        {#each Object.entries(players) as [playerId, player]}
          <button on:click={() => handleCastVote(playerId)} class="flex flex-row justify-center items-center bg-[#5d119f] hover:bg-[#7e19d5] rounded-lg p-2 space-x-5">
            <div>{player.name}</div>

            {#if currAnswers[playerId]}
              <div>: {currAnswers[playerId]}</div>
            {/if}
            {#if player.score > 0}
              <div>- {player.score} points</div>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap'); /* Give me a fun google font */

  .wackbox {
    background: linear-gradient(135deg, #ff4081, #00b0ff);; /* Background color */
    font-family: 'Press Start 2P', cursive; /* Fun font */
  }

  h1, h2, h3 {
    font-family: 'Press Start 2P', cursive; /* Fun font */
  }
</style>
