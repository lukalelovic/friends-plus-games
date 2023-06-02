<script>
  import Game from "../../pages/Game.svelte";
  import { onMount } from "svelte";
  import { io } from "socket.io-client";
  import { MAFIA_PATH, PROD_SOCKET_URI } from "../../config";
  import { joinGame } from "../generic/joinGame";
  import Konva from "konva";
  import { roleGroup } from "./layout";
  import { createButton } from "../generic/button";

  const WIDTH = 320;
  const HEIGHT = 640;

  let socket;
  let lobbyId;

  let topText;
  let countDownValue = 10;
  let isDay = false;

  let dayBg;
  let nightBg;

  const BG_COLOR = "#341835";

  let players = {};

  const roleColor = {
    Assassin: "#B799FF",
    Noble: "#B70404",
    King: "#E8AA42",
    Herbalist: "#1B9C85",
    Jester: "#FF55BB",
  };

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
    Konva.Image.fromURL("/games/mafia-bg-day.png", (img) => {
      dayBg = img;

      dayBg.width(WIDTH);
      dayBg.height(HEIGHT);

      dayBg.moveToBottom();

      layer.add(dayBg);

      // Add countdown text
      let startingStr = "Starting in \n" + countDownValue.toString();
      topText = new Konva.Text({
        x: WIDTH / 6,
        y: 100,
        fontFamily: "Algerian",
        fontSize: 36,
        text: startingStr,
        fill: 'white',
        align: "center",
      });

      topText.moveToTop();

      layer.add(topText);
    });

    Konva.Image.fromURL("/games/mafia-bg-night.png", (img) => {
      nightBg = img;

      nightBg.width(WIDTH);
      nightBg.height(HEIGHT);

      nightBg.moveToBottom();
    });
  }

  function update(stage, layer) {
    socket.on("playerJoined", (player) => {
      players[player.id] = {
        name: player.name,
        isAlive: true,
        roll: null,
      };
    });

    socket.on("beginCount", (val) => {
      topText.text("Starting in \n" + val);
    });

    socket.on("endBegin", () => {
      socket.emit("assignRoles", lobbyId);
    });

    socket.on("roleAssigned", (playerId, role) => {
      console.log(players[playerId].name + " was assigned to " + role);
      players[playerId].role = role;

      if (playerId == socket.id) {
        layer.add(
          roleGroup(WIDTH / 4, HEIGHT - 200, BG_COLOR, role, roleColor[role])
        );
      }
    });

    socket.on("dayCount", (dayNum, dayCount) => {
      topText.text("Day " + dayNum + "\n" + dayCount);
      isDay = true;
      topText.x(WIDTH / 3);

      // layer.remove(nightBg);
      // layer.add(dayBg);
      // layer.draw();

      let prevY = topText.y() + 50;

      if (dayNum == 1) {
        for (const playerId in players) {
          const player = players[playerId];

          players[playerId].button = createButton(
            player.name,
            WIDTH / 3,
            prevY + 50,
            BG_COLOR
          );

          players[playerId].button.on("click", () => {
            if (isDay) {
              socket.emit("castVote", lobbyId, playerId);
              console.log("Vote has been cast against " + player.name);
            } else {
              socket.emit("nightAction", lobbyId, playerId);
              console.log("Action will be performed against " + player.name);
            }
          });

          layer.add(players[playerId].button);
        }
      }
    });

    socket.on("nightCount", (nightNum, nightCount) => {
      topText.text("Night " + nightNum + "\n" + nightCount);
      isDay = false;

      // layer.remove(dayBg);
      // layer.add(nightBg);
      // layer.draw();

      topText.x(WIDTH / 4);
    });

    socket.on("voteResult", (winnerId) => {
      if (!winnerId || !players[winnerId]) {
        return;
      }

      topText.text("Vote Result: \n" + players[winnerId].name);
      topText.x(WIDTH / 6);

      // TODO: vote out action (kill them?)
    });

    // TODO: check disconnect of players
  }
</script>

<Game background={BG_COLOR} width={WIDTH} height={HEIGHT} {start} {update} />
