<script>
    import UserList from "../widgets/UserList.svelte";
    import JoinForm from "../forms/JoinForm.svelte";
    import { navigate } from "svelte-routing";
    import { onMount } from "svelte";
    import io from "socket.io-client";
    import Navbar from "../generic/Navbar.svelte";
    import StandardButton from "../generic/StandardButton.svelte";
    import { DEV_URI } from "../config";

    const urlParams = window.location.pathname.substring(1);
    const gameTitle = urlParams.substring(
        urlParams.indexOf("/") + 1,
        urlParams.lastIndexOf("/")
    );
    const lobbyId = urlParams.substring(urlParams.lastIndexOf("/") + 1);

    export let socket;

    onMount(() => {
        // Connect to the Socket.io endpoint on the backend
        socket = io(DEV_URI, { path: '/lobby', transports: ['websocket'] });

        socket.on("lobbyState", (players) => {
            playerNames = [];

            players.forEach((player) => {
                playerNames.push(player.name);
            }); 
        });

        socket.on("gameStarted", () => {
            navigate(`/game/tag/${lobbyId}?player=${socket.id}`);
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
        // Emit a 'startGame' event to the server with the lobby ID
        socket.emit("startGame", lobbyId, gameTitle);
        navigate("/game/tag/" + lobbyId);
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
                <h1 class="text-3xl font-bold mb-4 text-white">
                    Share the invite link with friends:
                </h1>

                <div class="bg-black text-white p-4 space-x-6 flex items-center justify-between">
                    <p class="font-mono text-lg">{window.location.href}</p>

                    <button
                        class="bg-white text-black p-2 rounded hover:bg-gray-200 focus:bg-gray-200"
                        on:click={copyToClipboard}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path fill="#4f46e5" d="M19,21H7a2,2,0,0,1-2-2V7A2,2,0,0,1,7,5H8V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v1h1a2,2,0,0,1,2,2V19A2,2,0,0,1,19,21ZM10,5a1,1,0,0,0-1,1v1h6V6a1,1,0,0,0-1-1Zm8,14a1,1,0,0,0-1-1H8a1,1,0,0,0-1,1v-8H19Z"/>
                            <rect fill="#4f46e5" x="9" y="9" width="10" height="10" rx="1"/>
                        </svg>                          
                    </button>
                </div>
            </div>

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
