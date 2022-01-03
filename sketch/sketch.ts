const sketch = (p: p5) => {
    let previousClickFrame: number = 0;
	

	

    p.setup = () => {
		p.createCanvas(600, 600);
        p.rectMode(p.CENTER);
        p.textAlign(p.CENTER, p.CENTER);
        //p.textFont("fantasy"); //////////// createFont();
        p.angleMode(p.DEGREES); ///////// angleMode = "degrees";


        //////
        const tts: Tile_Type[] = ["HEXAGON", "SQUARE", "TRIANGLE"];
        MenuScene.setUpGrid(tts[0]); //p.floor(p.random(0,3))
    };


	p.draw = () => {
        p.push();
		p.background(MAIN_THEME.DARK);

        p.textSize(12);
        MenuScene.render(p);
        
        p.pop();
	};

    p.mouseReleased = () =>{
        // prevents rapid release trigger
        if (p.frameCount - previousClickFrame < 6) return;
        else previousClickFrame = p.frameCount;

        // mouseReleased for each scene
        MenuScene.mouseReleased(p);
    }
};

window.onload = () => {
	const canvasDiv: HTMLElement = document.getElementById("canvas-program-container");
	canvasDiv.oncontextmenu = function (e) {
		e.preventDefault(); // disable right-click menu on canvas
	};

	new p5(sketch, canvasDiv);
};

