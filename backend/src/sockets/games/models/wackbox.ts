import { Server } from 'socket.io';

interface WackboxPlayer {
  id: string;
  score: number;
  prevVoteId: string | null;
  didAnswer: boolean;
}

interface GameRound {
  prompt: string;
  answers: string[];
  votingInProgress: boolean;
  votes: { [playerId: string]: number };
}

export class Wackbox {
  private lobbyId: string;

  private players: WackboxPlayer[];
  private rounds: GameRound[];

  private currentRound: number;
  private choosePromptCountdown: number;

  private prompts: string[] = [
    "____________ is the key to any person's heart.",
    "I never thought I'd see ____________ in the middle of a grocery store.",
    'The key to a success is hard work and ____________.',
    'I learned to code and now I ____________ all day every day.',
    'If I were president, first thing I would do is ____________.',
    "Wow! I can't believe it! ____________ is finally here!",
    'My life would be so much better if I could have ____________.',
    "I never thought I'd see the day when ____________ became popular.",
    "____________ is ruining my life but I'm honestly not mad about it.",
    "I'm so bored here I wish I could be ____________ instead.",
    "____________ is overrated and I've always said it.",
    "If I could travel anywhere right now, I'd go to ____________ and never leave.",
  ];

  private readonly SEC_INTERVAL = 1000;

  constructor(lobbyId: string) {
    this.lobbyId = lobbyId;

    this.players = [];
    this.rounds = [];

    this.currentRound = 0;
  }

  public async gameLoop(server: Server): Promise<void> {
    while (this.prompts.length > 0 && this.rounds.length < 6) {
      // Increment current round
      this.currentRound++;

      // Choose round prompt
      this.choosePrompt(server);

      // Wait 60 seconds (or until all players have answered)
      await this.answerLoop();

      // Emit all answers (for frontend to display)
      server
        .to(this.lobbyId)
        .emit(
          'roundAnswers',
          this.currentRound,
          this.rounds[this.currentRound].answers,
        );

      // Begin voting
      this.rounds[this.currentRound - 1].votingInProgress = true;

      // Wait another 60 seconds for voting or until votes array size equals # of players
      await this.voteLoop();

      // End voting and update player scores
      this.endVoting(server);

      // Reset player/game stats
      this.resetStats();
    }

    // Game done, emit winner
    server.to(this.lobbyId).emit('gameWinner', this.getWinner());
  }

  private async choosePrompt(server: Server): Promise<void> {
    await this.promptCountdown(server);

    // Splice random prompt from prompts array
    const randNdx = Math.floor(Math.random() * this.prompts.length);
    const randPrompt = this.prompts.splice(randNdx, 1)[0];

    this.rounds[this.currentRound - 1] = {
      prompt: randPrompt,
      answers: [],
      votingInProgress: false,
      votes: {},
    };

    // Emit chosen prompt
    server.to(this.lobbyId).emit('roundPrompt', this.currentRound, randPrompt);
  }

  /**
   * Begins the countdown for choosing a new prompt;
   * @param {Server} server - The socket.io server.
   * @returns {Promise<number>}
   * @private
   */
  private promptCountdown(server: Server): Promise<number> {
    return new Promise((resolve) => {
      this.choosePromptCountdown = 10;

      const waitInterval = setInterval(() => {
        // Finished countdown?
        if (this.choosePromptCountdown <= 0) {
          clearInterval(waitInterval);
          resolve(0);
          return;
        }

        server.to(this.lobbyId).emit('promptCount', this.choosePromptCountdown);
        this.choosePromptCountdown--;
      }, this.SEC_INTERVAL);
    });
  }

  private answerLoop(): Promise<number> {
    return new Promise<number>((resolve) => {
      let answerWait = 60;

      const waitInterval = setInterval(() => {
        if (
          answerWait <= 0 ||
          this.rounds[this.currentRound - 1].answers.length ==
            this.players.length
        ) {
          clearInterval(waitInterval);
          resolve(0);
          return;
        }

        answerWait--;
      }, this.SEC_INTERVAL);
    });
  }

  private voteLoop(): Promise<number> {
    return new Promise<number>((resolve) => {
      let answerWait = 60;

      const waitInterval = setInterval(() => {
        if (
          answerWait <= 0 ||
          this.rounds[this.currentRound - 1].votes.length == this.players.length
        ) {
          clearInterval(waitInterval);
          resolve(0);
          return;
        }

        answerWait--;
      }, this.SEC_INTERVAL);
    });
  }

  private endVoting(server: Server): void {
    this.rounds[this.currentRound - 1].votingInProgress = false;

    const currRound = this.rounds[this.currentRound - 1];

    Object.entries(currRound.votes).forEach(([playerId, votes]) => {
      // Points earned based on votes divided by # of players
      const roundScore = 1000 * ((votes + 1) / this.players.length);

      this.players[playerId].score += roundScore;
      server.emit('scoreUpdate', playerId, this.players[playerId].score);
    });
  }

  private resetStats(): void {
    // TODO: reset necessary player + round stats at end of each round
    this.players.forEach((player) => {
      player.prevVoteId = null;
      player.didAnswer = false;
    });

    this.rounds[this.currentRound - 1].votingInProgress = false;
  }

  public getRoundNumber(): number {
    return this.currentRound;
  }

  public getRounds(): GameRound[] {
    return this.rounds;
  }

  public getPlayers(): WackboxPlayer[] {
    return this.players;
  }

  public addPlayer(playerId: string): void {
    this.players[playerId] = {
      id: playerId,
      score: 0,
      prevVoteId: null,
      didAnswer: false,
    };
  }

  public removePlayer(playerId: string): void {
    delete this.players[playerId];
  }

  public addRoundAnswer(playerId: string, answer: string): void {
    if (
      this.currentRound == 0 ||
      this.rounds[this.currentRound - 1].votingInProgress
    ) {
      return;
    }

    // Player already answered?
    if (this.players[playerId].didAnswer) {
      return;
    }

    this.rounds[this.currentRound - 1].answers.push(answer);
    this.players[playerId].didAnswer = true;
  }

  public castVote(playerId: string, votedId: string) {
    if (
      this.currentRound == 0 ||
      !this.rounds[this.currentRound - 1].votingInProgress
    ) {
      return;
    }

    // Player already voted? Don't let them vote again
    const prevId = this.players[playerId].prevVoteId;
    if (prevId) {
      return;
    }

    this.rounds[this.currentRound - 1].votes[votedId]++;
    this.players[playerId].prevVoteId = votedId;
  }

  /**
   * Get the player with the highest score.
   * @returns {string | null} ID of player with highest score, or null.
   */
  private getWinner(): string | null {
    let winner: string | null = null;
    let maxScore = 0;

    for (const playerId in this.players) {
      const player = this.players[playerId];

      // Get palyer with max votes
      if (player.score > maxScore) {
        maxScore = player.score;
        winner = playerId;
      }
    }

    return winner;
  }
}
