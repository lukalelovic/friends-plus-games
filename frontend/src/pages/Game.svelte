<script>
    import Navbar from "../generic/Navbar.svelte";
    import Konva from "konva";
    import { onMount, onDestroy } from "svelte";

    let stage, layer, rect;
    let stepSize = 5; // Movement amount
    let keys = {};

    onMount(() => {
        // create a new stage and layer
        stage = new Konva.Stage({
            container: "game-container",
            width: 500,
            height: 500,
        });

        layer = new Konva.Layer();

        // create a new rectangle shape for the background
        const background = new Konva.Rect({
            x: 0,
            y: 0,
            width: stage.width(),
            height: stage.height(),
            fill: "lightblue",
        });

        // add the background shape to the layer
        layer.add(background);

        // create a new rectangle shape
        rect = new Konva.Rect({
            x: 50,
            y: 50,
            width: 100,
            height: 100,
            fill: "red",
            draggable: true,
        });

        // add the rectangle shape to the layer
        layer.add(rect);

        // add the layer to the stage
        stage.add(layer);

        // add event listener for keydown event
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        // start the animation loop
        requestAnimationFrame(animate);
    });

    function handleKeyDown(event) {
        keys[event.keyCode] = true;
    }

    function handleKeyUp(event) {
        keys[event.keyCode] = false;
    }

    function animate() {
        // check if any arrow keys are pressed
        if (keys[37]) {
            // left arrow
            rect.x(rect.x() - stepSize);
        }
        if (keys[38]) {
            // up arrow
            rect.y(rect.y() - stepSize);
        }
        if (keys[39]) {
            // right arrow
            rect.x(rect.x() + stepSize);
        }
        if (keys[40]) {
            // down arrow
            rect.y(rect.y() + stepSize);
        }

        // redraw the layer
        layer.batchDraw();

        // request the next animation frame
        requestAnimationFrame(animate);
    }

    onDestroy(() => {
        // remove the event listeners when the component is destroyed
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
    });
</script>

<div class="min-h-screen flex flex-col">
    <Navbar />

    <div class="flex mt-4 justify-center items-center">
        <div id="game-container" />
    </div>
</div>
