const PUZZLE_MAPS: {[keys: string]: {
    dirVectors: Position2D[][], yPos: number, data: Position2D[]
}} = {
    TRIANGLE: {yPos: 320,
    dirVectors: [
        [[0,1],[1,0]],
        [[0,1],[-1,0]],
        [[0,-1],[1,0]],
        [[0,-1],[-1,0]],
        [[1,0]],
        [[-1,0]]
    ], data:[
        [0,0], [0,1], [0,2], [0,-1], [0,-2],
        [1,0], [2,0], [3,0], [4,0], [-1,0], [-2,0], [-3,0], [-4,0],
        [1,1], [2,1], [3,1], [4,1], [-1,1], [-2,1], [-3,1], [-4,1],
        [1,2], [2,2], [3,2], [-1,2], [-2,2], [-3,2],
        [1,-1], [2,-1], [3,-1], [4,-1], [-1,-1], [-2,-1], [-3,-1], [-4,-1],
        [1,-2], [2,-2], [3,-2], [4,-2], [-1,-2], [-2,-2], [-3,-2], [-4,-2]
    ]}, // 43
    SQUARE: {yPos: 290, 
    dirVectors: [
        [[0,1]],
        [[0,-1]],
        [[1,0]],
        [[-1,0]]
    ], data:[
        [0,0], [0,-1], [0,-2], [0,1], [0,2], [0,3],
        [1,0], [2,0], [3,0], [-1,0], [-2,0], [-3,0],
        [1,1], [2,1], [3,1], [-1,1], [-2,1], [-3,1],
        [1,2], [2,2], [3,2], [-1,2], [-2,2], [-3,2],
        [1,-1], [2,-1], [3,-1], [-1,-1], [-2,-1], [-3,-1],
        [1,-2], [2,-2], [3,-2], [-1,-2], [-2,-2], [-3,-2],
        [1,3], [2,3], [3,3], [-1,3], [-2,3], [-3,3]
    ]}, // 42
    HEXAGON: {yPos: 320,
    dirVectors: [
        [[1,0]],
        [[0,1]],
        [[-1,0]],
        [[0,-1]],
        [[-1,1]],
        [[1,-1]]
    ], data:[
        [0,0], [0,1], [0,2], [0,-1], [0,-2], [1,0], [2,0], [3,0],
        [-1,0], [-2,0], [-3,0], [1,1], [2,1], [-1,1], [-2,1],
        [-3,1], [1,-1], [2,-1], [3,-1], [-1,-1], [-2,-1], [-1,-2],
        [-1,2], [-1,3], [1,2], [1,-2], [1,-3], [-3,2], [-3,3],
        [3,-2], [3,-3], [-2, 2], [-2, 3], [2,-2], [2,-3]
    ]} // 35
};

interface DUMMY_BLOCKER { renderPos: Position2D, rotation: number }
interface BLOCKER {type: "LIGHT" | "HEAVY", tile: Tile}
interface GenerationStep {tile: Tile, vec: Position2D[], blocker: BLOCKER}
interface MM_TYPE {
    // main data
    // tile has "blocker" property which can be "lblocker/hblocker/null"
    tt: Tile_Type;
    blockersAmount: number;
    mapTiles: {[keys:string]: Tile}; 
    mapTileKeys: string[];
    generationSteps: GenerationStep[];
    blockersList: BLOCKER[];
    startingTile: Tile; // contains starting position for player

    puzzleIsReady: boolean, // false when still generating puzzle

    // animations
    dummyBlockersList: DUMMY_BLOCKER[],

    // methods
    setUpPuzzle: (blockersAmount: number, tt: Tile_Type, p: p5) => void;
    generatePuzzle: (p: p5) => void;
    render: (p: p5)=>void;
}
const MinigameMaster: MM_TYPE = {
    tt: "SQUARE",
    blockersAmount: 5,
    mapTiles: {},
    mapTileKeys: [],
    generationSteps: [],
    blockersList: [],
    startingTile: null,

    dummyBlockersList: [],
    puzzleIsReady: false,

    // setting up but not generating puzzle
    setUpPuzzle: function(blockersAmount: number, tt: Tile_Type, p: p5):void{
        // set up mapTiles, mapTilesKeys, tt
        this.mapTiles = {};
        PUZZLE_MAPS[tt].data.forEach(pos => {
            if (!!this.mapTiles[posToKey(pos)]) throw "repeated in map"; ////
            this.mapTiles[posToKey(pos)] = getNewTile(pos, tt);
        });
        this.mapTileKeys = Object.keys(this.mapTiles);
        this.tt = tt;
        this.blockersAmount = blockersAmount;

        // connect neighbors
        this.mapTileKeys.forEach((tileKey: string) => {
            const currentTile = this.mapTiles[tileKey];
            Object.keys(currentTile.neighbors).forEach((nKey: string) => {
                const nTile: Tile = this.mapTiles[nKey];
                if (nTile){ // if exists, modify current neighbor object
                    currentTile.neighbors[nKey] = {
                        tile: this.mapTiles[nKey], isEdge: false, isWalled: false
                    };
                }
            });
        });
    },

    // if fail: puzzleIsReady = false; succeed => true
    generatePuzzle: function(p: p5):void{
        // reset previous puzzle data
        this.generationSteps = [];
        this.blockersList = [];

        // make first step for generationSteps
        this.generationSteps.push({
            tile: this.mapTiles[this.mapTileKeys[
                p.floor(p.random(0, this.mapTileKeys.length))
            ]], 
            vec: null,
            blocker: null
        });
        
        // not enough blockers yet?
        while (this.blockersList.length < this.blockersAmount){
            const currentPosTile: Tile = this.generationSteps[this.generationSteps.length-1].tile;
            const dirVectors: Position2D[][] = PUZZLE_MAPS[this.tt].dirVectors.slice();
            let pickedStep: GenerationStep = null;

            // while there are dirs left
            while (dirVectors.length > 0){
                const chosenVector: Position2D[] = dirVectors.splice(
                    p.floor(p.random(0, dirVectors.length)), 1
                )[0];

                const slideInfo: SlideInfo = getSlideInfo(
                    currentPosTile, chosenVector[0], chosenVector[1]
                );
                // no tile available ahead? continue to next dir
                if (slideInfo.tilesList.length === 0) continue;

                // check validation for both blocker types
                const heavyBlocker: BLOCKER = getHeavyBlocker(currentPosTile, chosenVector);
                const lightBlocker: BLOCKER = getLightBlocker(slideInfo);

                const possibleMoves: GenerationStep[] = [];
                if (heavyBlocker){
                    // any pos ahead will do
                    slideInfo.tilesList.forEach(tile=>{
                        possibleMoves.push({
                            tile: tile, vec: chosenVector, blocker: heavyBlocker
                        });
                    });
                }
                if (lightBlocker){
                    // any pos ahead will do, except the first 2
                    slideInfo.tilesList.slice(2).forEach(tile=>{
                        possibleMoves.push({
                            tile: tile, vec: chosenVector, blocker: lightBlocker
                        });
                    });
                }

                // no possible move? continue to next dir
                if (possibleMoves.length === 0) continue;

                // picking a move
                pickedStep = possibleMoves[
                    p.floor(p.random(0, possibleMoves.length))
                ];
                break;
            }

            // if a step picked then apply, else fail generation
            if (pickedStep){
                this.generationSteps.push(pickedStep);
                this.blockersList.push(pickedStep.blocker);
            }
            else break; // no more step available
        }

        // review generation
        if (this.blockersList.length < this.blockersAmount){
            this.puzzleIsReady = false;
            console.log("failed");
        } else { // success
            this.startingTile = this.generationSteps[this.generationSteps.length-1].tile;
            this.puzzleIsReady = true;
            console.log("solution:");
            this.generationSteps.forEach((s:GenerationStep) => console.log(s.tile.pos));
        }
    },

    render: function(p: p5):void{
        if (!this.puzzleIsReady) {
            p.textSize(30);
            p.fill(250);
            p.text("Loading", 300, 300);
            return;
        }

        p.translate(300, PUZZLE_MAPS[this.tt].yPos); // moves the map
        p.stroke(255);
        p.noFill();
        // renders map
        this.mapTileKeys.forEach((tileKey: string) => {
            renderTile(p, this.mapTiles[tileKey]);
        });

        

        // renders blockers
        this.blockersList.forEach((b:BLOCKER) => {
            if (b.type === "HEAVY") p.fill(0,230,0); // green heavy
            else p.fill(0,0,230); // blue light
            renderTile(p, b.tile);
        });

        // renders starting pos
        p.fill(255,0,0);
        renderTile(p, MinigameMaster.startingTile);


        ///////////// test
        /*
        this.mapTileKeys.forEach((tileKey: string) => {
            const tile: Tile = this.mapTiles[tileKey];
            if (p.mouseIsPressed && p.dist(
                p.mouseX,p.mouseY,tile.renderPos[0] + 300, tile.renderPos[1] + PUZZLE_MAPS[this.tt].yPos
            ) < 30){
                const [vec1, vec2] = PUZZLE_MAPS[this.tt].dirVectors[p.floor(p.frameCount % PUZZLE_MAPS[this.tt].dirVectors.length)]
                const slideInfo: SlideInfo = getSlideInfo(tile, vec1, vec2);
                // all pos ahead
                p.stroke(255,0,0);
                slideInfo.tilesList.forEach((yt:Tile) => renderTile(p, yt));
                // out of bound tile
                p.stroke(255,255,0);
                if (slideInfo.hitEdgeTile) renderTile(p, slideInfo.hitEdgeTile);
            }
        });*/
    }
};

function getHeavyBlocker(currentPosTile: Tile, chosenVector: Position2D[]): BLOCKER{
    // check the pos behind if empty and not near any light blocker
    const oppositeVector: Position2D[] = [];
    chosenVector.forEach(vec => {
        oppositeVector.push([vec[0] * -1, vec[1] * -1]);
    });

    const targetPosTile: Tile = getSlideInfo(
        currentPosTile, oppositeVector[0], oppositeVector[1]
    ).tilesList[0];
    if (!targetPosTile) return null; // tile not exist

    // already a blocker here?
    const notEmpty: boolean = MinigameMaster.blockersList.some(b => {
        return b.tile === targetPosTile;
    });
    if (notEmpty) return null;

    // can't be next to any light blocker
    if (anyBlockerAdjacent(targetPosTile)) return null;

    return {tile: targetPosTile, type: "HEAVY"};
}
function getLightBlocker(slideInfo: SlideInfo): BLOCKER{
    const targetPosTile: Tile = slideInfo.tilesList[0];

    // already a blocker here?
    const notEmpty: boolean = MinigameMaster.blockersList.some(b => {
        return b.tile === targetPosTile;
    });
    if (notEmpty) return null;

    // can't be next to any light/heavy blocker
    if (anyBlockerAdjacent(targetPosTile)) return null;

    return {tile: targetPosTile, type: "LIGHT"};
}
function anyBlockerAdjacent(targetPosTile: Tile): boolean {
    return Object.keys(targetPosTile.neighbors).some((nKey: string) => {
        const nTile: Tile = targetPosTile.neighbors[nKey].tile;
        return MinigameMaster.blockersList.some((b:BLOCKER) => {
            return nTile === b.tile;
        });
    });
}


// stops at edge or has blocker
// triangle if moving diagonally: vec1 is vertical, vec2 is horizontal
interface SlideInfo {tilesList: Tile[], hitBlocker: BLOCKER, hitEdgeTile: Tile}
function getSlideInfo(
    currentTile: Tile, vec1: Position2D, vec2?: Position2D
): SlideInfo {
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
            result.hitEdgeTile = getEdgeNeighborTile(vec1Pos); 
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
                result.hitEdgeTile = getEdgeNeighborTile(vec2Pos); 
                break;
            }
        }
        
        // if vec2 tile also doesn't exist then quit
        if (!nextNeighbor || !nextNeighbor.tile) break;

        // tile exists! check if has blocker
        const hasBlocker: boolean = MinigameMaster.blockersList.some((b: BLOCKER) => {
            if (b.tile === nextNeighbor.tile) {
                result.hitBlocker = b;
                return true;
            }
            return false;
        });
        if (hasBlocker) break;

        result.tilesList.push(nextNeighbor.tile); // this tile is good to be added
        currentTile = nextNeighbor.tile; // goes on
    }
    return result;
}

function getEdgeNeighborTile(pos: Position2D): Tile {
    return null; ////// 
    // if (!MinigameMaster.puzzleIsReady) return null; // is generating
    return getNewTile(pos, MinigameMaster.tt);
}