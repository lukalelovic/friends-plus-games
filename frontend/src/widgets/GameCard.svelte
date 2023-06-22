<script>
  // import { onMount } from "svelte";
  // import { validateToken } from "../auth";

  export let card;
  // let showModal = false;

  function handleClick() {
    window.location.href = `lobby/${card.title}/`+generateLobbyID();
  }

  function generateLobbyID() {
    // TODO: a check with backend DB for used lobbies
    // Generate a random ID for the lobby
    return Math.random().toString(36).substring(2, 8);
  }
</script>

<button
  on:click={handleClick}
  class="w-full max-w-sm rounded overflow-hidden shadow-lg bg-tertiary hover:shadow-2xl">
  <img src={'games/'+card.gameImage} alt="Game" class="w-full h-auto" />
  
  <div class="px-4 py-3 text-white">
    <div class="font-bold text-xl mb-2">{card.title}</div>
    <p class="text-base">
      {card.description}
    </p>

    <div class="relative p-3">
      <div class="absolute bottom-0 right-0 flex space-x-2">
        {#each card.platforms as platform}
          <img src={"icons/"+platform.toLowerCase()+".png"} class="w-6 h-5" alt={platform} />
        {/each}
      </div>
    </div>
  </div>
</button>