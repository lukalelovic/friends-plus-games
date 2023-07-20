<script>
  import UserList from "../widgets/UserList.svelte";
  import JoinForm from "../forms/JoinForm.svelte";
  import { navigate } from "svelte-routing";
  import { onMount } from "svelte";
  import io from "socket.io-client";
  import Navbar from "../generic/Navbar.svelte";
  import StandardButton from "../generic/StandardButton.svelte";
  import { LOBBY_PATH, PROD_SOCKET_URI } from "../config";

  const urlParams = window.location.pathname.substring(1);
  let gameTitle = decodeURI(
    urlParams.substring(urlParams.indexOf("/") + 1, urlParams.lastIndexOf("/"))
  );
  const lobbyId = urlParams.substring(urlParams.lastIndexOf("/") + 1);

  export let socket;

  let requiredText = null;

  let maxSize = 0;
  let minSize = 0;

  let gameUrl = gameTitle == "The King's Feast" ? "mafia" : gameTitle.toLowerCase();

  if (gameTitle == "draw-something") {
    gameTitle = "Draw Something";
  }

  onMount(() => {
    socket = io(PROD_SOCKET_URI, {
      path: LOBBY_PATH,
      transports: ["websocket"],
    });

    socket.on("lobbyState", (players) => {
      playerNames = [];

      players.forEach((player) => {
        playerNames.push(player.name);
      });
    });

    socket.on("gameStarted", () => {
      navigate(`/game/${gameUrl}/${lobbyId}?player=${socket.id}`);
    });
  });

  export let showForm = true;
  export let playerNames = [];

  // Join lobby function
  export function joinLobby(e) {
    e.preventDefault();
    const name = e.target.elements.name.value;

    showForm = false;

    socket.emit("joinLobby", lobbyId, name);
  }

  function startGame() {
    switch (gameUrl) {
      case "tag":
        minSize = 2;
        maxSize = 5;
        break;
      case "mafia":
        minSize = 4;
        maxSize = 10;
        break;
      case "wackbox":
        minSize = 3;
        maxSize = 15;
        break;
      case "draw-something":
        minSize = 2;
        maxSize = 10;
      default:
        minSize = 2;
        maxSize = 20;
        break;
    }

    if (playerNames.length < minSize) {
      requiredText = "Game requires at least "+minSize+" players."
      return;
    } else if (playerNames.length > maxSize) {
      requiredText = "Game has maximum lobby size of "+maxSize+".";
      return;
    } else {
      requiredText = null;
    }

    // Emit a 'startGame' event to the server with the lobby ID
    socket.emit("startGame", lobbyId, gameUrl);
    navigate(`/game/${gameUrl}/${lobbyId}?player=${socket.id}`);
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(window.location.href);
  }
</script>

<div class="min-h-screen flex flex-col">
  <Navbar />
  <div class="justify-center py-12 sm:px-6 lg:px-8">
    {#if showForm}
      <JoinForm title={gameTitle} handleSubmit={joinLobby} />
    {:else}
      <div class="flex flex-col justify-center items-center my-3 space-x-2">
        <h1 class="text-3xl font-bold mb-4 text-white text-center">
          Share the invite link with friends:
        </h1>

        <div class="bg-black text-white space-x-6 flex items-center p-4">
          <p class="font-mono break-all text-lg">{window.location.href}</p>

          <button
            class="bg-white text-black p-2 rounded hover:bg-gray-200 focus:bg-gray-200"
            on:click={copyToClipboard}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="#4f46e5"
                d="M19,21H7a2,2,0,0,1-2-2V7A2,2,0,0,1,7,5H8V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v1h1a2,2,0,0,1,2,2V19A2,2,0,0,1,19,21ZM10,5a1,1,0,0,0-1,1v1h6V6a1,1,0,0,0-1-1Zm8,14a1,1,0,0,0-1-1H8a1,1,0,0,0-1,1v-8H19Z"
              />
              <rect fill="#4f46e5" x="9" y="9" width="10" height="10" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      {#if requiredText}
        <h2 class="p-2 text-lg font-bold text-white text-center">{requiredText}</h2>
      {/if}

      <UserList {playerNames} />

      <div class="mt-3">
        <StandardButton
          filled={false}
          clickEvent={startGame}
          value="Start Game"
        />
      </div>
    {/if}
  </div>
</div>
