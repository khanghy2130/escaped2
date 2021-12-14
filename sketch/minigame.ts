const PUZZLE_MAPS: {
    [keys: string]: {yPos: number, data: Position2D[]}
} = {
    TRIANGLE: {yPos: 320, data:[
        [0,0], [0,1], [0,2], [0,-1], [0,-2],
        [1,0], [2,0], [3,0], [4,0], [-1,0], [-2,0], [-3,0], [-4,0],
        [1,1], [2,1], [3,1], [4,1], [-1,1], [-2,1], [-3,1], [-4,1],
        [1,2], [2,2], [3,2], [-1,2], [-2,2], [-3,2],
        [1,-1], [2,-1], [3,-1], [4,-1], [-1,-1], [-2,-1], [-3,-1], [-4,-1],
        [1,-2], [2,-2], [3,-2], [4,-2], [-1,-2], [-2,-2], [-3,-2], [-4,-2]
    ]}, // 43
    SQUARE: {yPos: 290, data:[
        [0,0], [0,-1], [0,-2], [0,1], [0,2], [0,3],
        [1,0], [2,0], [3,0], [-1,0], [-2,0], [-3,0],
        [1,1], [2,1], [3,1], [-1,1], [-2,1], [-3,1],
        [1,2], [2,2], [3,2], [-1,2], [-2,2], [-3,2],
        [1,-1], [2,-1], [3,-1], [-1,-1], [-2,-1], [-3,-1],
        [1,-2], [2,-2], [3,-2], [-1,-2], [-2,-2], [-3,-2],
        [1,3], [2,3], [3,3], [-1,3], [-2,3], [-3,3]
    ]}, // 42
    HEXAGON: {yPos: 320, data:[
        [0,0], [0,1], [0,2], [0,-1], [0,-2], [1,0], [2,0], [3,0],
        [-1,0], [-2,0], [-3,0], [1,1], [2,1], [-1,1], [-2,1],
        [-3,1], [1,-1], [2,-1], [3,-1], [-1,-1], [-2,-1], [-1,-2],
        [-1,2], [-1,3], [1,2], [1,-2], [1,-3], [-3,2], [-3,3],
        [3,-2], [3,-3], [-2, 2], [-2, 3], [2,-2], [2,-3]
    ]} // 35
};

interface DUMMY_BLOCKER { renderPos: Position2D, rotation: number }
interface BLOCKER {type: "LIGHT" | "HEAVY", pos: Position2D}
interface MM_TYPE {
    // main data
    // tile has "blocker" property which can be "lblocker/hblocker/null"
    tt: Tile_Type;
    blockersAmount: number;
    mapTiles: {[keys:string]: Tile}; 
    mapTileKeys: string[];
    generationSteps: ({pos: Position2D, dir: string | null})[];
    blockersList: BLOCKER[];
    startingPos: Position2D | null; // starting position for player

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
    startingPos: null,

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
            const neighborKeys = Object.keys(currentTile.neighbors);
            neighborKeys.forEach((nKey: string) => {
                const nTile: Tile = this.mapTiles[nKey];
                if (nTile){ // if exists
                    currentTile.neighbors[nKey] = this.mapTiles[nKey];
                    currentTile.edgeNeighbors[nKey] = false;
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
            pos: keyToPos(this.mapTileKeys[
                p.floor(p.random(0, this.mapTileKeys.length))
            ]), dir: null
        });
        
        //////////// place new generation step here
        

        // set starting Pos to last in generation steps

        this.puzzleIsReady = true; ////
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
        this.mapTileKeys.forEach((tileKey: string) => {
            renderTile(p, this.mapTiles[tileKey]);
        });

        ///////////// test
        p.stroke(255,0,0);
        this.mapTileKeys.forEach((tileKey: string) => {
        const tile: Tile = this.mapTiles[tileKey];
            if (p.mouseIsPressed && p.dist(
                p.mouseX,p.mouseY,tile.renderPos[0] + 300, tile.renderPos[1] + PUZZLE_MAPS[this.tt].yPos
            ) < 30){
                const yellowTiles: Tile[] = getAllTilesInDir(tile, [0,1], [1,0]);
                yellowTiles.forEach((yt:Tile) => renderTile(p, yt));
            }
        });
    }
};


// stops at edge or has blocker
// triangle if moving diagonally: vec1 is vertical, vec2 is horizontal
function getAllTilesInDir(currentTile: Tile, vec1: Position2D, vec2?: Position2D): Tile[]{
    const tilesList: Tile[] = [];
    while (true){
        // vecKey1
        const vecKey1 = posToKey([
            currentTile.pos[0] + vec1[0],
            currentTile.pos[1] + vec1[1]
        ]);
        let nextTile: Tile | null = currentTile.neighbors[vecKey1];
        // if is edge then quit
        if (currentTile.edgeNeighbors[vecKey1]) break;

        // if vec1 tile doesn't exist && vec2 is provided && vec2 is horizonal only
        if (!nextTile && vec2 && vec2[1] === 0) {
            const vecKey2 = posToKey([
                currentTile.pos[0] + vec2[0],
                currentTile.pos[1] + vec2[1]
            ]);
            nextTile = currentTile.neighbors[vecKey2];
        }
        // if vecKey2 tile also doesn't exist then quit
        if (!nextTile) break;

        // tile exists! check if has blocker
        const hasBlocker: boolean = MinigameMaster.blockersList.some((b: BLOCKER) => {
            return b.pos[0] === nextTile.pos[0] && b.pos[1] === nextTile.pos[1];
        });
        if (hasBlocker) break;

        tilesList.push(nextTile); // this tile is good to be added
        currentTile = nextTile; // goes on
    }
    return tilesList;
}