const sketch = (_p: p5) => {
    p = _p;
    let previousClickFrame: number = 0;

    p.setup = () => {
		p.createCanvas(600, 600);
        p.rectMode(p.CENTER);
        p.textAlign(p.CENTER, p.CENTER);
        p.frameRate(60);
        //p.textFont("fantasy"); //////////// createFont();
        p.angleMode(p.DEGREES); ///////// angleMode = "degrees";


        //////
        const tts: Tile_Type[] = ["HEXAGON", "SQUARE", "TRIANGLE"];
        MenuScene.setUpGrid(tts[0]); //p.floor(p.random(0,3))
    };


	p.draw = () => {
        p.push();
		p.background(MAIN_THEME.DARK);

        SCENES[currentScene].render(); // renders scene
        
        p.pop();
	};

    p.mouseReleased = () =>{
        // prevents rapid release trigger
        if (p.frameCount - previousClickFrame < 6) return;
        else previousClickFrame = p.frameCount;

        SCENES[currentScene].mouseReleased();
    }
};

window.onload = () => {
	const canvasDiv: HTMLElement = document.getElementById("canvas-program-container");
	canvasDiv.oncontextmenu = function (e) {
		e.preventDefault(); // disable right-click menu on canvas
	};

	new p5(sketch, canvasDiv);
};

