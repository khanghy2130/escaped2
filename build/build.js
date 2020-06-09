const sketch = (p) => {
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 500;
    let exampleImg;
    p.preload = () => {
        exampleImg = p.loadImage("build/assets/example-image.png");
    };
    p.setup = () => {
        p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    };
    p.draw = () => {
        p.background(p.cos(p.frameCount / 50) * 100 + 100, 50, 0);
        p.fill(250, 250, 120);
        p.square(150, 150, SQUARE_SIZE);
        p.image(exampleImg, 200, 200, 350, 200);
    };
};
window.onload = () => {
    const canvasDiv = document.getElementById("canvas-program-container");
    canvasDiv.oncontextmenu = function (e) {
        e.preventDefault();
    };
    new p5(sketch, canvasDiv);
};
const SQUARE_SIZE = 120;
//# sourceMappingURL=build.js.map