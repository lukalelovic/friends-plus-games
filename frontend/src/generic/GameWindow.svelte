<script>
    import Konva from "konva";
    import { onMount } from "svelte";

    let stage, layer;

    export let width;
    export let height;

    export let start;
    export let update;

    onMount(() => {
        // create a new stage and layer
        stage = new Konva.Stage({
            container: "game-container",
            width: width,
            height: height,
        });

        layer = new Konva.Layer();

        // Call start method
        if (typeof start === "function") {
            start(stage, layer);
        }

        // Add the layer to the stage
        stage.add(layer);

        // Start update loop
        if (typeof update === "function") {
            requestAnimationFrame(function gameLoop() {
                update(stage, layer);
                
                // Redraw the layer
                layer.batchDraw();

                // Re-execute game loop
                requestAnimationFrame(gameLoop);
            });
        }
    });
</script>

<div id="game-container" />
