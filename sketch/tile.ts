const MAIN_THEME: {LIGHT: number, DARK: number} = {
    LIGHT: 240, DARK: 30
};
const SCALINGS = {
	SQUARE: 80.0, TRIANGLE: 110.0, HEXAGON: 45.0
};
const CONSTANTS = {
    HEXAGON_HALF_SQRT_3: SCALINGS.HEXAGON * Math.sqrt(3)/2,
    HEXAGON_HALF_SCALING: SCALINGS.HEXAGON / 2,

    TRIANGLE_HEIGHT: SCALINGS.TRIANGLE * Math.sqrt(3)/2,
    TRIANGLE_CENTER_Y : SCALINGS.TRIANGLE / (Math.sqrt(3)*2),
};
////////type DIR_DEGREE = 0 | 30 | 90 | 150 | 180 | 210 | 270 | 330;
// const DIR_DEGREES: ({[keys: string]: DIR_DEGREE[]}) = {
//     TRIANGLE: [30, 90, 150, 210, 270, 330],
//     SQUARE: [0, 90, 180, 270],
//     HEXAGON: [30, 90, 150, 210, 270, 330]
// };

type Tile_Type = "TRIANGLE" | "SQUARE" | "HEXAGON";
type Position2D = [number, number];

interface NeighborObject {
    tile: Tile, isEdge: boolean, isWalled: boolean
}
interface Tile {
	pos: Position2D;
	renderPos: Position2D;
	neighbors: {[keys: string]: NeighborObject};
	verticesList: Position2D[];

    isUpward?: boolean; // triangle only
}


class Square_Tile implements Tile {
	pos: Position2D = [0,0];
	renderPos: Position2D = [0,0];
	neighbors: {[keys: string]: NeighborObject} = {};
	verticesList: Position2D[] = [];

	constructor (pos: Position2D){
        const [x, y] = pos;
		this.pos = [x, y];
        setUpNeighbors(this, [[1,0], [0,1], [-1,0], [0,-1]]);
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
	neighbors: {[keys: string]: NeighborObject} = {};
	verticesList: Position2D[] = [];

	constructor (pos: Position2D){
        const [x, y] = pos;
		this.pos = [x, y];
        setUpNeighbors(this, [[1,0], [0,1], [-1,0], [0,-1], [-1,1], [1,-1]]);
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
	neighbors: {[keys: string]: NeighborObject} = {};
	verticesList: Position2D[] = [];
    isUpward: boolean = false;

	constructor (pos: Position2D){
        const [x, y] = pos;
		this.pos = [x, y];
        this.isUpward = (x + y) % 2 === 0;

        let vecList: Position2D[];
        if (this.isUpward) vecList = [[1,0], [0,1], [-1,0]];
        else vecList = [[1,0], [-1,0], [0,-1]];
        setUpNeighbors(this, vecList);

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

    ////////////////
    p.push();
    p.fill(MAIN_THEME.LIGHT);
    p.text(tile.pos, tile.renderPos[0], tile.renderPos[1]);
    p.pop();
}



// HELPER FUNCTIONS
function setUpNeighbors(tile: Tile,vectorsList: Position2D[]):void{
    vectorsList.forEach(vec => {
        const nKey: string = posToKey([
            tile.pos[0] + vec[0],
            tile.pos[1] + vec[1]
        ]);
        tile.neighbors[nKey] = {
            tile: null, isEdge: true, isWalled: false
        };
    });
}
function getNewTile(pos: Position2D, tt: Tile_Type): Tile{
    if (tt === "HEXAGON") return new Hexagon_Tile(pos);
    if (tt === "SQUARE") return new Square_Tile(pos);
    return new Triangle_Tile(pos);
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