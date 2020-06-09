const sketch = (p) => {
    const x = 100;
    const y = 100;
    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
    };
    p.draw = () => {
        p.background(20, 50, 0);
        p.fill(255);
        p.rect(x, y, 50, 50);
    };
    p.windowResized = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
    };
};
window.onload = () => {
    const canvasDiv = document.getElementById("canvas-program-container");
    new p5(sketch, canvasDiv);
    canvasDiv.oncontextmenu = function (e) {
        e.preventDefault();
    };
};
//# sourceMappingURL=build.js.map