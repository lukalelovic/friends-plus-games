<script>
    import Navbar from "../generic/Navbar.svelte";

    const cards = [
        { title: "Card 1", description: "This is the first card" },
        { title: "Card 2", description: "This is the second card" },
        { title: "Card 3", description: "This is the third card" },
    ];
</script>

<style>
    .card-image {
        width: 100%;
        height: 75%;
        background-image: url("https://via.placeholder.com/500x500.png?text=Game+Image");
        background-size: cover;
        background-position: center;
    }
</style>

<div class="min-h-screen flex flex-col">
    <Navbar />
    <div class="gradient-background flex-1 flex flex-col justify-center items-center">
        <h1 class="text-white text-5xl font-bold mb-8">
            Welcome to Games with Friends
        </h1>
        <div class="min-w-full flex flex-wrap justify-center space-x-4">
            {#each cards as card}
                <a href="/lobby" class="bg-white rounded-lg px-2 py-16 w-1/4 shadow-lg overflow-hidden card">
                    <div class="card-image rounded-lg" />
                    <div class="card-content flex-1">
                        <div class="font-bold text-xl mb-2">{card.title}</div>
                        <p class="text-gray-700 text-base">
                            {card.description}
                        </p>
                    </div>
                </a>
            {/each}
        </div>
    </div>
</div>
