const sketch = (p: p5) => {

	

	

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


        // var hex = new Hexagon_Tile([0, 0]);
	    // var sq = new Square_Tile([0, 0]);
	    // var tri = new Triangle_Tile([0, -0.1]);
		// renderTile(p, hex);
		// renderTile(p, sq);
		// renderTile(p, tri);

        p.pop();
	};
};

window.onload = () => {
	const canvasDiv: HTMLElement = document.getElementById("canvas-program-container");
	canvasDiv.oncontextmenu = function (e) {
		e.preventDefault(); // disable right-click menu on canvas
	};

	new p5(sketch, canvasDiv);
};

