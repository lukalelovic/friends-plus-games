<script>
  import { onMount } from "svelte";
  import Navbar from "../generic/Navbar.svelte";
  import { getMe } from "../auth";
    import md5 from "crypto-js/md5";

  let user = null;

  onMount(async () => {
    user = await getMe();
  });

  function generateGravatar() {
    return `https://www.gravatar.com/avatar/${md5(user.email)}?d=identicon&s=100`;
  }

  // Calculate the win percentage
  $: winPercentage = user && (user.numWins / (user.numWins + user.numLosses)) * 100;
</script>

<div class="min-h-screen flex flex-col">
  <Navbar />
  <div class="flex flex-col items-center p-4">
    {#if user}
        <div class="flex flex-col items-center space-y-2 rounded-md min-w-full text-white">
          <div class="flex flex-wrap p-6 items-center justify-start mt-3">
            <img
              class="rounded-full h-64 w-64 border-2 border-white"
              src={generateGravatar()}
              alt="Gravatar"
            />
            
            <div class="p-3">
              <h1 class="text-2xl font-semibold">{user.userName}</h1>
              <p>Joined: {new Date(user.dateCreated).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div class="flex flex-row space-x-6 p-6">
            <div class="flex flex-row font-bold">Wins: <p class="px-1 text-green-500">{user.numWins}</p></div>
            <div class="flex flex-row font-bold">Losses: <p class="px-1 text-red-500">{user.numLosses}</p></div>
            <div class="flex flex-row font-bold">Games Won: <p class="px-1 text-primary">{winPercentage ? winPercentage.toFixed(2) : 0}%</p></div>
          </div>
        </div>
      {/if}
  </div>
</div>
