const sketch = (p: p5) => {

	

	

    p.setup = () => {
		p.createCanvas(600, 600);
        p.rectMode(p.CENTER);
        p.textAlign(p.CENTER, p.CENTER);
        p.textFont("monospace");
        p.angleMode(p.DEGREES);

        const l: Tile_Type[] = ["TRIANGLE" , "SQUARE" , "HEXAGON"];
        MinigameMaster.setUpPuzzle(PUZZLE_DIFFICULTIES[1], l[p.floor(p.random(0,3))] , p);
	};

	p.draw = () => {
        p.push();
		p.background(MAIN_THEME.DARK);

        
        // rendering minigame scene
        if (MinigameMaster.puzzleIsReady) MinigameMaster.render(p);
        else {
            console.log("generating...");
            MinigameMaster.generatePuzzle(p);
        }
        
		


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

