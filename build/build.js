const sketch = (p) => {
    const CANVAS_SIZE = 600;
    p.setup = () => {
        p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    };
    var hex = new Hexagon_Tile(1, 1);
    var sq = new Square_Tile(2, 2);
    var tri = new Triangle_Tile(2, 2);
    var listSize = 10;
    var hexList = [];
    for (let y = 0; y < listSize; y++) {
        for (let x = 0; x < listSize; x++) {
            hexList.push(new Hexagon_Tile(x, y));
        }
    }
    var sqList = [];
    for (let y = 0; y < listSize; y++) {
        for (let x = 0; x < listSize; x++) {
            sqList.push(new Square_Tile(x, y));
        }
    }
    var triList = [];
    for (let y = 0; y < listSize; y++) {
        for (let x = 0; x < listSize; x++) {
            triList.push(new Triangle_Tile(x, y));
        }
    }
    p.draw = () => {
        p.background(100);
        p.stroke(0);
        p.noFill();
        var sss = p.ceil((p.frameCount % 180) / 60);
        switch (sss) {
            case 1:
                hexList.forEach(t => renderTile(p, t));
                break;
            case 2:
                sqList.forEach(t => renderTile(p, t));
                break;
            case 3:
                triList.forEach(t => renderTile(p, t));
                break;
        }
    };
};
window.onload = () => {
    const canvasDiv = document.getElementById("canvas-program-container");
    canvasDiv.oncontextmenu = function (e) {
        e.preventDefault();
    };
    new p5(sketch, canvasDiv);
};
const SCALINGS = {
    SQUARE: 100.0, TRIANGLE: 110.0, HEXAGON: 60.0
};
const CONSTANTS = {
    HEXAGON_HALF_SQRT_3: SCALINGS.HEXAGON * Math.sqrt(3) / 2,
    HEXAGON_HALF_SCALING: SCALINGS.HEXAGON / 2,
    TRIANGLE_HEIGHT: SCALINGS.TRIANGLE * Math.sqrt(3) / 2,
    TRIANGLE_CENTER_Y: SCALINGS.TRIANGLE / (Math.sqrt(3) * 2),
};
const FOUR_DIR_VECTORS_LIST = [
    [1, 0], [0, 1], [-1, 0], [0, -1]
];
const SIX_DIR_VECTORS_LIST = [
    [1, 0], [0, 1], [-1, 0], [0, -1], [-1, 1], [1, -1]
];
class Square_Tile {
    constructor(x, y) {
        this.pos = [0, 0];
        this.renderPos = [0, 0];
        this.neighbors = {};
        this.verticesList = [];
        this.pos = [x, y];
        FOUR_DIR_VECTORS_LIST.forEach(vec => {
            this.neighbors[posToKey([
                x + vec[0],
                y + vec[1]
            ])] = null;
        });
        this.renderPos = [
            x * SCALINGS.SQUARE,
            y * SCALINGS.SQUARE,
        ];
        const [rx, ry] = this.renderPos;
        const HS = SCALINGS.SQUARE / 2;
        this.verticesList = [
            [rx - HS, ry - HS],
            [rx + HS, ry - HS],
            [rx + HS, ry + HS],
            [rx - HS, ry + HS]
        ];
    }
}
class Hexagon_Tile {
    constructor(x, y) {
        this.pos = [0, 0];
        this.renderPos = [0, 0];
        this.neighbors = {};
        this.verticesList = [];
        this.pos = [x, y];
        FOUR_DIR_VECTORS_LIST.forEach(vec => {
            this.neighbors[posToKey([
                x + vec[0],
                y + vec[1]
            ])] = null;
        });
        this.renderPos = [
            x * SCALINGS.HEXAGON * 3 / 2,
            y * CONSTANTS.HEXAGON_HALF_SQRT_3 * 2 +
                x * CONSTANTS.HEXAGON_HALF_SQRT_3
        ];
        const [rx, ry] = this.renderPos;
        this.verticesList = [
            [rx + SCALINGS.HEXAGON, ry],
            [rx + CONSTANTS.HEXAGON_HALF_SCALING, ry + CONSTANTS.HEXAGON_HALF_SQRT_3],
            [rx - CONSTANTS.HEXAGON_HALF_SCALING, ry + CONSTANTS.HEXAGON_HALF_SQRT_3],
            [rx - SCALINGS.HEXAGON, ry],
            [rx - CONSTANTS.HEXAGON_HALF_SCALING, ry - CONSTANTS.HEXAGON_HALF_SQRT_3],
            [rx + CONSTANTS.HEXAGON_HALF_SCALING, ry - CONSTANTS.HEXAGON_HALF_SQRT_3]
        ];
    }
}
class Triangle_Tile {
    constructor(x, y) {
        this.pos = [0, 0];
        this.renderPos = [0, 0];
        this.neighbors = {};
        this.verticesList = [];
        this.isUpward = false;
        this.pos = [x, y];
        this.isUpward = (x + y) % 2 === 0;
        FOUR_DIR_VECTORS_LIST.forEach(vec => {
            this.neighbors[posToKey([
                x + vec[0],
                y + vec[1]
            ])] = null;
        });
        this.renderPos = [
            x * SCALINGS.TRIANGLE / 2,
            y * CONSTANTS.TRIANGLE_HEIGHT
        ];
        if (this.isUpward) {
            this.renderPos[1] += CONSTANTS.TRIANGLE_HEIGHT - (2 * CONSTANTS.TRIANGLE_CENTER_Y);
        }
        const [rx, ry] = this.renderPos;
        if (this.isUpward) {
            this.verticesList = [
                [rx, ry - (CONSTANTS.TRIANGLE_HEIGHT - CONSTANTS.TRIANGLE_CENTER_Y)],
                [rx - SCALINGS.TRIANGLE / 2, ry + CONSTANTS.TRIANGLE_CENTER_Y],
                [rx + SCALINGS.TRIANGLE / 2, ry + CONSTANTS.TRIANGLE_CENTER_Y]
            ];
        }
        else {
            this.verticesList = [
                [rx, ry + (CONSTANTS.TRIANGLE_HEIGHT - CONSTANTS.TRIANGLE_CENTER_Y)],
                [rx - SCALINGS.TRIANGLE / 2, ry - CONSTANTS.TRIANGLE_CENTER_Y],
                [rx + SCALINGS.TRIANGLE / 2, ry - CONSTANTS.TRIANGLE_CENTER_Y]
            ];
        }
    }
}
function renderTile(p, tile) {
    p.beginShape();
    tile.verticesList.forEach(vPos => p.vertex(vPos[0], vPos[1]));
    p.endShape(p.CLOSE);
}
function posToKey(pos) {
    return `${pos[0]},${pos[1]}`;
}
function keyToPos(key) {
    const xy = key.split(",").map(n => Number(n));
    if (xy.length !== 2)
        throw "Not a valid pos key";
    if (xy.some(n => isNaN(n)))
        throw "NaN found in key";
    return [xy[0], xy[1]];
}
//# sourceMappingURL=build.js.map