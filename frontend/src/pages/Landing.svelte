<script>
    import Navbar from "../generic/Navbar.svelte";
    import GameCard from "../widgets/GameCard.svelte";

    const cards = [
        { title: "Tag", description: "Play tag with your friends!", url: generateLobbyID() },
    ];

    function generateLobbyID() { // TODO: a check with backend DB for used lobbies
        // Generate a random ID for the lobby
        return Math.random().toString(36).substring(2, 8);
    }
</script>

<div class="min-h-screen flex flex-col">
    <Navbar />
    <div class="gradient-background flex-1 flex flex-col items-center">
        <div class="min-w-full flex flex-wrap mt-4 justify-center space-x-4">
            {#each cards as card}
                <GameCard card={card} />
            {/each}
        </div>
    </div>
</div>
