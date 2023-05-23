<script>
  import { onMount } from "svelte";
  import Navbar from "../generic/Navbar.svelte";
  import GameCard from "../widgets/GameCard.svelte";
  import axios from "axios";
  import { PROD_URI } from "../config";

  let cards = [];

  onMount(() => {
    axios
      .get(`${PROD_URI}/games/all`)
      .then((res) => {
        cards = res.data;
      })
      .catch((err) => console.error(err));
  });
</script>

<div class="min-h-screen flex flex-col">
  <Navbar />
  <div class="flex flex-col items-center">
    <div class="min-w-full flex flex-wrap mt-4 justify-center space-x-4">
      {#each cards as card}
        <GameCard {card} />
      {/each}
    </div>
  </div>
</div>
