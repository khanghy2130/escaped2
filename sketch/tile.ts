const MAIN_THEME: {LIGHT: number, DARK: number} = {
    LIGHT: 240, DARK: 30
};
const SCALINGS = {
	SQUARE: 80.0, TRIANGLE: 110.0, HEXAGON: 45.0
};
const RADIUS_SCALINGS = {
	SQUARE: SCALINGS.SQUARE * 0.5, 
    TRIANGLE: SCALINGS.TRIANGLE * 0.29, 
    HEXAGON: SCALINGS.HEXAGON * 0.85
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

    item: string;
    isUpward?: boolean; // triangle only
}


class Square_Tile implements Tile {
    tt: "SQUARE";
	pos: Position2D = [0,0];
	renderPos: Position2D = [0,0];
	neighbors: {[keys: string]: NeighborObject} = {};
	verticesList: Position2D[] = [];
    item: "";

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
    item: "";

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
    item: "";

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

function checkTileHovered(tile: Tile): boolean {
    return p.dist(
        tile.renderPos[0], tile.renderPos[1], p.mouseX, p.mouseY
    ) < RADIUS_SCALINGS[tile.tt];
}

function renderTile(tile: Tile): void {
	p.beginShape();
    tile.verticesList.forEach(vPos => p.vertex(vPos[0],vPos[1]));
	p.endShape(p.CLOSE);

    ////////////////
    // p.push();
    // p.fill(MAIN_THEME.LIGHT);
    // p.text(tile.pos, tile.renderPos[0], tile.renderPos[1]);
    // p.pop();
}

// for rendering out-of-grid tile shapes
interface RenderTransitionalTileProps {
    tile: Tile, renderPos: Position2D, 
    scaleValue: number, rotateValue: number,
    extraRender: ()=>void
}
function renderTransitionalTile(props: RenderTransitionalTileProps): void{
    let {tile, renderPos, scaleValue, rotateValue, extraRender} = props;
    renderPos = renderPos || tile.renderPos;

    p.push();
    p.translate(renderPos[0], renderPos[1]);
    p.scale(scaleValue);
    p.rotate(rotateValue);

    if (tile.tt === "TRIANGLE" && !tile.isUpward) p.rotate(180);
    renderTile(CENTER_TILES[tile.tt]);
    if (extraRender) {extraRender();}
    p.pop();
}


function renderPlayer(
    fillColor: number[], strokeColor: number[], 
    props: RenderTransitionalTileProps
): void{
    const tile: Tile = props.tile;

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
    if (tt === "HEXAGON") {return new Hexagon_Tile(pos);}
    if (tt === "SQUARE") {return new Square_Tile(pos);}
    return new Triangle_Tile(pos);
}
function posToKey(pos:Position2D):string {
	return `${pos[0]},${pos[1]}`;
}
function keyToPos(key:string): Position2D{
	const xy = key.split(",").map(n=>Number(n));
	if (xy.length !== 2) throw "Not a valid pos key";
	if (xy.some(n=>isNaN(n))) throw "NaN found in key";
	return [xy[0], xy[1]];
}


class Button {
    isHovered: boolean;
    action: Function;
    draw: () => void;
    checkClicked: () => boolean;

    constructor(t: string, x: number, y: number, 
    w: number, h: number, s: number, action: Function, doHoverCheck?: ()=>boolean){
        this.isHovered = false;
        this.action = action;
        
        this.draw = function(){
            if (!doHoverCheck || doHoverCheck()) {
                if (p.mouseX > x-w/2 && p.mouseX < x+w/2 && 
                p.mouseY > y-h/2 && p.mouseY < y+h/2 ){
                    this.isHovered = true;
                }
            }
            
            // render
            if (this.isHovered) p.fill(MAIN_THEME.LIGHT);
            else p.noFill();
            p.stroke(MAIN_THEME.LIGHT);
            p.rect(x, y, w, h);
            p.fill(this.isHovered ? MAIN_THEME.DARK : MAIN_THEME.LIGHT);
            p.noStroke();
            p.textSize(s);
            p.text(t, x, y);
        };

        this.checkClicked = function(): boolean{
            if (this.isHovered) {
                this.action();
                return true;
            }
            return false;
        };
    }
}
/*
vt = new Button("Button",300, 300, 300, 100, 50, ()=>console.log("uh"));
vt.draw(p);
vt.checkClicked(); // returns boolean, call this when trigger input
*/




















