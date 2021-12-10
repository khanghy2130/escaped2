const sketch = (p: p5) => {

  const CANVAS_SIZE : number = 600;

  p.setup = () => {
    p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    

  };

  var hh = new Square_Tile(5,5);
  console.log(hh);

  p.draw = () => {
    p.background(100);

    p.fill(0);
    p.beginShape();
    hh.verticesList.forEach(vPos => p.vertex(vPos[0],vPos[1]));
		p.endShape(p.CLOSE);
  };
};

window.onload = () => {
  const canvasDiv: HTMLElement = document.getElementById("canvas-program-container");
  canvasDiv.oncontextmenu = function (e) {
      e.preventDefault(); // disable right-click menu on canvas
  };

  new p5(sketch, canvasDiv);
};

