type Tile_Type = "TRIANGLE" | "SQUARE" | "HEXAGON";
type Position2D = [number, number];

// right, down, left, up
type SQUARE_VECTOR_KEY = "1,0" | "0,1" | "-1,0" | "0,-1";
const SQUARE_VECTOR_KEYS_LIST : SQUARE_VECTOR_KEY[] = ["1,0", "0,1", "-1,0", "0,-1"];

// triangle / hexagon ////

class Tile {
	pos: Position2D;
	neighbors: {[keys: string]: Tile | null}; // keys are vector keys type
	renderPos: Position2D;
	verticesList: Position2D[];

	// sets up all properties above
	constructor (x: number, y: number){
		this.pos = [x, y];
		////
	}


}

// returns 2 positions for the target wall
function getWallRenderPos(
	tile: Tile, vectorKey: string, tt: Tile_Type
): [Position2D, Position2D]{



	return [[0,0], [0,0]]; ///
}

// https://github.com/khanghy2130/Spread/blob/master/js/tile_types.js