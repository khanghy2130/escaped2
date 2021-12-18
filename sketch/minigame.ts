const PUZZLE_MAPS: {[keys: string]: {
    dirVectors: Position2D[][], degreesMap: number[], // matches dirVectors order
    yPos: number, rotateMax: number, data: Position2D[]
}} = {
    TRIANGLE: {yPos: 320, rotateMax: 60,
    dirVectors: [
        [[0,1],[1,0]],
        [[0,1],[-1,0]],
        [[0,-1],[1,0]],
        [[0,-1],[-1,0]],
        [[1,0]],
        [[-1,0]]
    ],
    degreesMap: [330, 210, 30, 150, 0, 180], 
    data:[
        [0,0], [0,1], [0,2], [0,-1], [0,-2],
        [1,0], [2,0], [3,0], [4,0], [-1,0], [-2,0], [-3,0], [-4,0],
        [1,1], [2,1], [3,1], [4,1], [-1,1], [-2,1], [-3,1], [-4,1],
        [1,2], [2,2], [3,2], [-1,2], [-2,2], [-3,2],
        [1,-1], [2,-1], [3,-1], [4,-1], [-1,-1], [-2,-1], [-3,-1], [-4,-1],
        [1,-2], [2,-2], [3,-2], [4,-2], [-1,-2], [-2,-2], [-3,-2], [-4,-2]
    ]}, 
    SQUARE: {yPos: 290,  rotateMax: 90,
    dirVectors: [
        [[0,1]],
        [[0,-1]],
        [[1,0]],
        [[-1,0]]
    ], 
    degreesMap: [270, 90, 0, 180], 
    data:[
        [0,0], [0,-1], [0,-2], [0,1], [0,2], [0,3],
        [1,0], [2,0], [3,0], [-1,0], [-2,0], [-3,0],
        [1,1], [2,1], [3,1], [-1,1], [-2,1], [-3,1],
        [1,2], [2,2], [3,2], [-1,2], [-2,2], [-3,2],
        [1,-1], [2,-1], [3,-1], [-1,-1], [-2,-1], [-3,-1],
        [1,-2], [2,-2], [3,-2], [-1,-2], [-2,-2], [-3,-2],
        [1,3], [2,3], [3,3], [-1,3], [-2,3], [-3,3]
    ]}, 
    HEXAGON: {yPos: 310,  rotateMax: 60,
    dirVectors: [
        [[1,0]],
        [[0,1]],
        [[-1,0]],
        [[0,-1]],
        [[-1,1]],
        [[1,-1]]
    ], 
    degreesMap: [330, 270, 150, 90, 210, 30], 
    data:[
        [0,0], [0,1], [0,2], [0,3], [0,-1], [0,-2], [1,0], [2,0], [3,0],
        [-1,0], [-2,0], [-3,0], [1,1], [2,1], [-1,1], [-2,1], [3,1],
        [-3,1], [1,-1], [2,-1], [3,-1], [-1,-1], [-2,-1], [-1,-2],
        [-1,2], [-1,3], [1,2], [1,-2], [1,-3], [-3,2], [-3,3], [-3,4],
        [3,-2], [3,-3], [-2, 2], [-2, 3], [2,-2], [2,-3], [-2,4], [2,2],
        [-3,-1], [3,-4]
    ]} 
};
const PUZZLE_BLOCKER_COLORS: ([number,number,number])[] = [
    [0, 130, 210],
    [180, 50, 230],
    [230, 0, 80]
];

const PUZZLE_CONSTANTS: {[keys:string]: number} = {
    DIFFICULTY_1: 5,
    DIFFICULTY_2: 7,
    DIFFICULTY_3: 9,
    REMINDER_SCALE_MAX: 50,
    REMINDER_TRIGGER_POINT: -300,
    MOVE_DURATION: 12
};

interface DUMMY_PUZZLE_BLOCKER {
    blocker: PUZZLE_BLOCKER, 
    posVector: p5.Vector, 
    velocityVector: p5.Vector, 
    rotation: number,
    rotationVel: number
}
interface PUZZLE_BLOCKER {weight: 1|2|3, tile: Tile, isDestroyed?: boolean}
interface GenerationStep {tile: Tile, blocker: PUZZLE_BLOCKER, vecs: Position2D[]}
type PUZZLE_MODAL_CONTENT = "HELP" | "SOLUTION" | "NEW PUZZLE"; 
interface MM_TYPE {
    // main data
    tt: Tile_Type;
    blockersAmount: number;
    mapTiles: {[keys:string]: Tile}; 
    mapTileKeys: string[];
    generationSteps: GenerationStep[];
    blockersList: PUZZLE_BLOCKER[];
    teleporters: [Tile, Tile];
    startingTile: Tile; // contains starting position for player
    solution: number[];
    hasWon: boolean;
    puzzleIsReady: boolean, // false when still generating puzzle

    movement: {
        currentPosTile: Tile,
        hoveredVecs: Position2D[],
        isMoving: boolean,
        forceStopCountdown: number, // when is 0, stop moving
        destinationTile: Tile,
        reminderScale: number
    },

    // animations
    dummyBlockersList: DUMMY_PUZZLE_BLOCKER[],
    teleportAnimationProgress: number,
    moveAnimation: {progress: number, ghostTrails: GhostTrail[]},

    // buttons
    modal: {isOpen: boolean, content: PUZZLE_MODAL_CONTENT, 
    contentIndex: number, btns: {[keys:string]:Button}},
    mainBtns: Button[],


    // methods
    setUpPuzzle: (blockersAmount: number, tt: Tile_Type, p: p5) => void;
    generatePuzzle: (p: p5) => void;
    render: (p: p5)=>void;
    renderEnlargingFrame: (p:p5, colorValue: number[], tile: Tile, scaleValue: number)=>void;
    renderInputInterface: (p: p5, m: MM_TYPE["movement"])=>void;
    renderModal: (p: p5)=>void;
    mouseReleased: (p: p5)=>void;
    getRandomTile: (p: p5)=>Tile;
    reset: ()=>void;
}
const MinigameMaster: MM_TYPE = {
    tt: "SQUARE",
    blockersAmount: 5,
    mapTiles: {},
    mapTileKeys: [],
    generationSteps: [],
    blockersList: [],
    teleporters: [null, null],
    startingTile: null,
    solution: [],
    hasWon: false,
    puzzleIsReady: false,

    movement: {
        currentPosTile: null,
        hoveredVecs: null,
        isMoving: false,
        forceStopCountdown: 100,
        destinationTile: null,
        reminderScale: 0
    },

    dummyBlockersList: [],
    teleportAnimationProgress: 0,
    moveAnimation: {progress: 0, ghostTrails: []},

    modal: {isOpen: false, content: null, contentIndex: 0, btns: {}},
    mainBtns: [],

    // setting up but not generating puzzle
    setUpPuzzle: function(blockersAmount: number, tt: Tile_Type, p: p5):void{
        MinigameMaster.puzzleIsReady = false;
        // set up mapTiles, mapTilesKeys, tt
        MinigameMaster.mapTiles = {};
        PUZZLE_MAPS[tt].data.forEach(pos => {
            if (!!MinigameMaster.mapTiles[posToKey(pos)]) throw "repeated in map"; ////
            MinigameMaster.mapTiles[posToKey(pos)] = getNewTile(pos, tt);
        });
        MinigameMaster.mapTileKeys = Object.keys(MinigameMaster.mapTiles);
        MinigameMaster.tt = tt;
        MinigameMaster.blockersAmount = blockersAmount;

        // connect neighbors
        MinigameMaster.mapTileKeys.forEach((tileKey: string) => {
            const currentTile = MinigameMaster.mapTiles[tileKey];
            Object.keys(currentTile.neighbors).forEach((nKey: string) => {
                const nTile: Tile = MinigameMaster.mapTiles[nKey];
                if (nTile){ // if exists, modify current neighbor object
                    currentTile.neighbors[nKey] = {
                        tile: MinigameMaster.mapTiles[nKey], isEdge: false, isWalled: false
                    };
                }
            });
        });
    },

    // if fail: puzzleIsReady = false; succeed => true
    generatePuzzle: function(p: p5):void{
        // reset previous puzzle data
        MinigameMaster.generationSteps = [];
        MinigameMaster.blockersList = [];
        MinigameMaster.solution = [];

        // teleporters (if not first difficulty)
        if (MinigameMaster.blockersAmount === PUZZLE_CONSTANTS.DIFFICULTY_1){
            MinigameMaster.teleporters = [null, null];
        } else {
            const firstTeleporter: Tile = MinigameMaster.getRandomTile(p);
            MinigameMaster.teleporters = [firstTeleporter, firstTeleporter]; // apply first teleporter for check
            let secondTeleporter: Tile;
            
            while (true){
                secondTeleporter = MinigameMaster.getRandomTile(p);
                // reroll if the same as the first or near it
                if (isAnythingAdjacent(secondTeleporter)) continue;
                // reroll if on the same path as the first (check each direction > each tile)
                if (getPM().dirVectors.some((vecs) => {
                    const slideInfo: SlideInfo = getSlideInfo(secondTeleporter, vecs, true);
                    return slideInfo.tilesList.some(t => t === firstTeleporter);
                })) {continue;}
                break;
            }
            MinigameMaster.teleporters[1] = secondTeleporter;
            // fail immediately if any teleporter on edge tile
            const teleporterOnEdge: boolean = MinigameMaster.teleporters
            .some(teleporterTile=>{
                return Object.keys(teleporterTile.neighbors).some(nKey => {
                    return teleporterTile.neighbors[nKey].isEdge;
                });
            });
            if (teleporterOnEdge){
                MinigameMaster.puzzleIsReady = false;
                return;
            }
        }

        // make first step for generationSteps
        let newRandomTile: Tile;
        while (true){ // break if tile has no teleporter on it
            newRandomTile = MinigameMaster.getRandomTile(p);
            if (newRandomTile !== MinigameMaster.teleporters[0] &&
            newRandomTile !== MinigameMaster.teleporters[1]) break;
        }
        MinigameMaster.generationSteps.push(
            {tile: newRandomTile, blocker: null, vecs:null}
        );
        
        // not enough blockers yet?
        while (MinigameMaster.blockersList.length < MinigameMaster.blockersAmount){
            const currentPosTile: Tile = MinigameMaster.generationSteps[MinigameMaster.generationSteps.length-1].tile;
            const dirVectors: Position2D[][] = getPM().dirVectors.slice();
            let pickedStep: GenerationStep = null;

            // while there are dirs left
            while (dirVectors.length > 0){
                const chosenVector: Position2D[] = dirVectors.splice(
                    p.floor(p.random(0, dirVectors.length)), 1
                )[0];

                const slideInfo: SlideInfo = getSlideInfo(
                    currentPosTile, chosenVector
                );
                // no tile available ahead? continue to next dir
                if (slideInfo.tilesList.length === 0) continue;

                // check validation for both blocker types
                const heavyBlocker: PUZZLE_BLOCKER = getHeavyBlocker(currentPosTile, chosenVector);
                const mediumBlocker: PUZZLE_BLOCKER = getMediumBlocker(currentPosTile);
                const lightBlocker: PUZZLE_BLOCKER = getLightBlocker(slideInfo);

                const possibleMoves: GenerationStep[] = [];
                if (heavyBlocker){
                    // any pos ahead will do
                    slideInfo.tilesList.forEach((tile,index)=>{
                        const step:  GenerationStep = {tile: tile, blocker: heavyBlocker, vecs: chosenVector};
                        for (let i=0; i < index + 2; i++){ // +2 for a bit bias
                            possibleMoves.push(step);
                        }
                    });
                }
                if (mediumBlocker){
                    // any pos ahead will do, except the first 1
                    slideInfo.tilesList.slice(1).forEach((tile,index)=>{
                        const step:  GenerationStep = {tile: tile, blocker: mediumBlocker, vecs: chosenVector};
                        for (let i=0; i < index + 1; i++){
                            possibleMoves.push(step);
                        }
                    });
                }
                if (lightBlocker){ // preferred
                    // any pos ahead will do, except the first 2
                    slideInfo.tilesList.slice(2).forEach((tile,index)=>{
                        const step:  GenerationStep = {tile: tile, blocker: lightBlocker, vecs: chosenVector };
                        for (let i=0; i < index + 1; i++){
                            possibleMoves.push(step);
                            // 50% chance to add more
                            if (p.random() < 0.5) possibleMoves.push(step);
                        }
                    });
                }

                // no possible move? continue to next dir
                if (possibleMoves.length === 0) continue;
                pickedStep = possibleMoves[
                    p.floor(p.random(0, possibleMoves.length))
                ];
                break;
            }

            // if a step picked then apply, else fail generation
            if (pickedStep){
                MinigameMaster.generationSteps.push(pickedStep);
                MinigameMaster.blockersList.push(pickedStep.blocker);

                // add to solution
                const actualVecs: Position2D[] = getOppositeVectors(pickedStep.vecs);
                getPM().dirVectors.some((vecs, vecsIndex) => {
                    // matching this vecs?
                    if (vecs.every((vec, index) => {
                        const targetVec: Position2D = actualVecs[index];
                        if (targetVec && vec){
                            return targetVec[0] === vec[0] && targetVec[1] === vec[1];
                        }
                        else return index === 1 && targetVec === vec;
                    })){
                        MinigameMaster.solution.unshift(
                            getPM().degreesMap[vecsIndex]
                        );
                        return true;
                    }
                    return false;
                });
            }
            else break; // no more step available
        }

        // review generation
        if (MinigameMaster.blockersList.length < MinigameMaster.blockersAmount){
            MinigameMaster.puzzleIsReady = false;
        } else { // success
            MinigameMaster.startingTile = MinigameMaster.generationSteps[MinigameMaster.generationSteps.length-1].tile;
            MinigameMaster.puzzleIsReady = true;
            MinigameMaster.reset();
        }
    },

    render: function(p: p5):void{
        const m: MM_TYPE["movement"] = MinigameMaster.movement;
        // reset
        if (!m.isMoving) m.hoveredVecs = null;
        Object.keys(MinigameMaster.modal.btns).forEach(function(btnKey){
            const btn: Button = MinigameMaster.modal.btns[btnKey];
            btn.isHovered = false; // reset
        });

        // renders main buttons
        p.strokeWeight(2);
        MinigameMaster.mainBtns.forEach(function(btn){
			btn.isHovered = false; // reset
			btn.draw(p);
		});

        p.translate(300, getPM().yPos); // moves the map
        // renders map
        p.stroke(MAIN_THEME.LIGHT);
        p.strokeWeight(1.5);
        p.noFill();
        p.textSize(20);
        MinigameMaster.mapTileKeys.forEach((tileKey: string) => {
            renderTile(p, MinigameMaster.mapTiles[tileKey]);
        });

        // renders teleporters
        if (MinigameMaster.teleporters[0]){
            p.stroke(230, 230, 0);
            p.strokeWeight(4);
            p.noFill();
            MinigameMaster.teleporters.forEach((teleporterTile: Tile)=>{
                renderTransitionalTile({
                    p: p, tile: teleporterTile,
                    renderPos: null, scaleValue: 0.7, rotateValue: 0,
                    extraRender: null
                });
                renderTransitionalTile({
                    p: p, tile: teleporterTile,
                    renderPos: null, scaleValue: 0.4, rotateValue: 0,
                    extraRender: null
                });
                renderTransitionalTile({
                    p: p, tile: teleporterTile,
                    renderPos: null, scaleValue: 0.2, rotateValue: 0,
                    extraRender: null
                });
            });
        }

        // renders win text
        if (MinigameMaster.hasWon) {
            p.textSize(80 + p.cos(p.frameCount*2.5)*5);
            p.fill(MAIN_THEME.LIGHT);
            p.noStroke();
            p.text("ALL\nBLOCKERS\nDEFEATED", 0, 0);
        }

        // renders blockers
        p.textSize(36);
        p.noStroke();
        MinigameMaster.blockersList.forEach((b:PUZZLE_BLOCKER) => {
            if (b.isDestroyed) return;
            const bColor: number[] = PUZZLE_BLOCKER_COLORS[b.weight-1];
            p.fill(bColor[0], bColor[1], bColor[2]);
            renderTransitionalTile({
                p: p, tile: b.tile,
                renderPos: null, scaleValue: 0.8, rotateValue: 0,
                extraRender: () => {
                    if (b.tile.tt === "TRIANGLE" && !b.tile.isUpward) p.rotate(180);
                    p.fill(MAIN_THEME.LIGHT);
                    p.text(b.weight,0,0);
                }
            });
        });

        // renders ghost trails
        MinigameMaster.moveAnimation.ghostTrails = MinigameMaster.moveAnimation.ghostTrails
        .filter(gt => {
            gt.opacityValue -= 8;
            p.fill(gt.fillColor[0], gt.fillColor[1], gt.fillColor[2], p.min(gt.opacityValue, 120));
            renderTransitionalTile({
                p: p, tile: gt.tilePos,
                renderPos: gt.renderPos, scaleValue: 0.8, rotateValue: gt.rotation,
                extraRender: null
            });
            return gt.opacityValue >= 0;
        });

        // renders player
        let playerRenderPos: Position2D, playerRotateValue: number = 0;
        if (m.isMoving && m.destinationTile && MinigameMaster.moveAnimation.progress >= 0){
            playerRenderPos = [
                p.map(MinigameMaster.moveAnimation.progress, 
                PUZZLE_CONSTANTS.MOVE_DURATION, 0, 
                m.currentPosTile.renderPos[0], m.destinationTile.renderPos[0]),
                p.map(MinigameMaster.moveAnimation.progress, 
                PUZZLE_CONSTANTS.MOVE_DURATION, 0, 
                m.currentPosTile.renderPos[1], m.destinationTile.renderPos[1])
            ];
            playerRotateValue = p.map(
                MinigameMaster.moveAnimation.progress,
                PUZZLE_CONSTANTS.MOVE_DURATION, 0,
                0, getPM().rotateMax
            );
            if (p.frameCount % 5 === 1){
                MinigameMaster.moveAnimation.ghostTrails.push({
                    fillColor: [230,230,230], opacityValue: 300, tilePos: m.currentPosTile,
                    renderPos: playerRenderPos, rotation: playerRotateValue
                });
            }
        }
        renderPlayer([230,230,230], [10,10,10], {
            p: p, tile: m.currentPosTile,
            renderPos: playerRenderPos, scaleValue: 0.8, rotateValue: playerRotateValue,
            extraRender: null
        });
        
        // update movement animation
        if (m.isMoving){
            const ma: MM_TYPE["moveAnimation"] = MinigameMaster.moveAnimation;
            if (ma.progress-- <= 1){ // done? finish moving
                m.currentPosTile = m.destinationTile;
                puzzleStartNextMove(p);
            }
        }
        else MinigameMaster.renderInputInterface(p, m); // input interface
        
        // renders input zone reminder
        if (m.reminderScale-- > 0) {
            MinigameMaster.renderEnlargingFrame(
                p,[230,230,230], m.currentPosTile, m.reminderScale
            );
        }
        // renders teleport effect
        if (MinigameMaster.teleportAnimationProgress-- > 0) {
            MinigameMaster.teleporters.forEach(t=> MinigameMaster.renderEnlargingFrame(
                p, [230,230,0],t,
                MinigameMaster.teleportAnimationProgress
            ));
        }

        // renders dummy blockers (copy of blocker render)
        p.noStroke();
        MinigameMaster.dummyBlockersList = MinigameMaster.dummyBlockersList.filter(db => {
            const bColor: number[] = PUZZLE_BLOCKER_COLORS[db.blocker.weight-1];
            p.fill(bColor[0], bColor[1], bColor[2]);
            renderTransitionalTile({
                p: p, tile: db.blocker.tile,
                renderPos: [db.posVector.x, db.posVector.y], scaleValue: 0.8, rotateValue: db.rotation,
                extraRender: () => {
                    if (db.blocker.tile.tt === "TRIANGLE" && !db.blocker.tile.isUpward) p.rotate(180);
                    p.fill(MAIN_THEME.LIGHT);
                    p.text(db.blocker.weight,0,0);
                }
            });
            // update
            const gravityVector: p5.Vector = p.createVector(0, 0.5);
            db.velocityVector.add(gravityVector);
            db.posVector.add(db.velocityVector);
            db.rotation += db.rotationVel;
            return db.posVector.y < 800;
        });

        // update reminder
        if (!m.hoveredVecs && !m.isMoving){
            if (m.reminderScale < PUZZLE_CONSTANTS.REMINDER_TRIGGER_POINT) {
                m.reminderScale = PUZZLE_CONSTANTS.REMINDER_SCALE_MAX;
            }
        }

        p.translate(-300, -getPM().yPos); // undo
        MinigameMaster.renderModal(p);
    },

    renderEnlargingFrame(p:p5, colorValue: number[], tile: Tile, scaleValue: number):void{
        p.noFill();
        p.stroke(colorValue[0],colorValue[1],colorValue[2], p.map(
            scaleValue, PUZZLE_CONSTANTS.REMINDER_SCALE_MAX, 0, 255, 0
        ));
        p.strokeWeight(2);
        renderTransitionalTile({
            p: p, tile: tile,
            renderPos: null, 
            scaleValue: p.map(
                scaleValue, PUZZLE_CONSTANTS.REMINDER_SCALE_MAX, 0, 0.8, 2.0
            ), 
            rotateValue: 0,
            extraRender: null
        });
    },

    renderInputInterface(p:p5, m: MM_TYPE["movement"]):void{
        if (MinigameMaster.modal.isOpen) return; // modal is open
        if (p.mouseY < 80 || MinigameMaster.hasWon) return; // out of board or won

        let currentRenderPos: Position2D = m.currentPosTile.renderPos;
        let mousePos: Position2D = [
            p.mouseX - 300,
            p.mouseY - getPM().yPos
        ];
        
        // close to player tile?
        const distFromPlayerTile: number = p.dist(mousePos[0], mousePos[1], currentRenderPos[0], currentRenderPos[1]);
        if (distFromPlayerTile < 180){
            const hoveredDeg: number = getDegree(
                p, currentRenderPos, mousePos, 
                getPM().degreesMap
            );
            m.hoveredVecs = getPM().dirVectors[getPM().degreesMap.indexOf(hoveredDeg)];
            const slideInfo: SlideInfo = getSlideInfo(m.currentPosTile, m.hoveredVecs, false, true);
            if (slideInfo.hitEdgeTile) slideInfo.tilesList.push(slideInfo.hitEdgeTile);

            // remove all pos back to the destination tile
            for (let i=0; i < slideInfo.tilesList.length; i++){
                const t: Tile = slideInfo.tilesList[i];
                let blocker: PUZZLE_BLOCKER = null;
                MinigameMaster.blockersList.some(b => {
                    if (b.tile === t){
                        blocker = b;
                        return true;
                    }
                    return false;
                });
                if (!blocker || blocker.isDestroyed) continue; // skip this pos if not blocker

                // if this blocker is right next to player then remove ALL pos
                if (i === 0) {
                    slideInfo.tilesList = [];
                    break;
                }

                let sliceIndex: number;
                if (blocker.weight === 1) sliceIndex = i + 2; 
                else if (blocker.weight === 2) sliceIndex = i + 1; 
                else if (blocker.weight === 3) sliceIndex = i;
                slideInfo.tilesList = slideInfo.tilesList.slice(0, sliceIndex);
                break;
            }
            // EXIT if no move available
            if (slideInfo.tilesList.length === 0) {
                m.hoveredVecs = null;
                return;
            }

            const redColor: p5.Color = p.color(230,0,0);
            const greenColor: p5.Color = p.color(0,230,0);
            const destinationTile: Tile = slideInfo.tilesList[slideInfo.tilesList.length-1];
            const isOutOfBound: boolean = slideInfo.hitEdgeTile === destinationTile;

            if (isOutOfBound) m.hoveredVecs = null; // invalid move

            // renders move line
            if (isOutOfBound) p.stroke(redColor);
            else p.stroke(greenColor);
            p.strokeWeight(6);
            let previousTile: Tile = m.currentPosTile;
            slideInfo.tilesList.forEach((pathTile:Tile) => {
                // draw line if both previous and current tiles are not teleporters
                if (!MinigameMaster.teleporters.includes(pathTile) ||
                !MinigameMaster.teleporters.includes(previousTile)){
                    p.line(
                        previousTile.renderPos[0],
                        previousTile.renderPos[1],
                        pathTile.renderPos[0],
                        pathTile.renderPos[1]
                    );
                }
                previousTile = pathTile;
            });

            // render destination tile
            if (isOutOfBound) p.fill(redColor);
            else p.fill(greenColor);
            p.noStroke();
            renderTile(p, destinationTile);
        }
    },

    renderModal(p:p5):void{
        const modal: MM_TYPE["modal"] = MinigameMaster.modal;
        if (!modal.isOpen) return;

        // dark overlay
        p.fill(0,0,0, 200);
        p.rect(300, 300, 700, 700);
        p.strokeWeight(2);

        // content
        if (modal.content === "HELP"){
            if (modal.contentIndex === 1){
                p.fill("red"); p.circle(300,300,100);
            } else if (modal.contentIndex === 2){
                p.fill("blue"); p.circle(300,300,100);
            } else if (modal.contentIndex === 3){
                p.fill("green"); p.circle(300,300,100);
            } else if (modal.contentIndex === 4){
                p.fill("yellow"); p.circle(300,300,100);
            }
        } else if (modal.content === "SOLUTION"){
            p.textSize(36);
            p.fill(MAIN_THEME.LIGHT);
            p.noStroke();
            if (modal.contentIndex === 0){ // sure1
                p.text(
                    "Are you sure that you have given up on the pride of solving the puzzle on your own?",
                    300, 150, 500
                );
                modal.btns["solution,1,yes"].draw(p);
                modal.btns["solution,1,no"].draw(p);
            } else if (modal.contentIndex === 1){ // sure2
                p.text("Are you absolutely sure?",
                300, 150);
                for (let noY=0; noY < 4; noY++){
                    for (let noX=0; noX < 4; noX++){
                        modal.btns["solution,2,btn,"+noX+noY].draw(p);
                    }
                }
            }  else if (modal.contentIndex === 2){ // solution
                p.textSize(24);
                MinigameMaster.solution.forEach((deg, i) =>{
                    const x: number = 150 + (i % 3) * 150;
                    const y: number = 150 + p.floor(i/3) * 150;
                    p.stroke(MAIN_THEME.LIGHT);
                    p.strokeWeight(10);
                    renderArrow(p, {r: deg, s: 1, x: x, y: y});

                    p.noStroke();
                    p.fill(MAIN_THEME.LIGHT);
                    p.ellipse(x, y, 40, 40);
                    p.fill(MAIN_THEME.DARK);
                    p.text(i+1, x,y);
                });
            }
        } else if (modal.content === "NEW PUZZLE"){
            for (let i=0; i < 3; i++){
                modal.btns["newpuzzle,"+i].draw(p);
            }
        }
    },

    mouseReleased(p:p5): void{
        // start moving if not moving and valid move
        const m: MM_TYPE["movement"] = MinigameMaster.movement;
        if (!m.isMoving && m.hoveredVecs) {
            puzzleStartNextMove(p);
            return;
        }

        // check button clicks
        MinigameMaster.mainBtns.some(function(btn){
			if (btn.isHovered) btn.action();
            return btn.isHovered;
		});

        // check modal clicks
        const modal: MM_TYPE["modal"] = MinigameMaster.modal;
        if (modal.isOpen){
            if (modal.content === "HELP"){
                modal.contentIndex++;
                if (modal.contentIndex > 4) modal.isOpen = false;
                return;
            } else if (modal.content === "SOLUTION"){
                // close modal on last content page
                if (modal.contentIndex === 2) modal.isOpen = false;
            } else if (modal.content === "NEW PUZZLE"){
                if (modal.contentIndex > 0) modal.isOpen = false;
                modal.contentIndex++;
            }

            // check modal buttons
            Object.keys(modal.btns).some(function(btnKey){
                const btn: Button = modal.btns[btnKey];
                if (btn.isHovered) btn.action();
                return btn.isHovered;
            });
        }
    },

    getRandomTile(p:p5):Tile{
        return MinigameMaster.mapTiles[MinigameMaster.mapTileKeys[
            p.floor(p.random(0, MinigameMaster.mapTileKeys.length))
        ]];
    },

    reset():void{
        const m: MM_TYPE["movement"] = MinigameMaster.movement;
        m.currentPosTile = MinigameMaster.startingTile;
        m.reminderScale = 0;
        m.isMoving = false;
        MinigameMaster.hasWon = false;
        MinigameMaster.dummyBlockersList = [];
        MinigameMaster.moveAnimation.progress = 0;
        MinigameMaster.moveAnimation.ghostTrails = [];
        MinigameMaster.blockersList.forEach(b=>b.isDestroyed = false);
        MinigameMaster.modal.isOpen = false;
    }
};

function renderArrow(p: p5, props: {r: number, s: number, x: number, y: number}): void{
    const {r,s,x,y} = props;
    p.push();
    p.translate(x, y);
    p.rotate(-r);
    p.scale(s);
    p.line(-50, 0, 50, 0);
    p.line(20, -30, 50, 0);
    p.line(20, 30, 50, 0);
    p.pop();
}

function puzzleStartNextMove(p:p5): void{
    const m: MM_TYPE["movement"] = MinigameMaster.movement;

    // if current pos is teleporter then teleport
    MinigameMaster.teleporters.some((t, index) => {
        if (t === m.currentPosTile){
            const otherTeleporter: Tile = MinigameMaster.teleporters[index === 0? 1 : 0];
            m.currentPosTile = otherTeleporter;
            MinigameMaster.teleportAnimationProgress = PUZZLE_CONSTANTS.REMINDER_SCALE_MAX;
            return true;
        }
        return false;
    });

    // go thru all vecs to check if that destination tile exists (triangle case)
    m.hoveredVecs.some(vec => {
        const newPos: Position2D = [
            vec[0] + m.currentPosTile.pos[0],
            vec[1] + m.currentPosTile.pos[1]
        ];
        const neighbor: NeighborObject = m.currentPosTile.neighbors[posToKey(newPos)];
        if (neighbor && neighbor.tile) {
            m.destinationTile = neighbor.tile;
            return true;
        }
        return false;
    });
    if (m.destinationTile === null) throw "destination tile is null when starting next move";

    // if hitting a blocker then set forcestop
    let blocker: PUZZLE_BLOCKER;
    MinigameMaster.blockersList.some((b:PUZZLE_BLOCKER) => {
        if (m.destinationTile === b.tile && !b.isDestroyed){
            blocker = b;
            return true;
        }
        return false
    });
    if (blocker && m.forceStopCountdown > 10){
        if (blocker.weight === 1) m.forceStopCountdown = 2;
        else if (blocker.weight === 2) m.forceStopCountdown = 1;
        else if (blocker.weight === 3) m.forceStopCountdown = 0;

        blocker.isDestroyed = true;
        // add to animation
        const velocityVector: p5.Vector = p.createVector(12 - p.sq(blocker.weight)*0.5, 0);
        const degIndex: number = getPM().dirVectors.indexOf(m.hoveredVecs);
        velocityVector.rotate(-getPM().degreesMap[degIndex]);
        MinigameMaster.dummyBlockersList.push({
            blocker: blocker, rotation: 0,
            rotationVel: (4 - blocker.weight) * 0.8 * (p.random()>0.5?1:-1),
            posVector: p.createVector(blocker.tile.renderPos[0],blocker.tile.renderPos[1]),
            velocityVector: velocityVector
        });

        // check win
        MinigameMaster.hasWon = MinigameMaster.blockersList.every(b => b.isDestroyed);
    }

    // check if time to stop
    if (m.forceStopCountdown <= 0){
        m.reminderScale = PUZZLE_CONSTANTS.REMINDER_SCALE_MAX;
        m.isMoving = false;
        m.hoveredVecs = null;
        m.forceStopCountdown = 100;
    } else {
        m.forceStopCountdown--;
        m.isMoving = true;
        MinigameMaster.moveAnimation.progress = PUZZLE_CONSTANTS.MOVE_DURATION;
    }
}



function getPM(): typeof PUZZLE_MAPS[MM_TYPE["tt"]] {
    return PUZZLE_MAPS[MinigameMaster.tt];
}

function getHeavyBlocker(currentPosTile: Tile, chosenVector: Position2D[]): PUZZLE_BLOCKER{
    // check the pos behind if empty and not near any light blocker
    const oppositeVector: Position2D[] = getOppositeVectors(chosenVector);

    const targetPosTile: Tile = getSlideInfo(
        currentPosTile, oppositeVector
    ).tilesList[0];
    if (!targetPosTile) return null; // tile not exist

    if (isAnythingAdjacent(targetPosTile)) return null;
    return {tile: targetPosTile, weight: 3};
}
function getMediumBlocker(targetPosTile: Tile): PUZZLE_BLOCKER{
    if (isAnythingAdjacent(targetPosTile)) return null;
    return {tile: targetPosTile, weight: 2};
}
function getLightBlocker(slideInfo: SlideInfo): PUZZLE_BLOCKER{
    const targetPosTile: Tile = slideInfo.tilesList[0];
    if (isAnythingAdjacent(targetPosTile)) return null;
    return {tile: targetPosTile, weight: 1};
}

// also checks if anything in target tile
function isAnythingAdjacent(targetPosTile: Tile): boolean {
    // make a list of neighbor and target tiles
    const dangerTiles: Tile[] = Object.keys(targetPosTile.neighbors)
    .map((nKey: string) => targetPosTile.neighbors[nKey].tile);
    dangerTiles.push(targetPosTile);

    // any blocker or teleporter on these tiles?
    return dangerTiles.some((dangerTile: Tile) => {
        const hasBlocker: boolean = MinigameMaster.blockersList.some((b:PUZZLE_BLOCKER) => {
            return dangerTile === b.tile;
        });
        const hasTeleporter: boolean = MinigameMaster.teleporters.some(
            (teleporterTile:Tile) => dangerTile === teleporterTile
        );

        return hasBlocker || hasTeleporter;
    });
}


// stops at edge or has blocker
// triangle if moving diagonally: vec1 is vertical, vec2 is horizontal
interface SlideInfo {
    tilesList: Tile[], hitBlocker: PUZZLE_BLOCKER, hitEdgeTile: Tile
}
function getSlideInfo(
    currentTile: Tile, vecs: Position2D[], 
    ignoreTelerporter?: boolean, // for spawning teleporters
    ignoreBlocker?: boolean // for input preview (add teleporter tiles too)
): SlideInfo {
    const [vec1,vec2] = vecs;
    const result: SlideInfo = {
        tilesList: [],
        hitBlocker: null,
        hitEdgeTile: null
    };
    
    while (true){
        // vec1
        const vec1Pos: Position2D = [
            currentTile.pos[0] + vec1[0],
            currentTile.pos[1] + vec1[1]
        ];
        let nextNeighbor: NeighborObject = currentTile.neighbors[posToKey(vec1Pos)];
        
        // if is edge then quit
        if (nextNeighbor && nextNeighbor.isEdge) {
            result.hitEdgeTile = createEdgeNeighborTile(vec1Pos); 
            break;
        }

        // if vec1 tile doesn't exist && vec2 is provided && vec2 is horizonal only
        const vec1TileNotExist: boolean = !nextNeighbor || !nextNeighbor.tile;
        const vec2IsProvided: boolean = vec2 && vec2[1] === 0;
        
        if (vec1TileNotExist && vec2IsProvided) {
            const vec2Pos: Position2D = [
                currentTile.pos[0] + vec2[0],
                currentTile.pos[1] + vec2[1]
            ];
            nextNeighbor = currentTile.neighbors[posToKey(vec2Pos)];
            
            // if is edge then quit
            if (nextNeighbor && nextNeighbor.isEdge) {
                result.hitEdgeTile = createEdgeNeighborTile(vec2Pos); 
                break;
            }
        }
        
        // if vec2 tile also doesn't exist then quit
        if (!nextNeighbor || !nextNeighbor.tile) break;

        // tile exists! check if has blocker (if not ignored)
        if (!ignoreBlocker){
            const hasBlocker: boolean = MinigameMaster.blockersList.some((b: PUZZLE_BLOCKER) => {
                if (b.tile === nextNeighbor.tile) {
                    result.hitBlocker = b;
                    return true;
                }
                return false;
            });
            if (hasBlocker) break;
        }

        if (!ignoreTelerporter){ // not ignore?
            // check if is teleporter
            const isFirstTeleporter: boolean = nextNeighbor.tile === MinigameMaster.teleporters[0];
            const isSecondTeleporter: boolean = nextNeighbor.tile === MinigameMaster.teleporters[1];
            if (isFirstTeleporter){
                if (ignoreBlocker){ // for input preview: add both teleporters
                    result.tilesList.push(nextNeighbor.tile);
                    result.tilesList.push(MinigameMaster.teleporters[1]);
                }
                currentTile = MinigameMaster.teleporters[1];
                continue;
            } else if (isSecondTeleporter){
                if (ignoreBlocker){ // for input preview: add both teleporters
                    result.tilesList.push(nextNeighbor.tile);
                    result.tilesList.push(MinigameMaster.teleporters[0]);
                }
                currentTile = MinigameMaster.teleporters[0];
                continue;
            }
        }

        result.tilesList.push(nextNeighbor.tile); // this tile is good to be added
        currentTile = nextNeighbor.tile; // goes on
    }
    return result;
}

function createEdgeNeighborTile(pos: Position2D): Tile {
    if (!MinigameMaster.puzzleIsReady) return null; // is generating, no need to create
    return getNewTile(pos, MinigameMaster.tt);
}