const sketch = (p: p5) => {

  const CANVAS_SIZE : number = 600;

  p.setup = () => {
    p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    

  };

  p.draw = () => {
    p.background(100);
  };
};

window.onload = () => {
  const canvasDiv: HTMLElement = document.getElementById("canvas-program-container");
  canvasDiv.oncontextmenu = function (e) {
      e.preventDefault(); // disable right-click menu on canvas
  };

  new p5(sketch, canvasDiv);
};

