const SCALINGS = {
	SQUARE: 100.0, TRIANGLE: 1.0, HEXAGON: 1.0
};

type Tile_Type = "TRIANGLE" | "SQUARE" | "HEXAGON";
type Position2D = [number, number];

interface Tile {
	pos: Position2D;
	renderPos: Position2D;
	neighbors: {[keys: string]: Tile | null};
	verticesList: Position2D[];
}

// right, down, left, up (square & triangle)
type FOUR_DIR_VECTOR = [1,0] | [0,1] | [-1,0] | [0,-1];
const FOUR_DIR_VECTORS_LIST : FOUR_DIR_VECTOR[] = [
	[1,0], [0,1], [-1,0], [0,-1]
];

// up left, up, up right, down right, down, down left (hexagon)
type SIX_DIR_VECTOR = [1,0] | [0,1] | [-1,0] | [0,-1] | [-1,1] | [1,-1];
const SIX_DIR_VECTORS_LIST : SIX_DIR_VECTOR[] = [
	[1,0], [0,1], [-1,0], [0,-1], [-1,1], [1,-1]
];



class Square_Tile implements Tile {
	pos: Position2D = [0,0];
	renderPos: Position2D = [0,0];
	neighbors: {[keys: string]: Tile | null} = {};
	verticesList: Position2D[] = [];

	constructor (x: number, y: number){
		this.pos = [x, y];
		this.renderPos = [
			this.pos[0] * SCALINGS.SQUARE, 
			this.pos[1] * SCALINGS.SQUARE, 
		];
		FOUR_DIR_VECTORS_LIST.forEach(vec => {
			this.neighbors[posToKey([
				this.pos[0] + vec[0],
				this.pos[1] + vec[1]
			])] = null; // not a real neighbor tile yet
		});

		const [rx,ry] = this.renderPos;
		const HS = SCALINGS.SQUARE / 2;
		this.verticesList = [
			[rx - HS, ry - HS],
			[rx + HS, ry - HS],
			[rx + HS, ry + HS],
			[rx - HS, ry + HS]
		];
	}
}


//// hex & triangle





function triangleIsUpward(pos:Position2D):boolean {
	return (pos[0] + pos[1]) % 2 === 0;
}
function posToKey(pos:Position2D):string {
	return `${pos[0]},${pos[1]}`
}
function keyToPos(key:string): Position2D{
	const xy = key.split(",").map(n=>Number(n));
	if (xy.length !== 2) throw "Not a valid pos key";
	if (xy.some(n=>isNaN(n))) throw "NaN found in key";
	return [xy[0], xy[1]];
}




// https://github.com/khanghy2130/Spread/blob/master/js/tile_types.js