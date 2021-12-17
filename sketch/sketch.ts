const sketch = (p: p5) => {

	

	

    p.setup = () => {
		p.createCanvas(600, 600);
        p.rectMode(p.CENTER);
        p.textAlign(p.CENTER, p.CENTER);
        p.textFont("monospace");
        p.angleMode(p.DEGREES);

        // set up puzzle main buttons
        const mainBtnsDoCheckHover: ()=>boolean = ()=>!MinigameMaster.modal.isOpen;
        const modal: MM_TYPE["modal"] = MinigameMaster.modal;
        MinigameMaster.mainBtns = [
            new Button("Help", 80, 40, 130, 40, 22, ()=>{
                modal.isOpen = true;
                modal.content = "HELP";
                modal.contentIndex = 0;
            }, mainBtnsDoCheckHover),
            new Button("Reset", 220, 40, 130, 40, 22, ()=>{
                MinigameMaster.reset();
            }, mainBtnsDoCheckHover),
            new Button("Solution", 380, 40, 130, 40, 18, ()=>{
                modal.isOpen = true;
                modal.content = "SOLUTION";
                modal.contentIndex = 0;
            }, mainBtnsDoCheckHover),
            new Button("New Puzzle", 520, 40, 130, 40, 18, ()=>{
                modal.isOpen = true;
                modal.content = "NEW PUZZLE";
            }, mainBtnsDoCheckHover)
        ];

        // set up puzzle modal buttons
        const yesAction: ()=>void = () => modal.contentIndex++;
        const noAction: ()=>void = () => modal.isOpen = false;
        modal.btns["solution,1,yes"] = new Button("Yes", 200, 400, 100, 60, 30, yesAction);
        modal.btns["solution,1,no"] = new Button("No", 400, 400, 100, 60, 30, noAction);
        const yesX: number = p.floor(p.random(1,3)), yesY: number = p.floor(p.random(1,3));
        for (let noY=0; noY < 4; noY++){
            for (let noX=0; noX < 4; noX++){
                let action: ()=>void;
                let btnText: string;
                if (noX === yesX && noY === yesY){
                    action = yesAction; btnText = "Yes";
                } else {
                    action = noAction; btnText = "No";
                }
                modal.btns["solution,2,btn,"+noX+noY] = new Button(
                    btnText, 120 + noX*120, 270 + noY*80, 
                    100, 60, 30, action
                );
            }
        }

        // new puzzle buttons

        const l: Tile_Type[] = ["TRIANGLE" , "SQUARE" , "HEXAGON"];
        MinigameMaster.setUpPuzzle(PUZZLE_CONSTANTS.DIFFICULTY_1, l[p.floor(p.random(0,3))] , p);
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

    p.mouseReleased = () =>{
        // mini game scene
        if (MinigameMaster.puzzleIsReady) MinigameMaster.mouseReleased(p);
    }
};

window.onload = () => {
	const canvasDiv: HTMLElement = document.getElementById("canvas-program-container");
	canvasDiv.oncontextmenu = function (e) {
		e.preventDefault(); // disable right-click menu on canvas
	};

	new p5(sketch, canvasDiv);
};

