import { Server } from 'socket.io';
import { clearInterval } from 'timers';

// Represents a mafia player object
interface MafiaPlayer {
  votes: number;
  role: string;
  nextToKill: boolean;
  isHealed: boolean;
  numVisits: number;
  prevActionId: string | null;
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
  private jesterWon: boolean;

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
        nextToKill: false,
        isHealed: false,
        numVisits: 0,
        prevActionId: null,
      };

      // Assign random ID to unique role
      console.log(`${randId} was assigned the role of ${role}`);
      server.to(this.lobbyId).emit('roleAssigned', randId, role);
    }

    // Assign standard role to rest of players
    for (let i = 0; i < ids.length; i++) {
      console.log(`Player ${ids[i]} was assigned the role of Noble`);
      server.to(this.lobbyId).emit('roleAssigned', ids[i], 'Noble');

      this.players[ids[i]] = {
        votes: 0,
        role: 'Noble',
        nextToKill: false,
        isHealed: false,
        numVisits: 0,
        prevActionId: null,
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
    if (this.dayNum > 1 && this.players[socketId] && this.players[votedId]) {
      const prevVoteId = this.players[socketId].prevActionId;

      if (prevVoteId) {
        this.players[prevVoteId].votes--;

        if (this.players[socketId].role == 'King') {
          this.players[prevVoteId].votes--;
        }
      }

      this.players[socketId].prevActionId = votedId;
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
    let noWinner = false;

    for (const playerId in this.players) {
      const player = this.players[playerId];

      // Get palyer with max votes
      if (player.votes > maxVotes) {
        noWinner = false;

        maxVotes = player.votes;
        winner = playerId;
      } else if (player.votes == maxVotes) {
        noWinner = true;
      }

      // Reset casted vote
      this.players[playerId].prevActionId = null;
      this.players[playerId].votes = 0;
    }

    // In the event of a tie
    if (noWinner) {
      return undefined;
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
      this.jesterWon = false;

      await this.dayLoop(server);

      // Vote result
      if (this.dayNum > 1) {
        const winnerId = this.getWinner();
        server.to(this.lobbyId).emit('voteResult', winnerId);

        if (winnerId) {
          if (this.players[winnerId].role == 'Assassin') {
            this.goodWon = true;
            break;
          } else if (this.players[winnerId].role == 'Jester') {
            server.to(this.lobbyId).emit('jesterWin', winnerId);
            this.jesterWon = true;
            return;
          } else if (Object.keys(this.players).length == 3) {
            this.evilWon = true;
            break;
          }
        }

        this.removePlayer(winnerId);

        await new Promise((resolve) =>
          setTimeout(resolve, this.SEC_INTERVAL * 5),
        );
      }

      this.nightNum++;
      await this.nightLoop(server);

      // Night result
      for (const playerId in this.players) {
        const player = this.players[playerId];

        server.to(this.lobbyId).emit('numVisits', playerId, player.numVisits);
        this.resetNightStats(playerId);

        if (player.nextToKill) {
          if (!player.isHealed) {
            server.to(this.lobbyId).emit('playerKilled', playerId);
          }

          this.removePlayer(playerId);
        }
      }

      if (Object.keys(this.players).length <= 2) {
        this.evilWon = true;
      }

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
  private dayLoop(server: Server): Promise<number> {
    return new Promise((resolve) => {
      let dayCountdown = this.dayNum == 1 ? 10 : 60; // No discussion/voting on day 1
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
  private nightLoop(server: Server): Promise<number> {
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

  public performNightAction(currPlayerId: string, otherPlayerId: string): void {
    if (this.getIsDay()) {
      return;
    }

    const currPlayer = this.players[currPlayerId];
    const otherPlayer = this.players[otherPlayerId];

    if (!currPlayer || !otherPlayer) {
      console.error(
        currPlayerId +
          ' could not perform action against other player ' +
          otherPlayerId,
      );
      return;
    }

    // Player already clicked on someone?
    if (currPlayer.prevActionId) {
      console.log(this.players[currPlayer.prevActionId]);

      if (currPlayer.role == 'Assassin') {
        this.players[currPlayer.prevActionId].nextToKill = false;
      } else if (currPlayer.role == 'Herbalist') {
        this.players[currPlayer.prevActionId].isHealed = false;
      }

      if (currPlayer.role != 'King') {
        this.players[currPlayer.prevActionId].numVisits--;
      }
    } else if (currPlayer.role != 'King') {
      this.players[currPlayerId].numVisits++;
    }

    // Perform role night action (if player has one)
    switch (currPlayer.role) {
      case 'Assassin':
        this.players[otherPlayerId].nextToKill = true;
        this.players[otherPlayerId].numVisits++;
        break;
      case 'Herbalist':
        this.players[otherPlayerId].isHealed = true;
        this.players[otherPlayerId].numVisits++;
        break;
      case 'Noble':
        this.players[otherPlayerId].numVisits++;
        break;
      case 'Jester':
        this.players[otherPlayerId].numVisits++;
        break;
      case 'King':
      default:
        break;
    }

    if (currPlayer.role != 'King') {
      this.players[currPlayerId].prevActionId = otherPlayerId;
    }
  }

  private resetNightStats(playerId: string): void {
    const player = this.players[playerId];
    if (!player) return;

    player.nextToKill = false;
    player.isHealed = false;
    player.numVisits = 0;
    player.prevActionId = null;

    this.players[playerId] = player;
  }

  public didPlayerWin(playerId: string): boolean {
    const currPlayer = this.players[playerId];
    if (!currPlayer) {
      return;
    }

    if (this.evilWon && currPlayer.role == 'Assassin') {
      return true;
    } else if (this.goodWon) {
      switch (currPlayer.role) {
        case 'King':
        case 'Herbalist':
        case 'Noble':
          return true;
        default:
          return false;
      }
    } else if (this.jesterWon && currPlayer.role == 'Jester') {
      return true;
    }

    return false;
  }
}
