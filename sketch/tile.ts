const SCALINGS = {
	SQUARE: 80.0, TRIANGLE: 100.0, HEXAGON: 50.0
};
const CONSTANTS = {
    HEXAGON_HALF_SQRT_3: SCALINGS.HEXAGON * Math.sqrt(3)/2,
    HEXAGON_HALF_SCALING: SCALINGS.HEXAGON / 2,

    TRIANGLE_HEIGHT: SCALINGS.TRIANGLE * Math.sqrt(3)/2,
    TRIANGLE_CENTER_Y : SCALINGS.TRIANGLE / (Math.sqrt(3)*2),
};

type Tile_Type = "TRIANGLE" | "SQUARE" | "HEXAGON";
type Position2D = [number, number];

interface Tile {
	pos: Position2D;
	renderPos: Position2D;
	neighbors: {[keys: string]: Tile | null};
	verticesList: Position2D[];
    isUpward?: boolean;
}

// right, down, left, up
const FOUR_DIR_VECTORS_LIST : Position2D[] = [
	[1,0], [0,1], [-1,0], [0,-1]
];
// up left, up, up right, down right, down, down left
const SIX_DIR_VECTORS_LIST : Position2D[] = [
	[1,0], [0,1], [-1,0], [0,-1], [-1,1], [1,-1]
];



class Square_Tile implements Tile {
	pos: Position2D = [0,0];
	renderPos: Position2D = [0,0];
	neighbors: {[keys: string]: Tile | null} = {};
	verticesList: Position2D[] = [];

	constructor (pos: Position2D){
        const [x, y] = pos;
		this.pos = [x, y];
        FOUR_DIR_VECTORS_LIST.forEach(vec => {
			this.neighbors[posToKey([
				x + vec[0],
				y + vec[1]
			])] = null;
		});
		this.renderPos = [
			x * SCALINGS.SQUARE, 
			y * SCALINGS.SQUARE, 
		];

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

class Hexagon_Tile implements Tile {
	pos: Position2D = [0,0];
	renderPos: Position2D = [0,0];
	neighbors: {[keys: string]: Tile | null} = {};
	verticesList: Position2D[] = [];

	constructor (pos: Position2D){
        const [x, y] = pos;
		this.pos = [x, y];
        FOUR_DIR_VECTORS_LIST.forEach(vec => {
			this.neighbors[posToKey([
				x + vec[0],
				y + vec[1]
			])] = null;
		});
		this.renderPos = [
			x * SCALINGS.HEXAGON * 3/2,
			y * CONSTANTS.HEXAGON_HALF_SQRT_3 * 2 + 
            x * CONSTANTS.HEXAGON_HALF_SQRT_3
		];

		const [rx,ry] = this.renderPos;
		this.verticesList = [
			[rx + SCALINGS.HEXAGON, ry],
			[rx + CONSTANTS.HEXAGON_HALF_SCALING, ry + CONSTANTS.HEXAGON_HALF_SQRT_3],
			[rx - CONSTANTS.HEXAGON_HALF_SCALING, ry + CONSTANTS.HEXAGON_HALF_SQRT_3],
			[rx - SCALINGS.HEXAGON, ry],
			[rx - CONSTANTS.HEXAGON_HALF_SCALING, ry - CONSTANTS.HEXAGON_HALF_SQRT_3],
			[rx + CONSTANTS.HEXAGON_HALF_SCALING, ry - CONSTANTS.HEXAGON_HALF_SQRT_3]
		];
	}
}

class Triangle_Tile implements Tile {
	pos: Position2D = [0,0];
	renderPos: Position2D = [0,0];
	neighbors: {[keys: string]: Tile | null} = {};
	verticesList: Position2D[] = [];
    isUpward: boolean = false;

	constructor (pos: Position2D){
        const [x, y] = pos;
		this.pos = [x, y];
        this.isUpward = (x + y) % 2 === 0;
        FOUR_DIR_VECTORS_LIST.forEach(vec => {
			this.neighbors[posToKey([
				x + vec[0],
				y + vec[1]
			])] = null;
		});

		this.renderPos = [
			x * SCALINGS.TRIANGLE/2, 
			y * CONSTANTS.TRIANGLE_HEIGHT
		];
        if (this.isUpward) {
            this.renderPos[1] += CONSTANTS.TRIANGLE_HEIGHT - (2 * CONSTANTS.TRIANGLE_CENTER_Y)
        }

		const [rx,ry] = this.renderPos;
        if (this.isUpward){
            this.verticesList = [
                [rx, ry - (CONSTANTS.TRIANGLE_HEIGHT - CONSTANTS.TRIANGLE_CENTER_Y)],
				[rx - SCALINGS.TRIANGLE/2, ry + CONSTANTS.TRIANGLE_CENTER_Y],
				[rx + SCALINGS.TRIANGLE/2,  ry + CONSTANTS.TRIANGLE_CENTER_Y]
            ];
        } else {
            this.verticesList = [
                [rx, ry + (CONSTANTS.TRIANGLE_HEIGHT - CONSTANTS.TRIANGLE_CENTER_Y)],
				[rx - SCALINGS.TRIANGLE/2, ry - CONSTANTS.TRIANGLE_CENTER_Y],
				[rx + SCALINGS.TRIANGLE/2,  ry - CONSTANTS.TRIANGLE_CENTER_Y]
            ];
        }
	}
}




function renderTile(p: p5, tile: Tile): void {
	p.beginShape();
    tile.verticesList.forEach(vPos => p.vertex(vPos[0],vPos[1]));
	p.endShape(p.CLOSE);

    p.push();
    p.fill("white");
    p.text(tile.pos, tile.renderPos[0], tile.renderPos[1]);
    p.pop();
}



// HELPER FUNCTIONS

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