export class ChatStack {
  constructor() {
    this.items = [];
  }

  push(message) {
    this.items.push(message);
  }

  pop() {
    if (this.isEmpty()) {
      return "Stack Underflow";
    }
    return this.items.pop();
  }

  top() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items[this.items.length - 1];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }

  clear() {
    this.items = [];
  }

  all() {
    return this.items;
  }
}