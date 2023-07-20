<script>
  import Navbar from "../generic/Navbar.svelte";
  import GameWindow from "../generic/GameWindow.svelte";

  export let background;
  export let width;
  export let height;

  export let start;
  export let update;

  export let socket;
  export let subscribeToEvents;
</script>

<div class="min-h-screen flex flex-col">
  <Navbar />

  <div class="flex mt-4 justify-center items-center">
    <GameWindow {background} {width} {height} {start} {update} {socket} {subscribeToEvents} />
  </div>
</div>
