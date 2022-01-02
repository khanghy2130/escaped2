const sketch = (p: p5) => {
    let previousClickFrame: number = 0;
	

	

    p.setup = () => {
		p.createCanvas(600, 600);
        p.rectMode(p.CENTER);
        p.textAlign(p.CENTER, p.CENTER);
        p.textFont("fantasy"); //////////// createFont();
        p.angleMode(p.DEGREES); ///////// angleMode = "degrees";

    };
    let vt: Button;
	p.draw = () => {
        p.push();
		p.background(MAIN_THEME.DARK);

        vt = new Button("Button",300, 300, 300, 100, 50, ()=>console.log("uh"));
        vt.draw(p);

        
        p.pop();
	};

    p.mouseReleased = () =>{
        // prevents rapid release trigger
        if (p.frameCount - previousClickFrame < 10) return;
        else previousClickFrame = p.frameCount;

        vt.checkClicked();
    }
};

window.onload = () => {
	const canvasDiv: HTMLElement = document.getElementById("canvas-program-container");
	canvasDiv.oncontextmenu = function (e) {
		e.preventDefault(); // disable right-click menu on canvas
	};

	new p5(sketch, canvasDiv);
};

