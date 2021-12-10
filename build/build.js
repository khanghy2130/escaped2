const sketch = (p) => {
    const CANVAS_SIZE = 600;
    p.setup = () => {
        p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    };
    var hh = new Square_Tile(5, 5);
    console.log(hh);
    p.draw = () => {
        p.background(100);
        p.fill(0);
        p.beginShape();
        hh.verticesList.forEach(vPos => p.vertex(vPos[0], vPos[1]));
        p.endShape(p.CLOSE);
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
    SQUARE: 100.0, TRIANGLE: 1.0, HEXAGON: 1.0
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
        this.renderPos = [
            this.pos[0] * SCALINGS.SQUARE,
            this.pos[1] * SCALINGS.SQUARE,
        ];
        FOUR_DIR_VECTORS_LIST.forEach(vec => {
            this.neighbors[posToKey([
                this.pos[0] + vec[0],
                this.pos[1] + vec[1]
            ])] = null;
        });
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
function triangleIsUpward(pos) {
    return (pos[0] + pos[1]) % 2 === 0;
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