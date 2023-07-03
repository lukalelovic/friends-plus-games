interface DrawPlayer {
  points: number;
  isDrawing: boolean;
}

interface DrawRound {
  word: string;
  numCorrect: number;
}

export class DrawSm {
  private lobbyId: string;

  private players: { [playerId: string]: DrawPlayer };
  private rounds: DrawRound[];

  // TODO: begin countdown, draw countdown, round tracking, drawer assignment

  constructor(lobbyId: string) {
    this.lobbyId = lobbyId;
    this.players = {};
  }

  public addPlayer(playerId: string, isDrawing: boolean): void {
    this.players[playerId] = {
      points: 0,
      isDrawing: isDrawing,
    };
  }

  public removePlayer(playerId: string): void {
    delete this.players[playerId];
  }
}
