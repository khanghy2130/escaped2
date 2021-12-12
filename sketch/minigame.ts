const PUZZLE_MAP_HEXAGON: Position2D[] = [
    [0,0], [0,1], [0,2], [0,-1], [0,-2], [1,0], [2,0], [3,0],
    [-1,0], [-2,0], [-3,0], [1,1], [2,1], [-1,1], [-2,1],
    [-3,1], [1,-1], [2,-1], [3,-1], [-1,-1], [-2,-1], [-1,-2],
    [-1,2], [-1,3], [1,2], [1,-2], [1,-3], [-3,2], [-3,3],
    [3,-2], [3,-3], [-2, 2], [-2, 3], [2,-2], [2,-3]
]; // 35
const PUZZLE_MAP_SQUARE: Position2D[] = [
    [0,0], [0,-1], [0,-2], [0,1], [0,2],
    [1,0], [2,0], [3,0], [-1,0], [-2,0], [-3,0],
    [1,1], [2,1], [3,1], [-1,1], [-2,1], [-3,1],
    [1,2], [2,2], [3,2], [-1,2], [-2,2], [-3,2],
    [1,-1], [2,-1], [3,-1], [-1,-1], [-2,-1], [-3,-1],
    [1,-2], [2,-2], [3,-2], [-1,-2], [-2,-2], [-3,-2]
]; // 35
const PUZZLE_MAP_TRIANGLE: Position2D[] = [
    [0,0], [0,1], [0,2], [0,-1], [0,-2],
    [1,0], [2,0], [3,0], [4,0], [-1,0], [-2,0], [-3,0], [-4,0],
    [1,1], [2,1], [3,1], [4,1], [-1,1], [-2,1], [-3,1], [-4,1],
    [1,2], [2,2], [3,2], [-1,2], [-2,2], [-3,2],
    [1,-1], [2,-1], [3,-1], [4,-1], [-1,-1], [-2,-1], [-3,-1], [-4,-1],
    [1,-2], [2,-2], [3,-2], [4,-2], [-1,-2], [-2,-2], [-3,-2], [-4,-2]
]; // 43

interface DUMMY_BLOCKER { renderPos: Position2D, rotation: number }
interface MM_TYPE {
    // main data
    // tile has "item" property which can be "lblocker/hblocker"
    mapTiles: {[keys:string]: Tile}; 
    mapTileKeys: string[];
    puzzleIsReady: boolean, // false when still generating puzzle

    // animations
    dummyBlockersList: DUMMY_BLOCKER[],

    // methods
    createPuzzle: (blockersAmount: number, tt: Tile_Type, p: p5) => void;
    render: (p: p5)=>void;
}
const MinigameMaster: MM_TYPE = {
    mapTiles: {},
    mapTileKeys: [],
    dummyBlockersList: [],
    puzzleIsReady: false,

    createPuzzle: function(blockersAmount: number, tt: Tile_Type, p: p5):void{
        // set up mapTiles & mapTileKeys
        this.mapTiles = {};
        let MAP_TILES_POS: Position2D[];
        if (tt === "HEXAGON") MAP_TILES_POS = PUZZLE_MAP_HEXAGON;
        else if (tt === "SQUARE") MAP_TILES_POS = PUZZLE_MAP_SQUARE;
        else MAP_TILES_POS = PUZZLE_MAP_TRIANGLE;
        MAP_TILES_POS.forEach(pos => {
            if (!!this.mapTiles[posToKey(pos)]) throw "whattt"///////
            let newTile: Tile;
            if (tt === "HEXAGON") newTile = new Hexagon_Tile(pos);
            else if (tt === "SQUARE") newTile = new Square_Tile(pos);
            else newTile = new Triangle_Tile(pos);
            this.mapTiles[posToKey(pos)] = newTile;
        });
        this.mapTileKeys = Object.keys(this.mapTiles);

        this.puzzleIsReady = true; ////
    },

    render: function(p: p5):void{
        if (!this.puzzleIsReady) {
            p.textSize(30);
            p.fill(250);
            p.text("Loading", 300, 300);
            return;
        }

        p.translate(300,320); // moves the map
        p.stroke(255);
        p.noFill();
        this.mapTileKeys.forEach((tileKey: string) => {
            renderTile(p, this.mapTiles[tileKey]);
        });
    }
};

