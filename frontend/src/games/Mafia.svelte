<script>
  import Game from "../pages/Game.svelte";
  import { onMount } from "svelte";
  import { io } from "socket.io-client";
  import { MAFIA_PATH, PROD_SOCKET_URI } from "../config";
  import { joinGame } from "./joinGame";
  import Konva from "konva";

  const WIDTH=320;
  const HEIGHT=640;

  let socket;
  let lobbyId;

  let countDownText;
  let countDownValue = 10;
  const BG_COLOR = '#341835';

  let players = {};

  onMount(() => {
    socket = io(PROD_SOCKET_URI, {
      path: MAFIA_PATH,
      transports: ["websocket"],
    });

    // Connecte to the server
    socket.on("connect", () => {
      console.log("Connected to server");
      lobbyId = joinGame(socket);
    });
  });

  function start(stage, layer) {
    // Draw foreground color
    layer.add(new Konva.Rect({
      x: 0,
      y: 75,
      width: WIDTH,
      height: HEIGHT - 150,
      fill: '#edc586'
    }));

    // Add countdown text
    let startingStr = 'Starting in \n' + countDownValue.toString();
    countDownText = new Konva.Text({
      x: WIDTH / 6,
      y: HEIGHT / 3,
      fontFamily: 'Algerian',
      fontSize: 36,
      text: startingStr,
      fill: BG_COLOR,
      align: 'center'
    });

    layer.add(countDownText);
  }

  function update(stage, layer) {
    socket.on("playerJoined", (player) => {
      players[player.id] = {
        name: player.name,
        isAlive: true,
        roll: null
      }
    });

    socket.on('countingDown', (val) => {
      countDownText.text('Starting in \n' + val);
    });

    socket.on('assignRole', (playerId, role) => {
      console.log(players[playerId].name + ' was assigned to ' + role);
      players[playerId].role = role;
    });
  }
</script>

<Game background={BG_COLOR} width={WIDTH} height={HEIGHT} {start} {update} />
