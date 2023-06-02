export class Keyboard {
  constructor() {
    this.keys = {};
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  handleKeyDown(event) {
    this.keys[event.keyCode] = true;
  }

  handleKeyUp(event) {
    this.keys[event.keyCode] = false;
  }

  isKeyPressed(keyCode) {
    return this.keys[keyCode] === true;
  }

  cleanup() {
    // remove the event listeners when the component is destroyed
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  }
}