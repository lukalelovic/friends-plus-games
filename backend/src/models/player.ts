/**
 * Represents a in-game player object
 */
export class Player {
  public id: string;
  x: number;
  y: number;
  name: string;

  /**
   * Constructor for the Player
   * @constructor
   * @param {string} id - the player socket id
   * @param {number} x - the x position of the player
   * @param {number} y - the y position of the player
   */
  constructor(id: string, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.name = '';
  }

  /**
   * Sets the player's name (for game lobbies)
   * @param {string} name - name to give the player
   */
  setName(name: string): void {
    this.name = name;
  }
}
