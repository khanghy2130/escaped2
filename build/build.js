const sketch = (p) => {
    const CANVAS_SIZE = 600;
    p.setup = () => {
        p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    };
    p.draw = () => {
        p.background(100);
    };
};
window.onload = () => {
    const canvasDiv = document.getElementById("canvas-program-container");
    canvasDiv.oncontextmenu = function (e) {
        e.preventDefault();
    };
    new p5(sketch, canvasDiv);
};
const SQUARE_VECTOR_KEYS_LIST = ["1,0", "0,1", "-1,0", "0,-1"];
class Tile {
    constructor(x, y) {
        this.pos = [x, y];
    }
}
function getWallRenderPos(tile, vectorKey, tt) {
    return [[0, 0], [0, 0]];
}
//# sourceMappingURL=build.js.map