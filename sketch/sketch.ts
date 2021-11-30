const sketch = (p: p5) => {

  const CANVAS_WIDTH : number = 600;
  const CANVAS_HEIGHT : number = 600;

  p.setup = () => {
    p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    
  };

  p.draw = () => {
    p.background(p.cos(p.frameCount / 50) * 100 + 100, 50, 0);
    p.fill(250, 250, 120);
    p.square(150, 150, SQUARE_SIZE);
  };
};

window.onload = () => {
  const canvasDiv: HTMLElement = document.getElementById("canvas-program-container");
  canvasDiv.oncontextmenu = function (e) {
      e.preventDefault(); // disable right-click menu on canvas
  };

  new p5(sketch, canvasDiv);
};

