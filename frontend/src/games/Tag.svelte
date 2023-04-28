<script>
    import Konva from "konva";
    import { onDestroy, onMount } from "svelte";
    import { io } from "socket.io-client";
    import Game from "../pages/Game.svelte";

    let lobbyId, oldSocketId;

    const JOIN_WAIT = 150;
    const MOVE_OFFSET = 5;
    let keys = {};

    let socket;
    let players = [];
    let playerRects = {};

    onMount(() => {
        socket = io("http://localhost:3000/tag-game");

        setTimeout(() => {
            const url = new URL(window.location.href);

            lobbyId = url.pathname.substring(url.pathname.lastIndexOf("/") + 1);
            oldSocketId = url.searchParams.get("player");

            socket.emit("joinGame", lobbyId, oldSocketId);
        }, JOIN_WAIT);
    });

    function start(stage, layer) {
        // Any initialization logic
    }

    function update(stage, layer) {
        drawPlayers(stage, layer);

        // add event listeners for keydown and keyup events
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        checkPlayerMovement(stage);
    }

    function drawPlayers(stage, layer) {
        if (!socket) return;

        socket.on("currentState", (listString) => {
            // Update the local player list with the latest state from the server
            players = JSON.parse(listString);

            // Add each player shape to layer
            players.forEach((player) => {
                // check if the player's rect already exists in playerRects
                if (player.id in playerRects) {
                    // update the existing rect with the player's new position and color
                    const rect = playerRects[player.id];
                    rect.setAttrs({
                        x: player.x,
                        y: player.y,
                        fill: player.id === socket.id ? "blue" : "red",
                    });
                } else {
                    // create a new rect for the player and add it to the layer and playerRects
                    const rect = new Konva.Rect({
                        x: player.x,
                        y: player.y,
                        width: 100,
                        height: 100,
                        fill: player.id === socket.id ? "blue" : "red",
                    });
                    layer.add(rect);
                    playerRects[player.id] = rect;
                }
            });
        });
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
        if (keys[39] && player.x < stage.width() - 100) {
            // right arrow
            player.x = player.x + MOVE_OFFSET;
        }
        if (keys[40] && player.y < stage.height() - 100) {
            // down arrow
            player.y = player.y + MOVE_OFFSET;
        }

        // Send the new position to the server
        socket.emit("movePlayer", socket.id, player.x, player.y);
    }

    onDestroy(() => {
        // remove the event listeners when the component is destroyed
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
    });
</script>

<Game background="black" width={1280} height={640} {start} {update} />
