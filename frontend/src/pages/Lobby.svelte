<script>
    import UserList from "../widgets/UserList.svelte";
    import JoinForm from "../forms/JoinForm.svelte";

    import { onMount } from "svelte";
    import io from "socket.io-client";
    import Navbar from "../generic/Navbar.svelte";
    import StandardButton from "../generic/StandardButton.svelte";

    const urlParams = window.location.pathname.substring(1);
    const gameTitle = urlParams.substring(
        urlParams.indexOf("/") + 1,
        urlParams.lastIndexOf("/")
    );
    const lobbyId = urlParams.substring(urlParams.lastIndexOf("/") + 1);

    export let socket;

    onMount(() => {
        // Connect to the Socket.io endpoint on the backend
        socket = io("http://localhost:3000/lobby");

        socket.on("lobbyState", (players) => {
            playerNames = [];

            players.forEach((player) => {
                playerNames.push(player.name);
            });
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
        socket.emit("startGame", lobbyId);
    }
</script>

<div class="min-h-screen flex flex-col">
    <Navbar />

    <div class="justify-center py-12 sm:px-6 lg:px-8">
        {#if showForm}
            <JoinForm title={gameTitle} handleSubmit={joinLobby} />
        {:else}
            <UserList {playerNames} />

            <div class="mt-3">
                <StandardButton filled={false} clickEvent={startGame} value="Start Game" />
            </div>
        {/if}
    </div>
</div>
