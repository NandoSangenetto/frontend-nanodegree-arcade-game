/**
 * Game class, helps to calculate the coordinates of
 * the tiles and position.
 * @class
 * @param {integer} columns - The number of columns
 * @param {integer} rows - The number of rows
 */
var Game = function(columns, rows) {
    this.TILE_WIDTH = 101;
    this.TILE_HEIGHT = 83;
    this.TOP_OFFSET = 50;
    this.columns = columns;
    this.rows = rows;
};

/**
 * Method to calculate the width and height from coordinates
 * @param {integer} x - x coordinate
 * @param {integer} y - y coordinate
 */
Game.prototype.getCoordinates = function(x, y) {
    return {
        width: this.TILE_WIDTH * (x-1),
        height: (this.TILE_HEIGHT * (y-1)) + this.TOP_OFFSET - this.TILE_HEIGHT
    };
};

/**
 * Method to update the width and height from coordinates.
 * This method is used to be called and update other classes.
 */
Game.prototype.updateCoordinates = function() {
    var coordinates = game.getCoordinates(this.x, this.y);
    this.width = coordinates.width;
    this.height = coordinates.height;
};

/**
 * Enemy class, the player needs to avoid them.
 * @class
 * @param {integer} columns - The number of columns
 * @param {integer} rows - THe number of rows
 */
var Enemy = function() {

    // Defining properties
    this.x;
    this.y;
    this.speed;

    // Sprite of the enemy
    this.sprite = 'images/enemy-bug.png';

    // Properties to set max and min speed
    this.minSpeed = 100;
    this.maxSpeed = 500;

    // Calling init, that generates x, y, speed and
    // calculates the width and height
    this.init();
};

/**
 * Init method, that generates x, y, speed and
 * calculates the width and height from x and y.
 */
Enemy.prototype.init = function () {
    this.x = -1;
    this.y = Math.floor(Math.random() * (5 - 2)) + 2; // Limiting where enemy should appear
    game.updateCoordinates.call(this);
    this.speed = Math.floor(Math.random() * (this.maxSpeed - this.minSpeed) + this.minSpeed);
};

/**
 * Method to update the enemy position.
 */
Enemy.prototype.update = function(dt) {

    // Reset enemy when it leaves the screen
    if(this.width > ctx.canvas.clientWidth) {
        this.init()
    }

    // Move the enemy smoothly
    this.width = this.width + dt * this.speed;
};

/**
 * Draw the enemy on the screen
 */
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.width, this.height);
};

/**
 * Player class, where all the player magic are from.
 * @class
 * @param {integer} x - The start x position
 * @param {integer} y - The start y position
 */
var Player = function(x, y) {

    // Defining properties
    this.x = x;
    this.y = y;
    this.score = 0;

    // Saving x and y to reset after
    this.startX = x;
    this.startY = y; 

    // Method to update width and height from x and y
    game.updateCoordinates.call(this);

    this.sprite = 'images/char-boy.png';
};

/**
 * Method to handle with the keyboard input.
 * @param {string} key - Only accept arrow values
 */
Player.prototype.handleInput = function(key) {

    // Ignore if the key is not one of the allowed
    if (typeof key === 'undefined') {
        return;
    }

    // Calling moveUp, moveDown, moveLeft and moveRight dynamically
    this['move' + key[0].toUpperCase() + key.toLowerCase().substr(1)]();

    // Update cordinates
    game.updateCoordinates.call(this);
};

/**
 * Method to move up, checking the rows.
 */
Player.prototype.moveUp = function() {
    if(this.y > 1) {
        this.y = this.y - 1;
    }
};

/**
 * Method to move right, checking the columns.
 */
Player.prototype.moveRight = function() {
    if (this.x < game.columns) {
        this.x = this.x + 1;
    }
};

/**
 * Method to move down, checking the rows.
 */
Player.prototype.moveDown = function() {
    if(this.y < game.rows) {
        this.y = this.y + 1;
    }
};

/**
 * Method to move left, checking the columns.
 */
Player.prototype.moveLeft = function() {
    if (this.x > 1) {
        this.x = this.x - 1;
    }
};

/**
 * Method to increase score value.
 */
Player.prototype.addScore = function() {
    this.score = this.score + 1;
    this.displayScore();
};

/**
 * Method to display score into canvas screen.
 */
Player.prototype.displayScore = function() {
    ctx.clearRect(0, 0, 400, 50);
    ctx.fillStyle = 'red';
    ctx.font = '30px  Impact';
    ctx.fillText('SCORE: ' + this.score, 30, 30);
};

/**
 * Method send the player to the initial position.
 */
Player.prototype.reset = function() {
    this.y = this.startY;
    this.x = this.startX;
    game.updateCoordinates.call(this);
};

/**
 * Method to check if the user reached the objective.
 * This method calls other methods to addScore and 
 * reset the player to the initial position.
 * Also add a new enemy to increase the dificulty.
 */
Player.prototype.checkIfWon = function() {
    if (this.y === 1) {
        this.reset();
        this.addScore();
        allEnemies.push(new Enemy());
    }
};

/**
 * Method to check collision with the enemys.
 * The method is simple, it calculates if the enemy
 * is in the same title as the player.
 * If there's collision, return player to the 
 * initial position.
 */
Player.prototype.checkCollision = function() {
    // Checking collision for every enemy.
    for(var i = 0; i < allEnemies.length; i++) {
        var enemy = allEnemies[i];
        if(
            this.width < enemy.width + game.TILE_WIDTH &&
            this.width + game.TILE_WIDTH > enemy.width &&
            this.height < enemy.height + game.TILE_HEIGHT &&
            game.TILE_HEIGHT + this.height > enemy.height
        ) {
            this.reset();
        }
    }
};

/**
 * Update method to display the updated score, check 
 * collision and check if the player reached the objective.
 */
Player.prototype.update = function(dt) {
    this.displayScore();
    this.checkCollision();
    this.checkIfWon();
};

/**
 * Draw the enemy on the screen
 */
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.width, this.height);
};

// Instantiating objects
var game = new Game(5, 6);
var allEnemies = [new Enemy()];
var player = new Player(3, 6);


// This listens for key presses
document.addEventListener('keydown', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
