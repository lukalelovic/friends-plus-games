<script>
  // import { onMount } from "svelte";
  // import { validateToken } from "../auth";

  export let card;
  let showModal = false;

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
  <img src={card.gameImage} alt="Game Image" class="w-full h-auto">

  <!-- {#if showModal}
    <dialog id="guest-modal">
      <button on:click={() => showModal = false}>x</button>
    </dialog>
  {/if} -->
  
  <div class="px-4 py-3 text-white">
    <div class="font-bold text-xl mb-2">{card.title}</div>
    <p class="text-base">
      {card.description}
    </p>
  </div>
</button>