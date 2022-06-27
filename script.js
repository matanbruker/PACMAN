var DEF_FOOD_COUNT = 20;
var DEF_MONSTER_SPEED = 600;
var DEF_GAME_SPEED = 120;
var DEF_GAME_TIME = 20;
var DEF_WAIT_WHEN_EATEN = 1000;
var DEF_BALL_COLOR_5 = "gray";
var DEF_BALL_COLOR_15 = "red";
var DEF_BALL_COLOR_25 = "lime";
var DEF_AMOUNT_OF_MONSTERS = 3;

function ShuffleArray(array) {
    var index = array.length, tempVal, rIndex;
    while(index !== 0) {
        rIndex = Math.floor(Math.random() * index);
        index--;
        tempVal = array[index];
        array[index] = array[rIndex];
        array[rIndex] = tempVal;
    }
    return array;
}
function ShuffleMultidimensionalArray(array) {
    for(var i = 0; i < array.length; i++) {
        for(var j = array.length; j != 0; j--) {
            var k = Math.floor(Math.random() * (j + 1));
            var t1 = array[i][k];
            var t2 = array[i][j];
            array[i][j] = t1;
            array[i][k] = t2;
        }
    }
    return array;
}
function CountArray(array, element) {
    var count = 0;
    for(var i = 0; i < array.length; i++) {
        if(array[i] == element) count++;
    }
    return count;
}

var PacMan = {
    canvas: null,
    canvasContext: null,
    shape: new Object(),
    board: new Array(), //0 is for empty cells, 1 for walls
    boardWidth: 0,
    boardHeight: 0,
    cellSize: 0,
    score: 0,
    time: 0,
    keysDown: {},
    audio: undefined,

    controls: {
        "up": 'w',
        "right": 'd',
        "left": 'a',
        "bottom": 's',
        disabled: false
    },

    pacman: {
        color: "yellow",
        position: {
            x: 0,
            y: 0
        },
        direction: 1,   //0: up, 1: right, 2: bottom, 3: left
        lives: 3
    },
    monsters: new Array(),
    monsterImage: null,
    figure: {
        x: 0,
        y: 0,
        alive: false
    },

    KillPacMan: function() {
        if(PacMan.controls.disabled) return;
        PacMan.pacman.lives--;
        PacMan.score -= 10;
        PacMan.controls.disabled = true;
        if(PacMan.pacman.lives == 0) {
            PacMan.EndGame();
        }else {
            setTimeout(function() {
                PacMan.controls.disabled = false;
            }, DEF_WAIT_WHEN_EATEN); //Revive Pac-Man!
        }
    },
    CreateMonster: function(x, y) {
        var monster = {
            x: x,
            y: y,
            ix: x,
            iy: y
        };
        return monster;
    },
    MonsterFindPath: function(monsterIndex) {
        var monster = PacMan.monsters[monsterIndex];
        var xdiff, ydiff;
        if(PacMan.controls.disabled) {
            //Go to initial pos
            /*xdiff = monster.ix - monster.x;
            ydiff = monster.iy - monster.y;

            if(xdiff < 0) {
                monster.x--;
            }else if(xdiff > 0) {
                monster.x++;
            }
            if(ydiff < 0) {
                monster.y--;
            }else if(ydiff > 0) {
                monster.y++;
            }*/
            monster.x = monster.ix;
            monster.y = monster.iy;
        }else {
            xdiff = PacMan.pacman.position.x - monster.x;
            ydiff = PacMan.pacman.position.y - monster.y;
            var canMove = false;

            if(xdiff < 0) {
                if(monster.x > 0 && PacMan.board[monster.x - 1][monster.y] != 1) {
                    monster.x--;
                    canMove = true;
                }
            }else if(xdiff > 0) {
                if(monster.x < PacMan.boardWidth - 1 && PacMan.board[monster.x + 1][monster.y] != 1) {
                    monster.x++;
                    canMove = true;
                }
            }
            if(ydiff < 0) {
                if(monster.y > 0 && PacMan.board[monster.x][monster.y - 1] != 1) {
                    monster.y--;
                    canMove = true;
                }
            }else if(ydiff > 0) {
                if(monster.y < PacMan.boardHeight - 1 && PacMan.board[monster.x][monster.y + 1] != 1) {
                    monster.y++;
                    canMove = true;
                }
            }
    
            if(!canMove) {
                if(xdiff < 0 && ydiff < 0) {
                    if(monster.x > 0 && monster.y > 0) {
                        if(PacMan.board[monster.x - 1][monster.y - 1] != 1) {
                            monster.x--;
                            monster.y--;
                            canMove = true;
                        }
                    }
                }else if(xdiff < 0 && ydiff > 0) {
                    if(monster.x > 0 && monster.y < PacMan.boardHeight - 1) {
                        if(PacMan.board[monster.x - 1][monster.y + 1] != 1) {
                            monster.x--;
                            monster.y++;
                            canMove = true;
                        }
                    }
                }else if(xdiff > 0 && ydiff < 0) {
                    if(monster.x < PacMan.boardWidth - 1 && monster.y > 0) {
                        if(PacMan.board[monster.x + 1][monster.y - 1] != 1) {
                            monster.x++;
                            monster.y--;
                            canMove = true;
                        }
                    }
                }else if(xdiff > 0 && ydiff > 0) {
                    if(monster.x > PacMan.boardWidth - 1 && monster.y > PacMan.boardHeight - 1) {
                        if(PacMan.board[monster.x + 1][monster.y + 1] != 1) {
                            monster.x++;
                            monster.y++;
                            canMove = true;
                        }
                    }
                }
            }

            if(!canMove) {
                xdiff = Math.floor(Math.random() * 2 - 1);
                ydiff = Math.floor(Math.random() * 2 - 1);
                if(monster.x + xdiff > 0 && monster.x + xdiff < PacMan.boardWidth - 1) {
                    if(PacMan.board[monster.x + xdiff][monster.y] != 1) {
                        monster.x += xdiff;
                    }
                }
                if(monster.y + ydiff > 0 && monster.y + ydiff < PacMan.boardHeight - 1) {
                    if(PacMan.board[monster.x][monster.y + ydiff] != 1) {
                        monster.y += ydiff;
                    }
                }
            }

            if(monster.x == PacMan.pacman.position.x && monster.y == PacMan.pacman.position.y) {
                PacMan.KillPacMan();
            }
        }

        PacMan.monsters[monsterIndex] = monster;
    },
    FigureFindPath: function() {
        if(PacMan.figure.alive) {
            var xdiff = Math.floor(Math.random() * 20 - 10);
            var ydiff = Math.floor(Math.random() * 20 - 10);
            if(xdiff < 0 && PacMan.figure.x > 0 && PacMan.board[PacMan.figure.x - 1][PacMan.figure.y] != 1) {
                PacMan.figure.x--;
            }else if(xdiff > 0 && PacMan.figure.x < PacMan.boardWidth - 1 && PacMan.board[PacMan.figure.x + 1][PacMan.figure.y] != 1) {
                PacMan.figure.x++;
            }
            if(ydiff < 0 && PacMan.figure.y > 0 && PacMan.board[PacMan.figure.x][PacMan.figure.y - 1] != 1) {
                PacMan.figure.y--;
            }else if(ydiff > 0 && PacMan.figure.y < PacMan.boardHeight - 1 && PacMan.board[PacMan.figure.x][PacMan.figure.y + 1] != 1) {
                PacMan.figure.y++;
            }
            if(!PacMan.controls.disabled && PacMan.figure.x == PacMan.pacman.position.x && PacMan.figure.y == PacMan.pacman.position.y) {
                PacMan.score += 50;
                PacMan.figure.alive = false;
            }
        }
    },
    GetEmptyCell: function() {
        var x = 0;
        var y = 0;
        do {
            x = Math.floor(Math.random() * PacMan.boardWidth);
            y = Math.floor(Math.random() * PacMan.boardHeight);
        } while(PacMan.board[x][y] != 0);
        return {x: x, y: y};
    },
    GetAllEmptyCells: function() {
        var emptyCells = new Array();
        for(var x = 0; x < PacMan.boardWidth; x++) {
            for(var y = 0; y < PacMan.boardHeight; y++) {
                if(PacMan.board[x][y] == 0) {
                    emptyCells.push({x: x, y: y});
                }
            }
        }
        return emptyCells;
    },
    GetEmptyCellTopLeftCorner: function() {
        var emptyCells = PacMan.GetAllEmptyCells();
        var current = emptyCells[0];
        for(var i = 0; i < emptyCells.length; i++) {
            if(emptyCells[i].x < current.x && emptyCells[i].y < current.y) {
                current = emptyCells[i];
            }
        }
        return current;
    },
    GetEmptyCellTopRightCorner: function() {
        var emptyCells = PacMan.GetAllEmptyCells();
        var current = emptyCells[emptyCells.length - 1];
        for(var i = 0; i < emptyCells.length; i++) {
            if(emptyCells[i].x >= current.x && emptyCells[i].y <= current.y) {
                current = emptyCells[i];
            }
        }
        return current;
    },
    GetEmptyCellBottomLeftCorner: function() {
        var emptyCells = PacMan.GetAllEmptyCells();
        var current = emptyCells[emptyCells.length - 1];
        for(var i = 0; i < emptyCells.length; i++) {
            if(emptyCells[i].x <= current.x && emptyCells[i].y >= current.y) {
                current = emptyCells[i];
            }
        }
        return current;
    },
    GetEmptyCellBottomRightCorner: function() {
        var emptyCells = PacMan.GetAllEmptyCells();
        var current = emptyCells[0];
        for(var i = 0; i < emptyCells.length; i++) {
            if(emptyCells[i].x >= current.x && emptyCells[i].y >= current.y) {
                current = emptyCells[i];
            }
        }
        return current;
    },
    GetEmptyCellInTheMiddle: function() {
        var emptyCells = PacMan.GetAllEmptyCells();
        var current = emptyCells[emptyCells.length - 1];
        var xdiff, ydiff;
        var pxdiff = PacMan.boardWidth, pydiff = PacMan.boardHeight;
        var middle = {x: Math.floor(PacMan.boardWidth / 2), y: Math.floor(PacMan.boardHeight / 2)};
        for(var i = 0; i < emptyCells.length; i++) {
            xdiff = Math.abs(middle.x - emptyCells[i].x);
            ydiff = Math.abs(middle.y - emptyCells[i].y);
            if(xdiff <= pxdiff && ydiff <= pydiff) {
                current = emptyCells[i];
            }
        }
        return current;
    },
    FixWalls: function() {
        var emptyCells = PacMan.GetAllEmptyCells();
        var canMoveUp, canMoveRight, canMoveBottom, canMoveLeft;
        for(var i = 0; i < emptyCells.length; i++) {
            //Check if you can go to at least one direction. If not, remove a random wall around you.
            if(emptyCells[i].x == 0 || PacMan.board[emptyCells[i].x - 1][emptyCells[i].y] == 1) {
                canMoveLeft = false;
            }
            if(emptyCells[i].x == PacMan.boardWidth - 1 || PacMan.board[emptyCells[i].x + 1][emptyCells[i].y] == 1) {
                canMoveRight = false;
            }
            if(emptyCells[i].y == 0 || PacMan.board[emptyCells[i].x][emptyCells[i].y - 1] == 1) {
                canMoveUp = false;
            }
            if(emptyCells[i].y == PacMan.boardHeight - 1 || PacMan.board[emptyCells[i].x][emptyCells[i].y + 1] == 1) {
                canMoveBottom = false;
            }
            if(!canMoveUp && !canMoveRight && !canMoveBottom && !canMoveLeft) {
                var removableDirections = [];
                if(emptyCells[i].x != 0) removableDirections.push("left");
                if(emptyCells[i].x != PacMan.boardWidth - 1) removableDirections.push("right");
                if(emptyCells[i].y != 0) removableDirections.push("up");
                if(emptyCells[i].y != PacMan.boardHeight - 1) removableDirections.push("bottom");
                if(removableDirections.length != 0) {
                    var removeDirection = removableDirections[Math.floor(Math.random() * removableDirections.length)];
                    if(removeDirection == "up") {
                        PacMan.board[emptyCells[i].x][emptyCells[i].y - 1] = 0;
                    }else if(removeDirection == "right") {
                        PacMan.board[emptyCells[i].x + 1][emptyCells[i].y] = 0;
                    }else if(removeDirection == "left") {
                        PacMan.board[emptyCells[i].x - 1][emptyCells[i].y] = 0;
                    }else if(removeDirection == "bottom") {
                        PacMan.board[emptyCells[i].x][emptyCells[i].y + 1] = 0;
                    }
                }
            }
        }
    },
    Resize: function() {
        PacMan.cellSize = Math.floor(document.body.clientHeight / PacMan.boardHeight);
        PacMan.canvas.width = PacMan.boardWidth * PacMan.cellSize;
        PacMan.canvas.height = PacMan.boardHeight * PacMan.cellSize;
    },
    Start: function() {
        var foodCount = DEF_FOOD_COUNT;
        if(foodCount < 3) foodCount = 3;

        PacMan.boardWidth = Math.floor(Math.sqrt(foodCount));
        PacMan.boardHeight = PacMan.boardWidth;
        if(PacMan.boardWidth * PacMan.boardHeight < foodCount) {
            PacMan.boardWidth++;
        }

        PacMan.canvas.width = document.body.clientWidth;
        PacMan.canvas.height = document.body.clientHeight;

        var increaseBoardSizeBy = Math.ceil(foodCount / 8);
        if(increaseBoardSizeBy < 3) increaseBoardSizeBy = 3;
        PacMan.boardWidth += increaseBoardSizeBy;
        PacMan.boardHeight += increaseBoardSizeBy;
        PacMan.cellSize = Math.floor(PacMan.canvas.height / PacMan.boardHeight);

        if(PacMan.cellSize < 10) {
            alert("An error occured when starting the game. Please make sure your game settings are set correctly.");
            return;
        }
        if((PacMan.boardWidth * PacMan.cellSize) < document.body.clientWidth) {
            increaseBoardSizeBy = Math.floor(document.body.clientWidth / PacMan.cellSize);
            if(increaseBoardSizeBy > PacMan.boardWidth) {
                PacMan.boardWidth = increaseBoardSizeBy;
            }
        }

        PacMan.canvas.width = PacMan.boardWidth * PacMan.cellSize;
        PacMan.canvas.height = PacMan.boardHeight * PacMan.cellSize;

        document.getElementById("canvas-wrapper").style.display = "block";

        var foods = new Array();
        var foodIndex = 0;
        var y = Math.floor(foodCount * 0.6);
        for(var i = 0; i < y; i++) {
            foods[foodIndex] = 25;
            foodIndex++;
        }
        y = Math.floor(((foodCount - y) / 4) * 3);
        for(var i = 0; i < y; i++) {
            foods[foodIndex] = 15;
            foodIndex++;
        }
        while(foodIndex < foodCount) {
            foods[foodIndex] = 5;
            foodIndex++;
        }
        foods = ShuffleArray(foods);

        foodIndex = foods.length;

        var maxWalls = PacMan.boardWidth * PacMan.boardHeight - foodCount, wallCount = 0;
        for(var i = 0; i < PacMan.boardWidth; i++) {
            PacMan.board[i] = new Array();
            for(var j = 0; j < PacMan.boardHeight; j++) {
                if(wallCount < maxWalls && Math.floor(Math.random() * 100) > 50){
                    wallCount++;
                    PacMan.board[i][j] = 1;
                }else {
                    PacMan.board[i][j] = 0;
                }
            }
        }
        PacMan.FixWalls();
        var emptyPos;
        for(var i = 0; i < foods.length; i++) {
            emptyPos = PacMan.GetEmptyCell();
            PacMan.board[emptyPos.x][emptyPos.y] = foods[i];
        }

        //Monsters
        PacMan.monsters = new Array();
        for(var i = 0; i < DEF_AMOUNT_OF_MONSTERS; i++) {
            //emptyPos = PacMan.GetEmptyCell();
            //Must place in corners
            if(i == 0) {
                emptyPos = PacMan.GetEmptyCellTopLeftCorner();
            }else if(i == 1) {
                emptyPos = PacMan.GetEmptyCellTopRightCorner();
            }else if(i == 2) {
                emptyPos = PacMan.GetEmptyCellBottomLeftCorner();
            }
            PacMan.monsters[i] = (PacMan.CreateMonster(emptyPos.x, emptyPos.y));
        }

        //Pacman
        emptyPos = PacMan.GetEmptyCell();
        PacMan.board[emptyPos.x][emptyPos.y] = 999;
        PacMan.pacman.position.x = emptyPos.x;
        PacMan.pacman.position.y = emptyPos.y;

        //Extra Lives
        for(var i = 0; i < 2; i++) {
            emptyPos = PacMan.GetEmptyCell();
            PacMan.board[emptyPos.x][emptyPos.y] = 3;
        }

        //Extra Times
        for(var i = 0; i < 2; i++) {
            emptyPos = PacMan.GetEmptyCell();
            PacMan.board[emptyPos.x][emptyPos.y] = 4;
        }

        //Figure
        emptyPos = PacMan.GetEmptyCellBottomRightCorner();
        PacMan.figure.x = emptyPos.x;
        PacMan.figure.y = emptyPos.y;
        PacMan.figure.alive = true;
        PacMan.board[emptyPos.x][emptyPos.y] = 2;

        PacMan.time = DEF_GAME_TIME;

        //audio
        PacMan.audio = document.createElement("audio");
        PacMan.audio.src = "pacman.mp3";
        PacMan.audio.autoplay = true;
        PacMan.audio.loop = true;

        PacMan.MainInterval = setInterval(PacMan.MainLoop, DEF_GAME_SPEED);
        PacMan.MonsterInterval = setInterval(function() {
            for(var i = 0; i < PacMan.monsters.length; i++) PacMan.MonsterFindPath(i);
            PacMan.FigureFindPath();
        }, DEF_MONSTER_SPEED);
        PacMan.TimerInterval = setInterval(function() {
            if(PacMan.controls.disabled) return;
            PacMan.time = (PacMan.time - 0.1).toFixed(1);
            if(PacMan.time <= 0.0) {
                PacMan.time = 0;
                PacMan.EndGame();
            }
        }, 100);
    },
    MainLoop: function() {
        PacMan.PollKeyEvents();
        PacMan.Draw();
    },
    PollKeyEvents: function() {
        if(PacMan.controls.disabled) {
            return;
        }
        if(PacMan.keysDown[PacMan.controls["up"]]) {
            PacMan.MoveUp();
        }
        if(PacMan.keysDown[PacMan.controls["bottom"]]) {
            PacMan.MoveBottom();
        }
        if(PacMan.keysDown[PacMan.controls["left"]]) {
            PacMan.MoveLeft();
        }
        if(PacMan.keysDown[PacMan.controls["right"]]) {
            PacMan.MoveRight();
        }
    },
    MoveUp: function() {
        if(PacMan.pacman.position.y > 0 && PacMan.board[PacMan.pacman.position.x][PacMan.pacman.position.y - 1] != 1) {
            PacMan.board[PacMan.pacman.position.x][PacMan.pacman.position.y] = 0;
            PacMan.pacman.position.y--;
            PacMan.pacman.direction = 0;
            PacMan.EatBlock();
            PacMan.board[PacMan.pacman.position.x][PacMan.pacman.position.y] = 999;
        }
    },
    MoveBottom: function() {
        if(PacMan.pacman.position.y < PacMan.boardHeight - 1 && PacMan.board[PacMan.pacman.position.x][PacMan.pacman.position.y + 1] != 1) {
            PacMan.board[PacMan.pacman.position.x][PacMan.pacman.position.y] = 0;
            PacMan.pacman.position.y++;
            PacMan.pacman.direction = 2;
            PacMan.EatBlock();
            PacMan.board[PacMan.pacman.position.x][PacMan.pacman.position.y] = 999;
        }
    },
    MoveLeft: function() {
        if(PacMan.pacman.position.x > 0 && PacMan.board[PacMan.pacman.position.x - 1][PacMan.pacman.position.y] != 1) {
            PacMan.board[PacMan.pacman.position.x][PacMan.pacman.position.y] = 0;
            PacMan.pacman.position.x--;
            PacMan.pacman.direction = 3;
            PacMan.EatBlock();
            PacMan.board[PacMan.pacman.position.x][PacMan.pacman.position.y] = 999;
        }
    },
    MoveRight: function() {
        if(PacMan.pacman.position.x < PacMan.boardWidth - 1 && PacMan.board[PacMan.pacman.position.x + 1][PacMan.pacman.position.y] != 1) {
            PacMan.board[PacMan.pacman.position.x][PacMan.pacman.position.y] = 0;
            PacMan.pacman.position.x++;
            PacMan.pacman.direction = 1;
            PacMan.EatBlock();
            PacMan.board[PacMan.pacman.position.x][PacMan.pacman.position.y] = 999;
        }
    },
    EatBlock: function() {
        for(var i = 0; i < PacMan.monsters.length; i++) {
            if(PacMan.monsters[i].x == PacMan.pacman.position.x && PacMan.monsters[i].y == PacMan.pacman.position.y) {
                PacMan.KillPacMan();
                return;
            }
        }
        if(PacMan.board[PacMan.pacman.position.x][PacMan.pacman.position.y] == 5 || PacMan.board[PacMan.pacman.position.x][PacMan.pacman.position.y] == 15 || PacMan.board[PacMan.pacman.position.x][PacMan.pacman.position.y] == 25) {
            PacMan.score += PacMan.board[PacMan.pacman.position.x][PacMan.pacman.position.y];
        }else if(PacMan.board[PacMan.pacman.position.x][PacMan.pacman.position.y] == 3) {
            PacMan.pacman.lives++;
        }else if(PacMan.board[PacMan.pacman.position.x][PacMan.pacman.position.y] == 4) {
            PacMan.time = PacMan.time * 1 + 10.0;
        }else if(PacMan.figure.alive && PacMan.figure.x == PacMan.pacman.position.x && PacMan.figure.y == PacMan.pacman.position.y) {
            PacMan.score += 50;
            PacMan.figure.alive = false;
        }
    },
    Draw: function() {
        PacMan.canvasContext.clearRect(0, 0, PacMan.canvas.width, PacMan.canvas.height);
        PacMan.canvasContext.fillStyle = "#16161d";
        PacMan.canvasContext.fillRect(0, 0, PacMan.canvas.width, PacMan.canvas.height);
        for(var i = 0; i < PacMan.boardWidth; i++) {
            for(var j = 0; j < PacMan.boardHeight; j++) {
                var center = new Object();
                center.x = i * PacMan.cellSize + (PacMan.cellSize / 2);
                center.y = j * PacMan.cellSize + (PacMan.cellSize / 2);

                PacMan.canvasContext.beginPath();
                if(PacMan.board[i][j] === 1) {          //Wall
                    PacMan.canvasContext.rect(center.x - (PacMan.cellSize / 2), center.y - (PacMan.cellSize / 2), PacMan.cellSize, PacMan.cellSize);
                    PacMan.canvasContext.fillStyle = "brown";
                }else if(PacMan.board[i][j] == 3) {    //Extra life point
                    PacMan.canvasContext.drawImage(PacMan.monsterImage, 0, 512, 256, 256, center.x - (PacMan.cellSize / 2), center.y - (PacMan.cellSize / 2), PacMan.cellSize, PacMan.cellSize);
                }else if(PacMan.board[i][j] == 4) {    //Extra time
                    PacMan.canvasContext.drawImage(PacMan.monsterImage, 256, 512, 256, 256, center.x - (PacMan.cellSize / 2), center.y - (PacMan.cellSize / 2), PacMan.cellSize, PacMan.cellSize);
                }else if(PacMan.board[i][j] === 5) {    //5 points ball
                    PacMan.canvasContext.arc(center.x, center.y, (PacMan.cellSize / 10), 0, 2 * Math.PI);
                    PacMan.canvasContext.fillStyle = DEF_BALL_COLOR_5;
                }else if(PacMan.board[i][j] === 15) {   //15 points ball
                    PacMan.canvasContext.arc(center.x, center.y, (PacMan.cellSize / 10), 0, 2 * Math.PI);
                    PacMan.canvasContext.fillStyle = DEF_BALL_COLOR_15;
                }else if(PacMan.board[i][j] === 25) {   //25 points ball
                    PacMan.canvasContext.arc(center.x, center.y, (PacMan.cellSize / 10), 0, 2 * Math.PI);
                    PacMan.canvasContext.fillStyle = DEF_BALL_COLOR_25;
                }else if(PacMan.board[i][j] === 999) {  //Pac-Man <3
                    switch(PacMan.pacman.direction) {
                        case 0: //top
                            PacMan.canvasContext.arc(center.x, center.y, (PacMan.cellSize / 4), 290 * Math.PI / 180, 240 * Math.PI / 180);
                        break;
                        case 1: //right
                            PacMan.canvasContext.arc(center.x, center.y, (PacMan.cellSize / 4), 0.15 * Math.PI, 1.85 * Math.PI); // half circle
                        break;
                        case 2: //bottom
                            PacMan.canvasContext.arc(center.x, center.y, (PacMan.cellSize / 4), 120 * Math.PI / 180, 60 * Math.PI / 180);
                        break;
                        case 3: //left
                            PacMan.canvasContext.arc(center.x, center.y, (PacMan.cellSize / 4), 200 * Math.PI / 180, 150 * Math.PI / 180); // half circle
                        break;
                    }
                    PacMan.canvasContext.lineTo(center.x, center.y);
                    PacMan.canvasContext.fillStyle = PacMan.pacman.color; //color
                    PacMan.canvasContext.fill();
                    PacMan.canvasContext.beginPath();
                    switch(PacMan.pacman.direction) {
                        case 0: //top
                            PacMan.canvasContext.arc(center.x + (PacMan.cellSize / 4 / 2), center.y + (PacMan.cellSize / 4 / 10), (PacMan.cellSize / 4 / 6), 0, 2 * Math.PI); // circle
                        break;
                        case 1: //right
                            PacMan.canvasContext.arc(center.x + (PacMan.cellSize / 4 / 10), center.y - (PacMan.cellSize / 4 / 2), (PacMan.cellSize / 4 / 6), 0, 2 * Math.PI); // circle
                        break;
                        case 2: //bottom
                            PacMan.canvasContext.arc(center.x + (PacMan.cellSize / 4 / 2), center.y - (PacMan.cellSize / 4 / 10), (PacMan.cellSize / 4 / 6), 0, 2 * Math.PI); // circle
                        break;
                        case 3: //left
                            PacMan.canvasContext.arc(center.x - (PacMan.cellSize / 4 / 10), center.y - (PacMan.cellSize / 4 / 2), (PacMan.cellSize / 4 / 6), 0, 2 * Math.PI); // circle
                        break;
                    }
                    PacMan.canvasContext.fillStyle = "black"; //color
                }
                PacMan.canvasContext.fill();
            }
        }
        PacMan.DrawScoreboard();
        PacMan.DrawLives();
        PacMan.DrawMonsters();
        PacMan.DrawTime();
        if(PacMan.figure.alive) PacMan.DrawFigure();
    },
    DrawScoreboard: function() {
        PacMan.canvasContext.beginPath();
        PacMan.canvasContext.rect(PacMan.canvas.width - 100, 0, 100, 40);
        PacMan.canvasContext.fillStyle = "rgba(0, 0, 0, 0.6)";
        PacMan.canvasContext.fill();
        PacMan.canvasContext.beginPath();
        PacMan.canvasContext.textAlign = "right";
        PacMan.canvasContext.fillStyle = "white";
        PacMan.canvasContext.font = "16px Arial";
        PacMan.canvasContext.fillText("Score: " + PacMan.score.toString(), PacMan.canvas.width - 10, 24);
        PacMan.canvasContext.fill();

        var fillText = "Playing as " + AccountManager.session.username + " (" + AccountManager.session.account.firstname + " " + AccountManager.session.account.lastname + ")";
        PacMan.canvasContext.beginPath();
        PacMan.canvasContext.rect(PacMan.canvas.width / 2 - (fillText.length * 16 / 2), 0, fillText.length * 16, 40);
        PacMan.canvasContext.fillStyle = "rgba(0, 0, 0, 0.6)";
        PacMan.canvasContext.fill();
        PacMan.canvasContext.beginPath();
        PacMan.canvasContext.textAlign = "center";
        PacMan.canvasContext.fillStyle = "white";
        PacMan.canvasContext.font = "16px Arial";
        PacMan.canvasContext.fillText(fillText, PacMan.canvas.width / 2, 24);
        PacMan.canvasContext.fill();
    },
    DrawLives: function() {
        PacMan.canvasContext.beginPath();
        PacMan.canvasContext.rect(0, 0, 160, 40);
        PacMan.canvasContext.fillStyle = "rgba(0, 0, 0, 0.6)";
        PacMan.canvasContext.fill();
        PacMan.canvasContext.beginPath();
        PacMan.canvasContext.textAlign = "left";
        PacMan.canvasContext.fillStyle = "white";
        PacMan.canvasContext.font = "16px Arial";
        PacMan.canvasContext.fillText("Lives: " + PacMan.pacman.lives, 10, 24);
        PacMan.canvasContext.fill();
    },
    DrawTime: function() {
        PacMan.canvasContext.beginPath();
        PacMan.canvasContext.rect(0, 40, 160, 40);
        PacMan.canvasContext.fillStyle = "rgba(0, 0, 0, 0.6)";
        PacMan.canvasContext.fill();
        PacMan.canvasContext.beginPath();
        PacMan.canvasContext.textAlign = "left";
        PacMan.canvasContext.fillStyle = "white";
        PacMan.canvasContext.font = "16px Arial";
        PacMan.canvasContext.fillText("Time Left: " + PacMan.time, 10, 64);
        PacMan.canvasContext.fill();
    },
    DrawMonsters: function() {
        for(var i = 0; i < PacMan.monsters.length; i++) {
            var center = new Object();
            center.x = PacMan.monsters[i].x * PacMan.cellSize + (PacMan.cellSize / 2);
            center.y = PacMan.monsters[i].y * PacMan.cellSize + (PacMan.cellSize / 2);
            PacMan.canvasContext.beginPath();
            /*PacMan.canvasContext.rect(center.x - (PacMan.cellSize / 4), center.y - (PacMan.cellSize / 4), PacMan.cellSize / 2, PacMan.cellSize / 2);
            PacMan.canvasContext.fillStyle = "purple";*/
            if(i == 0) {
                PacMan.canvasContext.drawImage(PacMan.monsterImage, 0, 0, 256, 256, center.x - (PacMan.cellSize / 4), center.y - (PacMan.cellSize / 4), PacMan.cellSize / 2, PacMan.cellSize / 2);
            }else if(i == 1) {
                PacMan.canvasContext.drawImage(PacMan.monsterImage, 256, 0, 256, 256, center.x - (PacMan.cellSize / 4), center.y - (PacMan.cellSize / 4), PacMan.cellSize / 2, PacMan.cellSize / 2);
            }else if(i == 2) {
                PacMan.canvasContext.drawImage(PacMan.monsterImage, 0, 256, 256, 256, center.x - (PacMan.cellSize / 4), center.y - (PacMan.cellSize / 4), PacMan.cellSize / 2, PacMan.cellSize / 2);
            }
            PacMan.canvasContext.fill();
        }
    },
    DrawFigure: function() {
        var center = new Object();
        center.x = PacMan.figure.x * PacMan.cellSize + (PacMan.cellSize / 2);
        center.y = PacMan.figure.y * PacMan.cellSize + (PacMan.cellSize / 2);
        PacMan.canvasContext.beginPath();
        /*PacMan.canvasContext.rect(center.x - (PacMan.cellSize / 7), center.y - (PacMan.cellSize / 7), PacMan.cellSize / 4, PacMan.cellSize / 4);
        PacMan.canvasContext.fillStyle = "gold";*/
        PacMan.canvasContext.drawImage(PacMan.monsterImage, 256, 256, 256, 256, center.x - (PacMan.cellSize / 4), center.y - (PacMan.cellSize / 4), PacMan.cellSize / 2, PacMan.cellSize / 2);
        PacMan.canvasContext.fill();
    },
    EndGame: function() {
        PacMan.audio.pause();

        PacMan.controls.disabled = true;
        clearInterval(PacMan.MonsterInterval);
        clearInterval(PacMan.TimerInterval);

        PacMan.Draw();

        //Draw EndGame Text
        PacMan.canvasContext.beginPath();
        PacMan.canvasContext.textAlign = "center";
        var lineHeight = 0;
        if(PacMan.pacman.lives == 0) {
            lineHeight = Math.floor(PacMan.canvas.width / 6);
            PacMan.canvasContext.font = lineHeight + "px Arial";
            PacMan.canvasContext.fillStyle = "red";
            PacMan.canvasContext.fillText("You Lost!", PacMan.canvas.width / 2, PacMan.canvas.height / 2);
        }else if(PacMan.score < 150) {
            lineHeight = Math.floor(PacMan.canvas.width / 13);
            PacMan.canvasContext.font = lineHeight + "px Arial";
            PacMan.canvasContext.fillStyle = "gray";
            PacMan.canvasContext.fillText("You can do better!", PacMan.canvas.width / 2, PacMan.canvas.height / 2);
        }else {
            lineHeight = Math.floor(PacMan.canvas.width / 12);
            PacMan.canvasContext.font = lineHeight + "px Arial";
            PacMan.canvasContext.fillStyle = "green";
            PacMan.canvasContext.fillText("We have a winner!!!", PacMan.canvas.width / 2, PacMan.canvas.height / 2);
        }
        PacMan.canvasContext.fill();
        PacMan.canvasContext.beginPath();
        PacMan.canvasContext.font = Math.floor(PacMan.canvas.width / 12) + "px Arial";
        PacMan.canvasContext.fillStyle = "white";
        PacMan.canvasContext.fillText("Score: " + PacMan.score.toString(), PacMan.canvas.width / 2, PacMan.canvas.height / 2 + lineHeight + 16);
        PacMan.canvasContext.fill();

        clearInterval(PacMan.MainInterval);

        document.getElementById("play-again-wrapper").style.display = "block";
    },
    ResetGameState: function() {
        PacMan.board = new Array();
        PacMan.canvasContext.clearRect(0, 0, PacMan.canvas.width, PacMan.canvas.height);
        PacMan.pacman.lives = 3;
        PacMan.pacman.direction = 1;
        PacMan.controls.disabled = false;
        PacMan.score = 0;
    }
};

function CreateCanvas() {
    var canvasWrapper = document.getElementById("canvas-wrapper");

    var browserWidth = window.innerWidth || document.body.clientWidth;
    var browserHeight = window.innerHeight || document.body.clientHeight;

    if(browserWidth < 1366 || browserHeight < 768) {
        alert("Your browser resolution does not support this application 1366*768.");
       // return false;
    }

    PacMan.canvas = document.createElement("canvas");

    if(!(!!(PacMan.canvas.getContext && PacMan.canvas.getContext('2d')))) {
        alert("Canvas is not supported!");
        return false;
    }

    PacMan.canvas.width = browserWidth;
    PacMan.canvas.height = browserHeight;

    canvasWrapper.appendChild(PacMan.canvas);
    document.body.onresize = PacMan.Resize;

    PacMan.canvasContext = PacMan.canvas.getContext("2d");
    PacMan.canvasContext.fillStyle = "#16161d";
    PacMan.canvasContext.fillRect(0, 0, PacMan.canvas.width, PacMan.canvas.height);

    PacMan.monsterImage = document.createElement("img");
    PacMan.monsterImage.src = "monsters.png";

    addEventListener("keydown", function(e) {
        PacMan.keysDown[e.key] = true;
    }, false);
    addEventListener("keyup", function(e) {
        PacMan.keysDown[e.key] = false;
    }, false);

    return true;
}

var ChangeKey_DOM = document.getElementById("change-controls"), ChangeKey_keyName, ChangeKey_currentKey, ChangeKey_currentKeyName, ChangeKey_controlNameDOM = document.getElementById("change-controls-control-name"), ChangeKey_controlKeyNameDOM = document.getElementById("change-controls-key-name"), ChangeKey_activeInput;
function ChangeKey(keyName, input) {
    ChangeKey_keyName = keyName;
    ChangeKey_DOM.style.display = "block";
    if(keyName == "up") {
        ChangeKey_controlNameDOM.innerText = "Move Up";
    }else if(keyName == "right") {
        ChangeKey_controlNameDOM.innerText = "Move Right";
    }else if(keyName == "bottom") {
        ChangeKey_controlNameDOM.innerText = "Move Bottom";
    }else if(keyName == "left") {
        ChangeKey_controlNameDOM.innerText = "Move Left";
    }
    ChangeKey_currentKey = 0;
    ChangeKey_controlKeyNameDOM.innerText = PacMan.controls[ChangeKey_keyName];
    ChangeKey_activeInput = input;
    document.onkeydown = function(e) {
        ChangeKey_currentKey = e.key;
        ChangeKey_controlKeyNameDOM.innerText = e.key;
        ChangeKey_currentKeyName = e.key;
    };
}

function SaveKey() {
    if(ChangeKey_currentKey != 0) {
        PacMan.controls[ChangeKey_keyName] = ChangeKey_currentKeyName;
        ChangeKey_activeInput.value = ChangeKey_currentKeyName;
    }
    CancelKey();
}
function CancelKey() {
    ChangeKey_DOM.style.display = "none";
    document.onkeydown = undefined;
}

function StartGame(button) {
    //Check food count
    var foodCount = document.getElementById("food-count").value * 1;
    if(isNaN(foodCount) || foodCount < 3 || foodCount > 2000) {
        alert("Invalid food count, please enter a valid number.");
        return;
    }
    DEF_FOOD_COUNT = foodCount;
    DEF_GAME_TIME = document.getElementById("time-seconds").value * 1;
    if(DEF_GAME_TIME < 60 || isNaN(DEF_GAME_TIME)) DEF_GAME_TIME = 60;
    DEF_BALL_COLOR_5 = document.getElementById("color-5").value;
    DEF_BALL_COLOR_15 = document.getElementById("color-15").value;
    DEF_BALL_COLOR_25 = document.getElementById("color-25").value;
    DEF_AMOUNT_OF_MONSTERS = document.getElementById("monster-amount").value * 1;
    if(DEF_AMOUNT_OF_MONSTERS != 1 && DEF_AMOUNT_OF_MONSTERS != 2 && DEF_AMOUNT_OF_MONSTERS != 3) {
        DEF_AMOUNT_OF_MONSTERS = 3;
    }

    //Check keys
    var controls = [PacMan.controls["up"], PacMan.controls["right"], PacMan.controls["bottom"], PacMan.controls["left"]];

    if((PacMan.controls["up"].length == 0 || CountArray(controls, PacMan.controls["up"]) != 1) ||
       (PacMan.controls["right"].length == 0 || CountArray(controls, PacMan.controls["right"]) != 1) ||
       (PacMan.controls["bottom"].length == 0 || CountArray(controls, PacMan.controls["bottom"]) != 1) ||
       (PacMan.controls["left"].length == 0 || CountArray(controls, PacMan.controls["left"]) != 1)) {
        alert("Invalid control keys. Please check control options.");
        return;
    }

    PacMan.Start();
    button.parentNode.style.display = "none";
}

function PlayAgain(el) {
    PacMan.ResetGameState();
    el.parentNode.style.display = "none";
    document.getElementById("start-menu").style.display = "block";
    document.getElementById("canvas-wrapper").style.display = "none";
}

function RandomHEXColor() {
    var color = "#" + (Math.random() * 0xFFFFFF << 0).toString(16);
    while(color.length < 7) color += Math.floor(Math.random() * 9).toString();
    return color;
}

function RandomizeOptions() {
    document.getElementById("food-count").value = Math.floor(Math.random() * 40) + 50;
    document.getElementById("color-5").value = RandomHEXColor();
    document.getElementById("color-15").value = RandomHEXColor();
    document.getElementById("color-25").value = RandomHEXColor();
    document.getElementById("time-seconds").value = Math.floor(Math.random() * 600) + 60;
    document.getElementById("monster-amount").value = Math.floor(Math.random() * 3) + 1;

    var randomKeys = ["w", "a", "s", "d", "ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"];
    randomKeys = ShuffleArray(randomKeys);

    var controls = ["up", "right", "bottom", "left"];
    for(var i = 0; i < controls.length; i++) {
        PacMan.controls[controls[i]] = randomKeys[randomKeys.length - 1];
        document.getElementById("key-" + controls[i]).value = PacMan.controls[controls[i]];
        randomKeys.pop();
    }
}

var AccountManager = {
    session: {
        active: false,
        username: "",
        account: {}
    },

    Accounts: [],
    
    DoLogin: function() {
        if(AccountManager.session.active) {
            alert("You are already logged in!");
            return;
        }
        var username = document.getElementById("login-username").value;
        var password = document.getElementById("login-password").value;

        for(var i = 0; i < AccountManager.Accounts.length; i++) {
            if(AccountManager.Accounts[i].username == username) {
                if(AccountManager.Accounts[i].password != password) {
                    alert("Password is wrong!");
                    return;
                }else {
                    AccountManager.session.active = true;
                    AccountManager.session.username = username;
                    AccountManager.session.account = AccountManager.Accounts[i];
                    Pages.DisablePage("register");
                    Pages.DisablePage("login");
                    Pages.DisablePage("welcome");
                    Pages.EnablePage("game");
                    document.getElementById("logout-button").style.display = "block";
                    Pages.ShowPage("game");
                    return;
                }
            }
        }

        alert("User does not exist!");
    },
    DoRegister: function() {
		
		
		//jQuery use:
		var username =  $( "#register-username" ).val();
        var password =  $( "#register-password" ).val();
        var firstname = $( "#register-firstname" ).val();
        var lastname =  $( "#register-lastname" ).val();
        var email =     $( "#register-email" ).val();
        var bday =      $( "#register-bday" ).val();

        var regex = /[a-zA-Z]/g;
        var regexNum = /[0-9]/g;
        var emailFilter = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm;

        if(username.length == 0 || password.length == 0 || firstname.length == 0 || lastname.length == 0 || email.length == 0 || bday.length == 0) {
            alert("All fields must be filled!");
            return;
        }
        
        //Username
        for(var i = 0; i < AccountManager.Accounts.length; i++) {
            if(AccountManager.Accounts[i].username == username) {
                alert("The user name is taken!");
                return;
            }
        }

        //Email
        if(!emailFilter.test(email)) {
            alert("Email address is not valid!");
            return;
        }

        //Password
        if(password.length < 8) {
            alert("Password is too short (must be at least 8 characters long)!");
            return;
        }
        if(!/\d/.test(password)) {
            alert("Password must contain numbers!");
            return;
        }

        if(!regex.test(password)) {
            alert("Password must contain characters!");
            return;
        }

        //First & Last Name
        if(regexNum.test(firstname)) {
            alert("Your first name can not include numbers!");
            return;
        }
        if(regexNum.test(lastname)) {
            alert("Your last name can not include numbers!");
            return;
        }

        AccountManager.Accounts.push({
            username: username,
            password: password,
            firstname: firstname,
            lastname: lastname,
            email: email,
            bday: bday
        });
        AccountManager.session.active = true;
        AccountManager.session.username = username;
        AccountManager.session.account = AccountManager.Accounts[i];
        Pages.DisablePage("register");
        Pages.DisablePage("login");
        Pages.DisablePage("welcome");
        Pages.EnablePage("game");
        document.getElementById("logout-button").style.display = "block";
        alert("Welcome to the system!");
        Pages.ShowPage("game");
    },
    Logout: function() {
        Pages.DisablePage("game");
        document.getElementById("logout-button").style.display = "none";
        Pages.EnablePage("register");
        Pages.EnablePage("login");
        Pages.EnablePage("welcome");
        AccountManager.session.active = false;
        Pages.ShowPage("welcome");
    }
};

var Pages = {
    firstTimeGame: true,
    PageIDs: [],
    InitPage: function(id) {
        Pages[id] = {
            dom: document.getElementById(id + "-page"),
            button: document.getElementById(id + "-page-button")
        };
        Pages.PageIDs.push(id);
    },
    ShowPage: function(id) {
        if(id == "game" && Pages.firstTimeGame) {
            Pages.firstTimeGame = false;
            if(!CreateCanvas()) {
                alert("Couldn't create canvas!");
            }
        }
        for(var i = 0; i < Pages.PageIDs.length; i++) {
            Pages[Pages.PageIDs[i]].dom.style.display = "none";
            Pages[Pages.PageIDs[i]].button.className = "";
        }
        Pages[id].dom.style.display = "block";
        Pages[id].button.className = "active";
    },
    DisablePage: function(id) {
        Pages[id].button.style.display = "none";
        Pages[id].button.className = "";
        Pages[id].dom.style.display = "none";
    },
    EnablePage: function(id) {
        Pages[id].button.style.display = "block";
    }
};

function InitPages() {
    Pages.InitPage("welcome");
    Pages.InitPage("register");
    Pages.InitPage("login");
    Pages.InitPage("about");
    Pages.InitPage("game");

    Pages.ShowPage("welcome");

    var foodCount = document.getElementById("food-count");
    for(var i = 50; i < 91; i++) {
        var option = document.createElement("option");
        option.value = i;
        option.innerText = i.toString();
        foodCount.appendChild(option);
    }
}

InitPages();

AccountManager.Accounts.push({
    username: "a",
    password: "a",
    firstname: "A",
    lastname: "P",
    email: "a",
    bday: "2019-05-10"
});



     modal = document.getElementById('myModal');

    // Get the button that opens the modal
     btn = document.getElementById("myBtn");

    // Get the <span> element that closes the modal
     span = document.getElementsByClassName("close")[0];

    window.addEventListener('keydown', function (e) {
        if(e.key == 'Escape' || e.key == 'Esc' || e.key == 27){
            modal.style.display = "none";
        }
    })

    // When the user clicks on the button, open the modal
    btn.onclick = function() {
        modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
	