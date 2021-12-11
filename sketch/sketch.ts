const sketch = (p: p5) => {

	const CANVAS_SIZE: number = 600;

	p.setup = () => {
		p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);


	};

	var hex = new Hexagon_Tile(1, 1);
	var sq = new Square_Tile(2, 2);
	var tri = new Triangle_Tile(2, 2);

	var listSize = 10;
	var hexList: Hexagon_Tile[] = [];
	for (let y = 0; y < listSize; y++) {
		for (let x = 0; x < listSize; x++) {
			hexList.push(new Hexagon_Tile(x,y));
		}
	}
	var sqList: Square_Tile[] = [];
	for (let y = 0; y < listSize; y++) {
		for (let x = 0; x < listSize; x++) {
			sqList.push(new Square_Tile(x,y));
		}
	}
	var triList: Triangle_Tile[] = [];
	for (let y = 0; y < listSize; y++) {
		for (let x = 0; x < listSize; x++) {
			triList.push(new Triangle_Tile(x,y));
		}
	}

	p.draw = () => {
		p.background(100);
		
		p.stroke(0);
		p.noFill();
		// renderTile(p, hex);
		// renderTile(p, sq);
		// renderTile(p, tri);

		var sss = p.ceil((p.frameCount % 180)/60)
		switch(sss){
			case 1: hexList.forEach(t => renderTile(p,t)); break;
			case 2: sqList.forEach(t => renderTile(p,t)); break;
			case 3: triList.forEach(t => renderTile(p,t)); break;
		}
	};
};

window.onload = () => {
	const canvasDiv: HTMLElement = document.getElementById("canvas-program-container");
	canvasDiv.oncontextmenu = function (e) {
		e.preventDefault(); // disable right-click menu on canvas
	};

	new p5(sketch, canvasDiv);
};

