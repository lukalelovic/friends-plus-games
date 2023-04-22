<script>
    import Navbar from "../generic/Navbar.svelte";
    import GameWindow from "../generic/GameWindow.svelte";

    export let background;
    export let start;
    export let update;
</script>

<div class="min-h-screen flex flex-col">
    <Navbar />

    <div class="flex mt-4 justify-center items-center">
        <GameWindow background={background} {start} {update} />
    </div>
</div>
