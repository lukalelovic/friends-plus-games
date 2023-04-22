<script>
    import Konva from "konva";
    import { onMount } from "svelte";

    let stage, layer;

    export let background;
    export let start;
    export let update;

    onMount(() => {
        // create a new stage and layer
        stage = new Konva.Stage({
            container: "game-container",
            width: 500,
            height: 500,
        });

        layer = new Konva.Layer();

        // create a new rectangle shape for the background
        const bg = new Konva.Rect({
            x: 0,
            y: 0,
            width: stage.width(),
            height: stage.height(),
            fill: background,
        });

        // add the background shape to the layer
        layer.add(bg);

        // Call start method
        if (typeof start === "function") {
            start(layer);
        }

        // Add the layer to the stage
        stage.add(layer);

        // Start update loop
        if (typeof update === "function") {
            requestAnimationFrame(function gameLoop() {
                update(layer);
                
                // Redraw the layer
                layer.batchDraw();

                // Re-execute game loop
                requestAnimationFrame(gameLoop);
            });
        }
    });
</script>

<div id="game-container" />
