<script>
    import Navbar from "../generic/Navbar.svelte";
    import GameCard from "../widgets/GameCard.svelte";

    const cards = [
        { title: "Card 1", description: "This is the first card" },
        { title: "Card 2", description: "This is the second card" },
        { title: "Card 3", description: "This is the third card" },
    ];
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
