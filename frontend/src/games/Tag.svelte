<script>
    import Konva from "konva";
    import { onDestroy } from "svelte";
    import { io } from "socket.io-client";
    import Game from "../pages/Game.svelte";

    const MOVE_OFFSET = 5;
    let keys = {};

    const socket = io("http://localhost:3000/tag-game");
    let players = [];

    socket.on("join", (player) => {
        players.push(player);
    });

    function start(stage, layer) {
        socket.on("currentState", (state) => {
            // Update the local player list with the latest state from the server
            players = state;

            // Remove all existing player shapes from the stage
            layer.destroyChildren();

            // create a new rectangle shape for the background
            const bg = new Konva.Rect({
                x: 0,
                y: 0,
                width: stage.width(),
                height: stage.height(),
                fill: "black",
            });

            // add the background shape to the layer
            layer.add(bg);

            // Add each player shape to layer
            players.forEach((player) => {
                const rect = new Konva.Rect({
                    x: player.x,
                    y: player.y,
                    width: 100,
                    height: 100,
                    fill: player.id === socket.id ? "blue" : "red",
                });
                layer.add(rect);
            });
        });
    }

    function update(stage, layer) {
        // add event listeners for keydown and keyup events
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        checkPlayerMovement(stage);
    }

    function handleKeyDown(event) {
        keys[event.keyCode] = true;
    }

    function handleKeyUp(event) {
        keys[event.keyCode] = false;
    }

    function checkPlayerMovement(stage) {
        const player = players.find((p) => p.id === socket.id);
        if (player == undefined) {
            return;
        }

        // check if any arrow keys are pressed
        if (keys[37] && player.x > 0) {
            // left arrow
            player.x = player.x - MOVE_OFFSET;
        }
        if (keys[38] && player.y > 0) {
            // up arrow
            player.y = player.y - MOVE_OFFSET;
        }
        if (keys[39] && player.x < stage.width()-100) {
            // right arrow
            player.x = player.x + MOVE_OFFSET;
        }
        if (keys[40] && player.y < stage.height()-100) {
            // down arrow
            player.y = player.y + MOVE_OFFSET;
        }

        console.log(player.x-100, player.y-100, stage.width(), stage.height());

        // Send the new position to the server
        socket.emit("movePlayer", socket.id, player.x, player.y);
    }

    onDestroy(() => {
        // remove the event listeners when the component is destroyed
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
    });
</script>

<Game width={1280} height={640} {start} {update} />
