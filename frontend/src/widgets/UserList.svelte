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

<ul id="player-list" class="space-y-2">
    {#each playerNames as name}
        <li class="py-4 sm:px-6 rounded-lg shadow-lg space-y-4 bg-quaternary text-white flex items-center justify-between outline outline-none">{name}</li>
    {/each}
</ul>