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

  const roleColor = {
    'Assassin': '#B799FF',
    'Noble': '#B70404',
    'King': '#E8AA42',
    'Herbalist': '#1B9C85',
    'Jester': '#FF55BB'
  }

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

    socket.on('beginCount', (val) => {
      countDownText.text('Starting in \n' + val);
    });

    socket.on('endBegin', () => {
      socket.emit('assignRoles', lobbyId);
    })

    socket.on('roleAssigned', (playerId, role) => {
      countDownText.destroy();

      console.log(players[playerId].name + ' was assigned to ' + role);
      players[playerId].role = role;

      if (playerId == socket.id) {
        const rolePrompt = new Konva.Text({
          x: WIDTH / 4,
          y: HEIGHT - 200,
          fontFamily: 'Algerian',
          fontSize: 24,
          text: 'Your Role is',
          fill: BG_COLOR,
          align: 'center'
        });
        layer.add(rolePrompt);

        layer.add(new Konva.Text({
          x: rolePrompt.x(),
          y: rolePrompt.y() + 36,
          fontFamily: 'Algerian',
          fontSize: 36,
          text: role,
          fill: roleColor[role],
          align: 'center'
        }));
      }
    });

    socket.on('beginGame', () => {
      console.log('Game is ready...');
    })
  }
</script>

<Game background={BG_COLOR} width={WIDTH} height={HEIGHT} {start} {update} />
