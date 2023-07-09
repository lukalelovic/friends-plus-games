import { Server } from 'socket.io';

interface DrawPlayer {
  id: string;
  points: number;
  isDrawing: boolean;
}

interface DrawRound {
  word: string;
  numCorrect: number;
  drawerId: string;
}

interface DrawShape {
  x: number;
  y: number;
  currColor: string;
}

export class DrawSm {
  private lobbyId: string;

  private players: { [playerId: string]: DrawPlayer };
  private rounds: DrawRound[];

  private shapeBuffer: DrawShape[];

  private currentRound: number;

  private readonly SEC_INTERVAL = 1000;

  constructor(lobbyId: string) {
    this.lobbyId = lobbyId;
    this.players = {};

    this.currentRound = 0;
    this.rounds = [];

    this.shapeBuffer = [];
  }

  public async gameLoop(server: Server): Promise<void> {
    // Repeat rounds for n players (so every player gets a turn)
    while (this.currentRound < this.numPlayers()) {
      // Wait 5 seconds
      await this.scoreLoop();

      // initialize round & assign drawer
      this.rounds[this.currentRound] = {
        word: null,
        numCorrect: 0,
        drawerId: this.playerList()[this.currentRound],
      };

      server
        .to(this.lobbyId)
        .emit('assignDrawer', this.rounds[this.currentRound].drawerId);

      // Wait for drawer word
      await this.waitForWord();

      // Draw countdown
      await this.drawLoop(server);

      // Calculate scores
      this.calculateScores(server);

      this.currentRound++;
    }

    // Wait a final 5 seconds
    await this.scoreLoop();
  }

  public addPlayer(playerId: string): void {
    this.players[playerId] = {
      id: playerId,
      points: 0,
      isDrawing: false,
    };
  }

  public getPlayers(): { [playerId: string]: DrawPlayer } {
    return this.players;
  }

  public removePlayer(playerId: string): void {
    delete this.players[playerId];
  }

  private processShapes(server: Server): void {
    if (this.shapeBuffer.length === 0) {
      return;
    }

    const shapeUpdates = [...this.shapeBuffer]; // Copy shape updates to list
    this.shapeBuffer = []; // Clear buffer

    // Emit new shapes
    server.to(this.lobbyId).emit('playerDraw', shapeUpdates);
  }

  public addShape(shape: DrawShape): void {
    this.shapeBuffer.push(shape);
  }

  public setCurrentWord(currWord: string): void {
    this.rounds[this.currentRound].word = currWord;
  }

  private waitForWord(): Promise<number> {
    return new Promise<number>((resolve) => {
      const waitInterval = setInterval(() => {
        if (this.rounds[this.currentRound].word != null) {
          clearInterval(waitInterval);
          resolve(0);
          return;
        }
      }, this.SEC_INTERVAL);
    });
  }

  private drawLoop(server: Server): Promise<number> {
    const shapeUpdateInterval = setInterval(() => {
      this.processShapes(server);
    }, 150);

    return new Promise<number>((resolve) => {
      let drawWait = 60;

      const waitInterval = setInterval(() => {
        if (
          drawWait <= 0 ||
          this.rounds[this.currentRound].numCorrect ==
            Object.keys(this.players).length
        ) {
          clearInterval(waitInterval);
          clearInterval(shapeUpdateInterval);

          resolve(0);
          return;
        }

        server.to(this.lobbyId).emit('roundCountdown', drawWait);
        drawWait--;
      }, this.SEC_INTERVAL);
    });
  }

  private calculateScores(server: Server): void {
    const currRound: DrawRound = this.rounds[this.currentRound];

    Object.keys(this.players).forEach((playerId) => {
      if (playerId == currRound.drawerId) {
        this.players[playerId].points =
          100 * currRound.numCorrect * currRound.word.length;
      } else {
        this.players[playerId].points = 150 * currRound.word.length;
      }
    });

    server.to(this.lobbyId).emit('playerScores', this.players);
  }

  private scoreLoop(): Promise<number> {
    return new Promise<number>((resolve) => {
      let scoreWait = 5;

      const waitInterval = setInterval(() => {
        if (scoreWait <= 0) {
          clearInterval(waitInterval);
          resolve(0);
          return;
        }

        scoreWait--;
      }, this.SEC_INTERVAL);
    });
  }

  public changeDrawerId(server: Server, playerId: string): void {
    this.rounds[this.currentRound].drawerId = playerId;

    server.to(this.lobbyId).emit('assignDrawer', playerId);
  }

  public currDrawerId(): string {
    return this.rounds[this.currentRound].drawerId;
  }

  public currWord(): string {
    return this.rounds[this.currentRound].word;
  }

  private numPlayers(): number {
    return Object.keys(this.players).length;
  }

  private playerList(): string[] {
    return Object.keys(this.players);
  }
}
