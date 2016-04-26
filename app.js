function Stone(color, position) {
    this.color = color;
    this.position = position;
}

function Plan(size, fields) {
    this.size = size;
    this.fields = fields;
}

Plan.prototype = {

    constructor: Plan,

    getField: function (x, y) {
        return this.fields[x][y];
    },

}

function PlanRenderrer(plan, fieldSize) {
    this.plan = plan;

    this.fieldSize = fieldSize;

    this.canvas = document.createElement('canvas');
    this.canvas.width = plan.size * fieldSize;
    this.canvas.height = plan.size * fieldSize;
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

                var planEnd = this.plan.size - 1;
                var center = (this.plan.size - 1) / 2;

                if (x == 0 && y == 0 // top-left corner
                    || x == 0 && y == planEnd // bottom-left corner
                    || x == planEnd && y == 0 // top-right corner
                    || x == planEnd && y == planEnd // bottom-right corner
                    || x == center && y == center // center
                ) {
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

    var plan = new Plan(11, stones);

    var renderrer = new PlanRenderrer(plan, 31);
}
