const PUZZLE_MAP_HEXAGON = [
    [0, 0], [0, 1], [0, 2], [0, -1], [0, -2], [1, 0], [2, 0], [3, 0],
    [-1, 0], [-2, 0], [-3, 0], [1, 1], [2, 1], [-1, 1], [-2, 1],
    [-3, 1], [1, -1], [2, -1], [3, -1], [-1, -1], [-2, -1], [-1, -2],
    [-1, 2], [-1, 3], [1, 2], [1, -2], [1, -3], [-3, 2], [-3, 3],
    [3, -2], [3, -3], [-2, 2], [-2, 3], [2, -2], [2, -3]
];
const PUZZLE_MAP_SQUARE = [
    [0, 0], [0, -1], [0, -2], [0, 1], [0, 2],
    [1, 0], [2, 0], [3, 0], [-1, 0], [-2, 0], [-3, 0],
    [1, 1], [2, 1], [3, 1], [-1, 1], [-2, 1], [-3, 1],
    [1, 2], [2, 2], [3, 2], [-1, 2], [-2, 2], [-3, 2],
    [1, -1], [2, -1], [3, -1], [-1, -1], [-2, -1], [-3, -1],
    [1, -2], [2, -2], [3, -2], [-1, -2], [-2, -2], [-3, -2]
];
const PUZZLE_MAP_TRIANGLE = [
    [0, 0], [0, 1], [0, 2], [0, -1], [0, -2],
    [1, 0], [2, 0], [3, 0], [4, 0], [-1, 0], [-2, 0], [-3, 0], [-4, 0],
    [1, 1], [2, 1], [3, 1], [4, 1], [-1, 1], [-2, 1], [-3, 1], [-4, 1],
    [1, 2], [2, 2], [3, 2], [-1, 2], [-2, 2], [-3, 2],
    [1, -1], [2, -1], [3, -1], [4, -1], [-1, -1], [-2, -1], [-3, -1], [-4, -1],
    [1, -2], [2, -2], [3, -2], [4, -2], [-1, -2], [-2, -2], [-3, -2], [-4, -2]
];
const MinigameMaster = {
    mapTiles: {},
    mapTileKeys: [],
    dummyBlockersList: [],
    puzzleIsReady: false,
    createPuzzle: function (blockersAmount, tt, p) {
        this.mapTiles = {};
        let MAP_TILES_POS;
        if (tt === "HEXAGON")
            MAP_TILES_POS = PUZZLE_MAP_HEXAGON;
        else if (tt === "SQUARE")
            MAP_TILES_POS = PUZZLE_MAP_SQUARE;
        else
            MAP_TILES_POS = PUZZLE_MAP_TRIANGLE;
        MAP_TILES_POS.forEach(pos => {
            if (!!this.mapTiles[posToKey(pos)])
                throw "whattt";
            let newTile;
            if (tt === "HEXAGON")
                newTile = new Hexagon_Tile(pos);
            else if (tt === "SQUARE")
                newTile = new Square_Tile(pos);
            else
                newTile = new Triangle_Tile(pos);
            this.mapTiles[posToKey(pos)] = newTile;
        });
        this.mapTileKeys = Object.keys(this.mapTiles);
        this.puzzleIsReady = true;
    },
    render: function (p) {
        if (!this.puzzleIsReady) {
            p.textSize(30);
            p.fill(250);
            p.text("Loading", 300, 300);
            return;
        }
        p.translate(300, 320);
        p.stroke(255);
        p.noFill();
        this.mapTileKeys.forEach((tileKey) => {
            renderTile(p, this.mapTiles[tileKey]);
        });
    }
};
const sketch = (p) => {
    p.setup = () => {
        p.createCanvas(600, 600);
        p.rectMode(p.CENTER);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(20);
        MinigameMaster.createPuzzle(5, "TRIANGLE" || "SQUARE" || "HEXAGON", p);
    };
    p.draw = () => {
        p.push();
        p.background(20);
        p.stroke(0);
        p.noFill();
        MinigameMaster.render(p);
        p.pop();
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
    SQUARE: 80.0, TRIANGLE: 100.0, HEXAGON: 50.0
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
    constructor(pos) {
        this.pos = [0, 0];
        this.renderPos = [0, 0];
        this.neighbors = {};
        this.verticesList = [];
        const [x, y] = pos;
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
    constructor(pos) {
        this.pos = [0, 0];
        this.renderPos = [0, 0];
        this.neighbors = {};
        this.verticesList = [];
        const [x, y] = pos;
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
    constructor(pos) {
        this.pos = [0, 0];
        this.renderPos = [0, 0];
        this.neighbors = {};
        this.verticesList = [];
        this.isUpward = false;
        const [x, y] = pos;
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
    p.push();
    p.fill("white");
    p.text(tile.pos, tile.renderPos[0], tile.renderPos[1]);
    p.pop();
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