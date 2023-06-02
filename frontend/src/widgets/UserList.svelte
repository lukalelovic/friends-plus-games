<script>
    export let playerNames;
</script>

<ul id="player-list" class="space-y-2">
    {#each playerNames as name}
        <li class="py-4 px-6 rounded-lg shadow-lg space-y-4 bg-quaternary text-white flex items-center justify-between outline outline-none">{name}</li>
    {/each}
</ul>