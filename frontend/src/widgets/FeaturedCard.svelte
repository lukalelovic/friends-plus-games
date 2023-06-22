<script>
  export let card;

  function handleClick() {
    window.location.href = `lobby/${card.title}/` + generateLobbyID();
  }

  function generateLobbyID() {
    // TODO: a check with backend DB for used lobbies
    // Generate a random ID for the lobby
    return Math.random().toString(36).substring(2, 8);
  }
</script>

<button
  on:click={handleClick}
  class="flex flex-wrap items-center rounded shadow-lg bg-tertiary hover:shadow-2xl"
>
  <img
    src={"games/" + card.gameImage}
    alt="Game"
    class="w-full sm:w-1/2 h-auto object-cover"
  />

  <div class="flex flex-col w-full sm:w-1/2 text-white">
    <p class="text-white text-center text-lg p-3 italic">Featured Game</p>

    <div class="font-bold text-xl mb-2">{card.title}</div>
    <p class="text-base">
      {card.description}
    </p>

    <div class="relative p-3">
      <div class="flex justify-center space-x-2">
        {#each card.platforms as platform}
          <img
            src={"icons/" + platform.toLowerCase() + ".png"}
            class="w-6 h-5"
            alt={platform}
          />
        {/each}
      </div>
    </div>
  </div>
</button>
