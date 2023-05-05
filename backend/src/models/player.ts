export class Player {
  id: string;
  x: number;
  y: number;
  name: string;

  constructor(id: string, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.name = '';
  }

  setName(name: string) {
    this.name = name;
  }
}
