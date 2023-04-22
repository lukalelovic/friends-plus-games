<script>
    import Konva from "konva";
    import { onDestroy } from "svelte";
    import Game from "../pages/Game.svelte";

    const MOVE_OFFSET = 5;
    let keys = {};
    let player;

    function start(layer) {
        // Add player shape to layer
        player = new Konva.Rect({
            x: 50,
            y: 50,
            width: 100,
            height: 100,
            fill: "red",
        });
        layer.add(player);
    }

    function update(layer) {
        // add event listeners for keydown and keyup events
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        checkKeys();
    }

    function handleKeyDown(event) {
        keys[event.keyCode] = true;
    }

    function handleKeyUp(event) {
        keys[event.keyCode] = false;
    }

    function checkKeys() {
        // check if any arrow keys are pressed
        if (keys[37]) {
            // left arrow
            player.x(player.x() - MOVE_OFFSET);
        }
        if (keys[38]) {
            // up arrow
            player.y(player.y() - MOVE_OFFSET);
        }
        if (keys[39]) {
            // right arrow
            player.x(player.x() + MOVE_OFFSET);
        }
        if (keys[40]) {
            // down arrow
            player.y(player.y() + MOVE_OFFSET);
        }
    }

    onDestroy(() => {
        // remove the event listeners when the component is destroyed
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
    });
</script>

<Game background="lightblue" {start} {update} />