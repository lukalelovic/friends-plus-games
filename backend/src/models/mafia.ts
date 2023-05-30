import { Server } from 'socket.io';

/**
 * Stores Mafia game values
 */
export class Mafia {
  private lobbyId: string; // lobby id

  private assignRolesCountdown: number;
  private dayCountdown: number;
  private nightCountdown: number;

  private dayNum: number;
  private nightNum: number;

  private gameAssigned;
  private assignedMap: Map<string, string>; // <player id>:<role>

  readonly uniqueRoles = ['Assassin', 'King', 'Herbalist', 'Jester'];

  constructor(lobbyId: string) {
    this.lobbyId = lobbyId;

    this.dayNum = 1;
    this.nightNum = 0;

    this.assignedMap = new Map<string, string>();
    this.gameAssigned = false;
  }

  beginCountdown(server: Server): void {
    this.assignRolesCountdown = 10;

    const waitInterval = setInterval(() => {
      server.to(this.lobbyId).emit('beginCount', this.assignRolesCountdown);
      this.assignRolesCountdown--;

      // Finished beginning countdown?
      if (this.assignRolesCountdown <= 0) {
        server.to(this.lobbyId).emit('endBegin');
        clearInterval(waitInterval);
        return;
      }
    }, 1000);
  }

  assignRoles(server: Server, playerIds: string[]): void {
    const ids = playerIds;
    this.gameAssigned = true;

    // Assign unique roles to subset of players
    for (const role of this.uniqueRoles) {
      // Select random player to be assassin
      let randId;
      do {
        const randNdx = Math.floor(Math.random() * ids.length);
        randId = ids.splice(randNdx, 1);
      } while (this.assignedMap.has(randId) && ids.length > 0);

      // No more assignments possible
      if (!randId.length && !ids.length) {
        break;
      }

      this.assignedMap.set(randId, role);

      // Assign random ID to unique role
      console.log(`${randId} was assigned the role of ${role}`);
      server.to(this.lobbyId).emit('roleAssigned', randId, role);
    }

    // Assign standard role to rest of players
    for (const playerId in ids) {
      console.log(`Player ${playerId} was assigned the role of Noble`);
      server.to(this.lobbyId).emit('roleAssigned', playerId, 'Noble');
    }

    server.to(this.lobbyId).emit('beginGame');
  }

  rolesAssigned(): boolean {
    return this.gameAssigned;
  }
}
