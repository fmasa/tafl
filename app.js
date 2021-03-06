function Stone(color, position) {
    this.color = color;
    this.position = position;
}

function Plan(size, fields, onTurn) {
    this.size = size;
    this.fields = fields;
    this.onTurn = onTurn;

    var kingFound = false;
    for (var x = 0; x < size; x++) {
        for (var y = 0; y < size; y++) {
            if (fields[x][y] == 'K') {
                if(kingFound) {
                    console.error('There are multiple kings on the plan!');
                }
                this.kingsLocation = [x, y];
                kingFound = true;
            }
        }
    }
    if (!kingFound) {
        console.error('There is no king on the plan!');
    }
}

Plan.prototype = {

    constructor: Plan,

    selectedStone: null,

    kingsLocation: null,

    getField: function (x, y, getColor) {
        if (!this.fields[x] || !this.fields[x][y]) {
            return null;
        }
        return getColor && this.fields[x][y] == 'K' ? 'W' : this.fields[x][y];
    },

    isFieldEmpty: function (x, y) {
        return this.fields[x][y] == '.';
    },

    isSpecialField: function (x, y, excludeCenter) {
        var planEnd = this.size - 1;
        var center = (this.size - 1) / 2;

        if (x == 0 && y == 0 // top-left corner
            || x == 0 && y == planEnd // bottom-left corner
            || x == planEnd && y == 0 // top-right corner
            || x == planEnd && y == planEnd // bottom-right corner
            || x == center && y == center && !excludeCenter // center
        ) {
            return true;
        }

        return false;
    },

    /**
     * Stones can move as towers in chess
     * @param int fromX
     * @param int fromY
     * @param int toX
     * @param int toY
     * @returns {boolean}
     */
    canPerformStep: function (fromX, fromY, toX, toY, isKing) {


        if (this.isSpecialField(toX, toY) && !isKing) {
            return false
        } else if (fromX == toX) {
            var min = fromY < toY ? fromY + 1 : toY;
            var max = fromY > toY ? fromY - 1 : toY;
            for (var y = min; y <= max; y++) {
                if (!this.isFieldEmpty(toX, y)) {
                    return false;
                }
            }
        } else if (fromY == toY) {
            var min = fromX < toX ? fromX + 1 : toX;
            var max = fromX > toX ? fromX - 1 : toX;
            for (var x = min; x <= max; x++) {
                if (!this.isFieldEmpty(x, toY)) {
                    return false;
                }
            }
        } else {
            return false;
        }
        return true;
    },

    checkKills: function (x, y) {
        var attacker = this.getField(x, y, true);
        var defender = attacker == 'B' ? 'W' : 'B';

        var checks = [
            // defenderX, defenderY, attackerX, attackerY
            [x + 1, y, x + 2, y], // Defender on the right
            [x - 1, y, x - 2, y], // Defender on the left
            [x, y + 1, x, y + 2], // Defender below
            [x, y - 1, x, y - 2], // Defendeer above
        ];

        for (var i = 0; i < 4; i++) {
            var check = checks[i];
            if (this.getField(check[0], check[1]) == defender && this.getField(check[2], check[3], true) == attacker) {
                this.fields[check[0]][check[1]] = '.';
            }
        }
    },

    checkKing: function () {
        var x = this.kingsLocation[0];
        var y = this.kingsLocation[1];

        if (this.isSpecialField(x, y, true)) { // King is on throne!
            alert('White won!');
            this.onTurn = null;
            return;
        }

        var checks = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
        for(var i = 0; i < 4; i++) {
            var field = this.getField(checks[i][0],checks[i][1]);
            if(!this.isSpecialField(checks[i][0], checks[i][1], true) && field && field != 'B') {
                return;
            }

        }
        alert('Black won!');
        this.onTurn = null;
    },

    clickedOnField: function (x, y) {
        var stone = this.selectedStone;
        var field = this.getField(x, y, true);
        if (stone && field != this.getField(stone[0], stone[1], true)) {
            if (this.canPerformStep(stone[0], stone[1], x, y, this.getField(stone[0], stone[1]) == 'K')) {
                var color = this.getField(stone[0], stone[1]);
                this.fields[stone[0]][stone[1]] = '.';
                this.fields[x][y] = color;

                if (color == 'K') { // Update king's location
                    this.kingsLocation = [x, y];
                }

                this.selectedStone = null;
                this.checkKills(x, y);
                this.checkKing();
                if (this.onTurn) {
                    this.onTurn = this.onTurn == 'B' ? 'W' : 'B';
                }

            }
        } else if (field == this.onTurn) {
            this.selectedStone = [x, y];
        }
    }
    ,

}

function PlanRenderrer(plan, fieldSize) {
    this.plan = plan;

    this.fieldSize = fieldSize;

    this.canvas = document.createElement('canvas');
    this.canvas.width = plan.size * fieldSize;
    this.canvas.height = plan.size * fieldSize;

    var that = this;
    this.canvas.addEventListener('click', function (event) {
        var x = event.pageX - that.canvas.offsetLeft;
        var y = event.pageY - that.canvas.offsetTop;
        that.click(x, y)
    }, false);

    document.body.appendChild(this.canvas);

    this.context = this.canvas.getContext('2d');

    this.render();
}

PlanRenderrer.prototype = {

    constructor: PlanRenderrer,

    render: function () {

        var context = this.context;
        var fieldSize = this.fieldSize;
        for (var x = 0; x < this.plan.size; x++) {

            for (var y = 0; y < this.plan.size; y++) {

                if (this.plan.isSpecialField(x, y)) {
                    context.fillStyle = 'black';
                } else {
                    context.fillStyle = 'gray';
                }
                context.fillRect(x * fieldSize, y * fieldSize, fieldSize, fieldSize);
                context.strokeRect(x * fieldSize, y * fieldSize, fieldSize, fieldSize);
                this.renderStone(x, y);

            }
        }
    },

    click: function (x, y) {
        var fieldX = Math.floor(x / this.fieldSize);
        var fieldY = Math.floor(y / this.fieldSize);
        this.plan.clickedOnField(fieldX, fieldY);
    },

    renderStone: function (x, y) {

        var context = this.context;
        var stone = this.plan.getField(x, y);
        var fieldSize = this.fieldSize;

        if (stone == '.') {
            return;
        }

        stoneX = x * fieldSize + fieldSize / 2;
        stoneY = y * fieldSize + fieldSize / 2;
        context.beginPath();
        context.arc(stoneX, stoneY, 0.3 * fieldSize, 0, 2 * Math.PI);
        context.closePath();
        context.stroke();

        if (stone == 'W' || stone == 'K') {
            context.fillStyle = 'white';
        } else {
            context.fillStyle = 'black';
        }

        var selected = this.plan.selectedStone;
        if (selected && selected[0] == x && selected[1] == y) {
            context.strokeStyle = '#3498db';
            var lineWidth = context.lineWidth;
            context.lineWidth = 3;

            context.stroke();

            context.lineWidth = lineWidth;
            context.strokeStyle = 'black';
        }

        context.fill()

        if (stone == 'K') {
            context.beginPath();
            context.arc(stoneX, stoneY, 0.1 * fieldSize, 0, 2 * Math.PI);
            context.closePath();
            context.stroke();
            context.fillStyle = 'gold';
            context.fill();
        }

    }

}

window.onload = function () {

    var stones = [
        ['.', '.', '.', 'B', 'B', 'B', 'B', 'B', '.', '.', '.'],
        ['.', '.', '.', '.', '.', 'B', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'],
        ['B', '.', '.', '.', '.', 'W', '.', '.', '.', '.', 'B'],
        ['B', '.', '.', '.', 'W', 'W', 'W', '.', '.', '.', 'B'],
        ['B', 'B', '.', 'W', 'W', 'K', 'W', 'W', '.', 'B', 'B'],
        ['B', '.', '.', '.', 'W', 'W', 'W', '.', '.', '.', 'B'],
        ['B', '.', '.', '.', '.', 'W', '.', '.', '.', '.', 'B'],
        ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', 'B', '.', '.', '.', '.', '.'],
        ['.', '.', '.', 'B', 'B', 'B', 'B', 'B', '.', '.', '.'],
    ];

    var plan = new Plan(11, stones, 'B');

    var renderrer = new PlanRenderrer(plan, 31);

    setInterval(function () {
        renderrer.render();
    }, Math.floor(1000 / 60)); // 60 FPS :D
}
