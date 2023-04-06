<script>
    export let socket;

    let playerNames = [];

    socket.on('update-lobby', (playerJson) => {
        const players = new Map(JSON.parse(playerJson));

        playerNames = [];

        // Re-add players to lobby
        for (const [socketId, playerName] of players) {
            playerNames.push(playerName);
        }
    });
</script>

<ul id="player-list" class="bg-gradient-to-r bg-gradient-from-tertiary bg-gradient-to-primary rounded-lg shadow-lg">
    {#each playerNames as name}
        <li class="py-4 sm:px-6 flex items-center justify-between outline outline-none">{name}</li>
    {/each}
</ul>