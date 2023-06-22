<script>
  import { onMount } from "svelte";
  import Navbar from "../generic/Navbar.svelte";
  import GameCard from "../widgets/GameCard.svelte";
  import axios from "axios";
  import { PROD_URI } from "../config";
  import FeaturedCard from "../widgets/FeaturedCard.svelte";

  let cards = [];
  let featuredCard;

  onMount(() => {
    axios
      .get(`${PROD_URI}/games/all`)
      .then((res) => {
        cards = res.data;
      })
      .catch((err) => console.error(err));

    axios
      .get(`${PROD_URI}/games/featured`)
      .then((res) => {
        featuredCard = res.data;
      })
      .catch((err) => console.error(err));
  });
</script>

<div class="min-h-screen flex flex-col">
  <Navbar />
  <div class="flex flex-col items-center">
    {#if featuredCard}
      <div class="p-3">
      <FeaturedCard card={featuredCard} />
      </div>
    {/if}
      
  <div class="flex flex-wrap justify-center p-3 space-y-2 sm:space-y-0 sm:space-x-2">
      {#each cards as card}
        <GameCard {card} />
      {/each}
    </div>
  </div>
</div>
