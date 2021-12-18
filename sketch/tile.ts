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
    TRIANGLE_CENTER_Y : SCALINGS.TRIANGLE / (Math.sqrt(3)*2)
};

type Tile_Type = "TRIANGLE" | "SQUARE" | "HEXAGON";
type Position2D = [number, number];

interface NeighborObject {
    tile: Tile, isEdge: boolean, isWalled: boolean
}
interface Tile {
    tt: Tile_Type;
	pos: Position2D;
	renderPos: Position2D;
	neighbors: {[keys: string]: NeighborObject};
	verticesList: Position2D[];

    isUpward?: boolean; // triangle only
}


class Square_Tile implements Tile {
    tt: "SQUARE";
	pos: Position2D = [0,0];
	renderPos: Position2D = [0,0];
	neighbors: {[keys: string]: NeighborObject} = {};
	verticesList: Position2D[] = [];

	constructor (pos: Position2D){
        this.tt = "SQUARE";
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
    tt: "HEXAGON";
	pos: Position2D = [0,0];
	renderPos: Position2D = [0,0];
	neighbors: {[keys: string]: NeighborObject} = {};
	verticesList: Position2D[] = [];

	constructor (pos: Position2D){
        this.tt = "HEXAGON";
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
    tt: "TRIANGLE";
	pos: Position2D = [0,0];
	renderPos: Position2D = [0,0];
	neighbors: {[keys: string]: NeighborObject} = {};
	verticesList: Position2D[] = [];
    isUpward: boolean = false;

	constructor (pos: Position2D){
        this.tt = "TRIANGLE";
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

// set up for transitional rendering, also fix triangle
const CENTER_TILES: {[keys:string]: Tile} = {
    SQUARE: new Square_Tile([0,0]),
    HEXAGON: new Hexagon_Tile([0,0]),
    TRIANGLE: new Triangle_Tile([0,0])
};
CENTER_TILES.TRIANGLE.renderPos = [0,0];
CENTER_TILES.TRIANGLE.verticesList.forEach(vertex => {
    vertex[1] -= CONSTANTS.TRIANGLE_HEIGHT - (2 * CONSTANTS.TRIANGLE_CENTER_Y);
});

interface GhostTrail {fillColor: number[], opacityValue: number, tilePos:Tile, renderPos: Position2D, rotation: number}

function renderTile(p: p5, tile: Tile): void {
	p.beginShape();
    tile.verticesList.forEach(vPos => p.vertex(vPos[0],vPos[1]));
	p.endShape(p.CLOSE);

    ////////////////
    // p.push();
    // p.fill(MAIN_THEME.LIGHT);
    // p.text(tile.pos, tile.renderPos[0], tile.renderPos[1]);
    // p.pop();
}

interface RenderTransitionalTileProps {
    p: p5, tile: Tile, renderPos: Position2D, 
    scaleValue: number, rotateValue: number,
    extraRender: ()=>void
}
function renderTransitionalTile(props: RenderTransitionalTileProps): void{
    let {p, tile, renderPos, scaleValue, rotateValue, extraRender} = props;
    renderPos = renderPos || tile.renderPos;

    p.push();
    p.translate(renderPos[0], renderPos[1]);
    p.scale(scaleValue);
    p.rotate(rotateValue);

    if (tile.tt === "TRIANGLE" && !tile.isUpward) p.rotate(180);
    renderTile(p, CENTER_TILES[tile.tt]);
    if (extraRender) extraRender();
    p.pop();
}


function renderPlayer(fillColor: number[], strokeColor: number[], props: RenderTransitionalTileProps): void{
    const p: p5 = props.p, tile: Tile = props.tile;

    p.fill(fillColor[0],fillColor[1],fillColor[2]);
    p.noStroke();
    props.extraRender = function(): void{ // renders lines
        p.stroke(strokeColor[0],strokeColor[1],strokeColor[2]);
        p.strokeWeight(5);
        if (tile.tt === "HEXAGON"){
            for (let i=0; i < 6; i++){
                p.line(20,0,-20,0);
                p.rotate(60);
            }
        } else if (tile.tt === "SQUARE"){
            p.line(-15, -15, 15, 15);
            p.line(15, -15, -15, 15);
        } else {
            for (let i=0; i < 3; i++){
                p.line(0,0,0, -20);
                p.rotate(120);
            }
        }
    };
    renderTransitionalTile(props);
}


// HELPER FUNCTIONS
function getOppositeVectors(vecs: Position2D[]): Position2D[]{
    return vecs.map(vec => [vec[0] * -1, vec[1] * -1]);
}
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



// returns the degree in degreesMap that is closest to tracker direction
function getDegree(p:p5, centerPos: Position2D, trackerPos: Position2D, degreesMap: number[]): number{
    let a: number = p.atan2(
        trackerPos[1] - centerPos[1], 
        trackerPos[0] - centerPos[0]
    ) * -1;
    if (a < 0) a = 360 + a;

    // see which is the closest to input deg
    const proximities: [number, number][] = degreesMap
    .map(function(deg, index): [number,number] {
        const abs1: number = p.abs(a - deg);
        let abs2: number = 999;
        if (a > 270) {
            abs2 = p.abs(-(360 - a) - deg);
        }
        return [p.min(abs1, abs2), index]
    });
    proximities.sort((prox1, prox2) => prox1[0] - prox2[0]);
    return degreesMap[proximities[0][1]];
}



class Button {
    isHovered: boolean;
    action: Function;
    draw: (p: p5) => void;

    constructor(t: string, x: number, y: number, 
    w: number, h: number, s: number, action: Function, doHoverCheck?: ()=>boolean){
        this.isHovered = false;
        this.action = action;
        
        this.draw = function(p: p5){
            if (!doHoverCheck || doHoverCheck()) {
                if (p.mouseX > x-w/2 && p.mouseX < x+w/2 && 
                p.mouseY > y-h/2 && p.mouseY < y+h/2 ){
                    this.isHovered = true;
                }
            }
            
            // render
            p.fill(this.isHovered ? MAIN_THEME.LIGHT : MAIN_THEME.DARK);
            p.stroke(this.isHovered ? MAIN_THEME.DARK : MAIN_THEME.LIGHT);
            p.rect(x, y, w, h);
            p.fill(this.isHovered ? MAIN_THEME.DARK : MAIN_THEME.LIGHT);
            p.noStroke();
            p.textSize(s);
            p.text(t, x, y);
        };
    }
}

