<script>
    import Konva from "konva";
    import { onMount } from "svelte";

    let stage, layer;

    export let background;
    export let width;
    export let height;

    export let start;
    export let update;

    export let socket;
    export let subscribeToEvents;

    let subscribed = false;

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

            start(stage, layer);
        }

        // Add the layer to the stage
        stage.add(layer);

        // Start update loop
        if (typeof update === "function") {
            requestAnimationFrame(function gameLoop() {
                if (socket && !subscribed) {
                  if (typeof subscribeToEvents === "function") {
                    subscribeToEvents(stage, layer);
                  }

                  subscribed = true;
                }

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
