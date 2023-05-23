<script>
  // import { onMount } from "svelte";
  // import { validateToken } from "../auth";

  export let card;

  // TODO: implement login/continue as guest modal
  function handleClick() {
    // if (!loggedIn) {
    //   showModal = true;
    // }

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
  class="max-w-sm rounded overflow-hidden shadow-lg bg-secondary hover:shadow-2xl">
  <img src={card.gameImage} alt="Game Image" class="w-full">
  
  <div class="px-6 py-4 text-white">
    <div class="font-bold text-xl mb-2">{card.title}</div>
    <p class="text-base">
      {card.description}
    </p>
  </div>
</button>