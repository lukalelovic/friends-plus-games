import { Server } from 'socket.io';
import { clearInterval } from 'timers';

// Represents a mafia player object
interface MafiaPlayer {
  votes: number;
  role: string;
  voteCasted: boolean;
}

/**
 * Stores Mafia game values
 */
export class Mafia {
  private lobbyId: string; // lobby id

  private assignRolesCountdown: number;

  private dayNum: number;
  private nightNum: number;

  private gameAssigned: boolean;
  private isDay: boolean;

  private evilWon: boolean;
  private goodWon: boolean;

  private players: { [playerId: string]: MafiaPlayer };

  readonly uniqueRoles = ['Assassin', 'King', 'Herbalist', 'Jester'];

  private readonly SEC_INTERVAL = 1000;

  /**
   * Constructs a new instance of the Mafia game.
   * @param {string} lobbyId - The ID of the game lobby.
   */
  constructor(lobbyId: string) {
    this.lobbyId = lobbyId;

    this.dayNum = 1;
    this.nightNum = 0;

    this.players = {};
    this.gameAssigned = false;
  }

  /**
   * Begins the countdown for role assignment.
   * @param {Server} server - The socket.io server.
   * @returns {void}
   */
  public beginCountdown(server: Server): void {
    this.assignRolesCountdown = 10;

    const waitInterval = setInterval(() => {
      // Finished countdown?
      if (this.assignRolesCountdown <= 0) {
        server.to(this.lobbyId).emit('endBegin');
        clearInterval(waitInterval);
        return;
      }

      server.to(this.lobbyId).emit('beginCount', this.assignRolesCountdown);
      this.assignRolesCountdown--;
    }, this.SEC_INTERVAL);
  }

  /**
   * Assigns roles to the players in the game.
   * @param {Server} server - The socket.io server.
   * @param {string[]} playerIds - The IDs of the players.
   * @returns {void}
   */
  public assignRoles(server: Server, playerIds: string[]): void {
    const ids = playerIds;
    this.gameAssigned = true;

    // Assign unique roles to subset of players
    for (const role of this.uniqueRoles) {
      // Select random player to be assassin
      let randId;
      do {
        const randNdx = Math.floor(Math.random() * ids.length);
        randId = ids.splice(randNdx, 1);
      } while (this.players[randId] && ids.length > 0);

      // No more assignments possible
      if (!randId.length && !ids.length) {
        break;
      }

      this.players[randId] = {
        votes: 0,
        role: role,
        voteCasted: false,
      };

      // Assign random ID to unique role
      console.log(`${randId} was assigned the role of ${role}`);
      server.to(this.lobbyId).emit('roleAssigned', randId, role);
    }

    // Assign standard role to rest of players
    for (const playerId in ids) {
      console.log(`Player ${playerId} was assigned the role of Noble`);
      server.to(this.lobbyId).emit('roleAssigned', playerId, 'Noble');

      this.players[playerId] = {
        votes: 0,
        role: 'Noble',
        voteCasted: false,
      };
    }

    this.gameLoop(server);
  }

  /**
   * Checks if roles have been assigned.
   * @returns {boolean} - True if roles have been assigned, false otherwise.
   */
  public rolesAssigned(): boolean {
    return this.gameAssigned;
  }

  /**
   * Gets the current day/night status.
   * @returns {boolean} - True if it's day, false if it's night.
   */
  public getIsDay(): boolean {
    return this.isDay;
  }

  /**
   * Gets the current day number
   * @returns {number} - number of days passed
   */
  public getDayNum(): number {
    return this.dayNum;
  }

  /**
   * Gets the current night number
   * @returns {number} - number of nights passed
   */
  public getNightNum(): number {
    return this.nightNum;
  }

  /**
   * Removes a player from the game (for when they disconnect)
   * @param {string} playerId - The ID of the player to remove.
   * @returns {boolean} - True if the player was removed, false otherwise.
   */
  public removePlayer(playerId: string): void {
    delete this.players[playerId];
  }

  /**
   * Cast a vote against a player.
   * @param {string} socketId - The unique ID of the player casting the vote.
   * @param {string} votedId - The unique ID of the player being voted against.
   */
  public castVote(socketId: string, votedId: string) {
    if (
      this.dayNum > 1 &&
      this.players[socketId] &&
      !this.players[socketId].voteCasted &&
      this.players[votedId]
    ) {
      this.players[socketId].voteCasted = true;
      this.players[votedId].votes++;

      if (this.players[socketId].role == 'King') {
        this.players[votedId].votes++;
      }
    }
  }

  /**
   * Get the number of votes for a player.
   * @param {string} playerId - The unique ID of the player.
   * @returns {number} The number of votes for the player.
   */
  public getVotes(playerId: string): number {
    return this.players[playerId] ? this.players[playerId].votes : -1;
  }

  /**
   * Get the player with the most votes.
   * @returns {string | null} ID of player with most votes, or null.
   */
  public getWinner(): string | null {
    let winner: string | null = null;
    let maxVotes = 0;

    for (const playerId in this.players) {
      const player = this.players[playerId];

      // Get palyer with max votes
      if (player.votes > maxVotes) {
        maxVotes = player.votes;
        winner = playerId;
      }

      // Reset casted vote
      this.players[playerId].voteCasted = false;
    }

    return winner;
  }

  /**
   * The main game loop.
   * @param {Server} server - The socket.io server.
   * @returns {void}
   * @private
   */
  private async gameLoop(server: Server): Promise<void> {
    while (this.dayNum < 15 && !this.evilWon && !this.goodWon) {
      this.evilWon = false;
      this.goodWon = false;

      await this.dayLoop(server);

      // Send daily voting outcome
      if (this.dayNum > 1) {
        server.to(this.lobbyId).emit('voteResult', this.getWinner());

        await new Promise((resolve) =>
          setTimeout(resolve, this.SEC_INTERVAL * 5),
        );
      }

      this.nightNum++;
      await this.nightLoop(server);

      this.dayNum++;
    }

    if (this.dayNum >= 15) {
      server.to(this.lobbyId).emit('drawWin');
    } else if (this.goodWon) {
      server.to(this.lobbyId).emit('goodWin');
    } else if (this.evilWon) {
      server.to(this.lobbyId).emit('evilWin');
    } else {
      console.error('Error: game loop terminated unexpectedly...');
    }
  }

  /**
   * Executes the day loop in the game.
   *
   * @param {Server} server - The socket.io server.
   * @returns {Promise<number>} A promise that resolves to a number when the day loop completes.
   *                            The resolved value is currently set to 0 in the implementation.
   * @private
   */
  private dayLoop(server): Promise<number> {
    return new Promise((resolve) => {
      let dayCountdown = this.dayNum == 1 ? 10 : 30; // No discussion/voting on day 1
      this.isDay = true;

      const dayCount = setInterval(() => {
        server.to(this.lobbyId).emit('dayCount', this.dayNum, dayCountdown);

        if (dayCountdown <= 0) {
          clearInterval(dayCount);
          resolve(0);
        }

        dayCountdown--;
      }, this.SEC_INTERVAL);
    });
  }

  /**
   * Executes the night loop in the game.
   *
   * @param {Server} server - The socket.io server.
   * @returns {Promise<number>} A promise that resolves to a number when the night loop completes.
   *                            The resolved value is currently set to 0 in the implementation.
   * @private
   */
  private nightLoop(server): Promise<number> {
    return new Promise((resolve) => {
      let nightCountdown = 20;
      this.isDay = false;

      const nightCount = setInterval(() => {
        server
          .to(this.lobbyId)
          .emit('nightCount', this.nightNum, nightCountdown);

        if (nightCountdown <= 0) {
          clearInterval(nightCount);
          resolve(0);
        }

        nightCountdown--;
      }, this.SEC_INTERVAL);
    });
  }
}
