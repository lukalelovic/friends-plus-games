<script>
    export let card;
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

<a href="lobby/{card.title}/{card.url}" class="bg-white card rounded-lg px-2 py-12 h-64 w-1/4 shadow-lg overflow-hidden">
    <div class="card-image rounded-lg border-2 border-quaternary" />
    <div class="card-content flex-1">
        <div class="font-bold text-xl my-2">{card.title}</div>
        <p class="text-gray-700 text-base">
            {card.description}
        </p>
    </div>
</a>