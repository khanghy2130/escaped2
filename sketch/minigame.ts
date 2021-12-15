const PUZZLE_MAPS: {
    [keys: string]: {yPos: number, dirVectors: Position2D[][], data: Position2D[]}
} = {
    TRIANGLE: {yPos: 320, dirVectors: [
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
    SQUARE: {yPos: 290, dirVectors: [
        
    ], data:[
        [0,0], [0,-1], [0,-2], [0,1], [0,2], [0,3],
        [1,0], [2,0], [3,0], [-1,0], [-2,0], [-3,0],
        [1,1], [2,1], [3,1], [-1,1], [-2,1], [-3,1],
        [1,2], [2,2], [3,2], [-1,2], [-2,2], [-3,2],
        [1,-1], [2,-1], [3,-1], [-1,-1], [-2,-1], [-3,-1],
        [1,-2], [2,-2], [3,-2], [-1,-2], [-2,-2], [-3,-2],
        [1,3], [2,3], [3,3], [-1,3], [-2,3], [-3,3]
    ]}, // 42
    HEXAGON: {yPos: 320, dirVectors: [
        
    ], data:[
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
        p.frameRate(2);
        ///////////// test
        
        this.mapTileKeys.forEach((tileKey: string) => {
            const tile: Tile = this.mapTiles[tileKey];
            if (p.mouseIsPressed && p.dist(
                p.mouseX,p.mouseY,tile.renderPos[0] + 300, tile.renderPos[1] + PUZZLE_MAPS[this.tt].yPos
            ) < 30){
                const [vec1, vec2] = PUZZLE_MAPS[this.tt].dirVectors[p.floor(p.frameCount % 6)]
                const slideInfo: SlideInfo = getSlideInfo(tile, vec1, vec2);
                // all pos ahead
                p.stroke(255,0,0);
                slideInfo.tilesList.forEach((yt:Tile) => renderTile(p, yt));
                // out of bound tile
                p.stroke(255,255,0);
                if (slideInfo.hitEdgeTile) renderTile(p, slideInfo.hitEdgeTile);
            }
        });
    }
};


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
        
        // if vecKey2 tile also doesn't exist then quit
        if (!nextNeighbor || !nextNeighbor.tile) break;

        // tile exists! check if has blocker
        const hasBlocker: boolean = MinigameMaster.blockersList.some((b: BLOCKER) => {
            const [x,y] = nextNeighbor.tile.pos;
            if (b.pos[0] === x && b.pos[1] === y) {
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