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
    ]}, 
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
    ]}, 
    HEXAGON: {yPos: 310,
    dirVectors: [
        [[1,0]],
        [[0,1]],
        [[-1,0]],
        [[0,-1]],
        [[-1,1]],
        [[1,-1]]
    ], data:[
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
const PUZZLE_DIFFICULTIES: number[] = [5, 7, 9];

interface DUMMY_BLOCKER { renderPos: Position2D, rotation: number }
interface BLOCKER {weight: 1|2|3, tile: Tile}
interface GenerationStep {tile: Tile, blocker: BLOCKER}
interface MM_TYPE {
    // main data
    tt: Tile_Type;
    blockersAmount: number;
    mapTiles: {[keys:string]: Tile}; 
    mapTileKeys: string[];
    generationSteps: GenerationStep[];
    blockersList: BLOCKER[];
    teleporters: [Tile, Tile];
    startingTile: Tile; // contains starting position for player

    puzzleIsReady: boolean, // false when still generating puzzle

    // animations
    dummyBlockersList: DUMMY_BLOCKER[],

    // methods
    setUpPuzzle: (blockersAmount: number, tt: Tile_Type, p: p5) => void;
    generatePuzzle: (p: p5) => void;
    render: (p: p5)=>void;
    getRandomTile: (p: p5)=>Tile;
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

    dummyBlockersList: [],
    puzzleIsReady: false,

    // setting up but not generating puzzle
    setUpPuzzle: function(blockersAmount: number, tt: Tile_Type, p: p5):void{
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

        // teleporters (if not first difficulty)
        if (MinigameMaster.blockersAmount === PUZZLE_DIFFICULTIES[0]){
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
                if (PUZZLE_MAPS[MinigameMaster.tt].dirVectors.some((vecs) => {
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
        MinigameMaster.generationSteps.push({tile: newRandomTile,blocker: null});
        
        // not enough blockers yet?
        while (MinigameMaster.blockersList.length < MinigameMaster.blockersAmount){
            const currentPosTile: Tile = MinigameMaster.generationSteps[MinigameMaster.generationSteps.length-1].tile;
            const dirVectors: Position2D[][] = PUZZLE_MAPS[MinigameMaster.tt].dirVectors.slice();
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
                const heavyBlocker: BLOCKER = getHeavyBlocker(currentPosTile, chosenVector);
                const mediumBlocker: BLOCKER = getMediumBlocker(currentPosTile);
                const lightBlocker: BLOCKER = getLightBlocker(slideInfo);

                const possibleMoves: GenerationStep[] = [];
                if (heavyBlocker){
                    // any pos ahead will do
                    slideInfo.tilesList.forEach((tile,index)=>{
                        const step:  GenerationStep = {tile: tile, blocker: heavyBlocker};
                        for (let i=0; i < index + 2; i++){ // +2 for a bit bias
                            possibleMoves.push(step);
                        }
                    });
                }
                if (mediumBlocker){
                    // any pos ahead will do, except the first 1
                    slideInfo.tilesList.slice(1).forEach((tile,index)=>{
                        const step:  GenerationStep = {tile: tile, blocker: mediumBlocker};
                        for (let i=0; i < index + 1; i++){
                            possibleMoves.push(step);
                        }
                    });
                }
                if (lightBlocker){ // preferred
                    // any pos ahead will do, except the first 2
                    slideInfo.tilesList.slice(2).forEach((tile,index)=>{
                        const step:  GenerationStep = {tile: tile, blocker: lightBlocker};
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
            }
            else break; // no more step available
        }

        // review generation
        if (MinigameMaster.blockersList.length < MinigameMaster.blockersAmount){
            MinigameMaster.puzzleIsReady = false;
        } else { // success
            MinigameMaster.startingTile = MinigameMaster.generationSteps[MinigameMaster.generationSteps.length-1].tile;
            MinigameMaster.puzzleIsReady = true;
            console.log("solution:");
            MinigameMaster.generationSteps.slice(1).forEach((s) => {
                console.log(`${s.tile.pos.toString()} -> ${s.blocker.weight}`);
            });
        }
    },

    render: function(p: p5):void{
        p.translate(300, PUZZLE_MAPS[MinigameMaster.tt].yPos); // moves the map
        // renders map
        p.stroke(MAIN_THEME.LIGHT);
        p.strokeWeight(1.5);
        p.noFill();
        p.textSize(20);
        MinigameMaster.mapTileKeys.forEach((tileKey: string) => {
            renderTile(p, MinigameMaster.mapTiles[tileKey]);
        });

        // renders starting pos
        p.fill(230);
        p.noStroke();
        renderTransitionalTile({
            p: p, tile: MinigameMaster.startingTile,
            renderPos: null, scaleValue: 0.8, rotateValue: 0,
            extraRender: null
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
        
        

        // renders blockers
        p.textSize(36);
        p.noStroke();
        MinigameMaster.blockersList.forEach((b:BLOCKER) => {
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

        


        ///////////// test
        /*
        this.mapTileKeys.forEach((tileKey: string) => {
            const tile: Tile = this.mapTiles[tileKey];
            if (p.mouseIsPressed && p.dist(
                p.mouseX,p.mouseY,tile.renderPos[0] + 300, tile.renderPos[1] + PUZZLE_MAPS[this.tt].yPos
            ) < 30){
                const vecs = PUZZLE_MAPS[this.tt].dirVectors[p.floor(p.frameCount % PUZZLE_MAPS[this.tt].dirVectors.length)]
                const slideInfo: SlideInfo = getSlideInfo(tile, vecs);
                // all pos ahead
                p.stroke(255,0,0);
                slideInfo.tilesList.forEach((yt:Tile) => renderTile(p, yt));
                // out of bound tile
                p.stroke(255,255,0);
                if (slideInfo.hitEdgeTile) renderTile(p, slideInfo.hitEdgeTile);
            }
        });*/
    },
    getRandomTile(p:p5):Tile{
        return MinigameMaster.mapTiles[MinigameMaster.mapTileKeys[
            p.floor(p.random(0, MinigameMaster.mapTileKeys.length))
        ]];
    }
};


function getHeavyBlocker(currentPosTile: Tile, chosenVector: Position2D[]): BLOCKER{
    // check the pos behind if empty and not near any light blocker
    const oppositeVector: Position2D[] = [];
    chosenVector.forEach(vec => {
        oppositeVector.push([vec[0] * -1, vec[1] * -1]);
    });

    const targetPosTile: Tile = getSlideInfo(
        currentPosTile, oppositeVector
    ).tilesList[0];
    if (!targetPosTile) return null; // tile not exist

    if (isAnythingAdjacent(targetPosTile)) return null;
    return {tile: targetPosTile, weight: 3};
}
function getMediumBlocker(targetPosTile: Tile): BLOCKER{
    if (isAnythingAdjacent(targetPosTile)) return null;
    return {tile: targetPosTile, weight: 2};
}
function getLightBlocker(slideInfo: SlideInfo): BLOCKER{
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
        const hasBlocker: boolean = MinigameMaster.blockersList.some((b:BLOCKER) => {
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
    tilesList: Tile[], hitBlocker: BLOCKER, hitEdgeTile: Tile
}
function getSlideInfo(
    currentTile: Tile, vecs: Position2D[], 
    ignoreTelerporter?: boolean, ignoreBlocker?: boolean
): SlideInfo {
    const [vec1,vec2] = vecs;
    const result: SlideInfo = {
        tilesList: [],
        hitBlocker: null,
        hitEdgeTile: null
    };
    let ccc: number = 0;
    while (true){
        if (ccc++ > 10000) {console.log(MinigameMaster); debugger;};
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
            const hasBlocker: boolean = MinigameMaster.blockersList.some((b: BLOCKER) => {
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
                currentTile = MinigameMaster.teleporters[1];
                continue;
            } else if (isSecondTeleporter){
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