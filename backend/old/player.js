class Player {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.name = "";
    }

    setName(name) {
        this.name = name;
    }
}  

module.exports = Player;