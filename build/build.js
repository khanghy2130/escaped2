const MENU_LINE_LENGTH = 20; // shouldn't cover 3 whole walls
const MenuScene = {
    tt: "SQUARE",
    mapTiles: {},
    mapTileKeys: [],
    lines: [],
    letters: [],
    // set up tt, mapTiles, mapTileKeys
    setUpGrid: function (tt) {
        MenuScene.tt = tt;
        MenuScene.mapTiles = {};
        // 0 => 12, -4 => 12
        for (let y = -4; y < 13; y++) {
            for (let x = 0; x < 13; x++) {
                const pos = [x, y];
                MenuScene.mapTiles[posToKey(pos)] = getNewTile(pos, tt);
            }
        }
        MenuScene.mapTileKeys = Object.keys(MenuScene.mapTiles);
    },
    render: function (p) {
        if (MenuScene.mapTileKeys.length === 0) {
            return;
        } // not set up
        p.stroke(MAIN_THEME.LIGHT);
        p.strokeWeight(1);
        MenuScene.mapTileKeys.forEach((tileKey) => {
            const tile = MenuScene.mapTiles[tileKey];
            if (tile.item !== "YES")
                p.noFill();
            else
                p.fill(100, 100, 100);
            renderTile(p, tile);
        });
    },
    mouseReleased: function (p) {
        // toggleTileMap(p);
    }
};
const temList = [];
for (let y = -5; y <= 15; y++) {
    for (let x = 0; x <= 15; x++) {
        temList.push([x, y]);
    }
}
// set up with temList, render YES colored
function toggleTileMap(p) {
    MenuScene.mapTileKeys.some((tileKey) => {
        const tile = MenuScene.mapTiles[tileKey];
        if (checkTileHovered(p, tile)) {
            if (tile.item === "YES")
                tile.item = null;
            else
                tile.item = "YES";
            return true;
        }
        return false;
    });
    if (p.keyIsPressed)
        printMap(); // hold key then click
}
function printMap() {
    let result = "";
    MenuScene.mapTileKeys.forEach(tileKey => {
        const tile = MenuScene.mapTiles[tileKey];
        if (tile.item !== "YES")
            return;
        const pos = tile.pos;
        result += `[${pos[0]},${pos[1]}],`;
    });
    console.log(result);
}
const sketch = (p) => {
    let previousClickFrame = 0;
    p.setup = () => {
        p.createCanvas(600, 600);
        p.rectMode(p.CENTER);
        p.textAlign(p.CENTER, p.CENTER);
        //p.textFont("fantasy"); //////////// createFont();
        p.angleMode(p.DEGREES); ///////// angleMode = "degrees";
        //////
        const tts = ["HEXAGON", "SQUARE", "TRIANGLE"];
        MenuScene.setUpGrid(tts[0]); //p.floor(p.random(0,3))
    };
    p.draw = () => {
        p.push();
        p.background(MAIN_THEME.DARK);
        p.textSize(12);
        MenuScene.render(p);
        p.pop();
    };
    p.mouseReleased = () => {
        // prevents rapid release trigger
        if (p.frameCount - previousClickFrame < 6)
            return;
        else
            previousClickFrame = p.frameCount;
        // mouseReleased for each scene
        MenuScene.mouseReleased(p);
    };
};
window.onload = () => {
    const canvasDiv = document.getElementById("canvas-program-container");
    canvasDiv.oncontextmenu = function (e) {
        e.preventDefault(); // disable right-click menu on canvas
    };
    new p5(sketch, canvasDiv);
};
const MAIN_THEME = {
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
    HEXAGON_HALF_SQRT_3: SCALINGS.HEXAGON * Math.sqrt(3) / 2,
    HEXAGON_HALF_SCALING: SCALINGS.HEXAGON / 2,
    TRIANGLE_HEIGHT: SCALINGS.TRIANGLE * Math.sqrt(3) / 2,
    TRIANGLE_CENTER_Y: SCALINGS.TRIANGLE / (Math.sqrt(3) * 2)
};
class Square_Tile {
    constructor(pos) {
        this.pos = [0, 0];
        this.renderPos = [0, 0];
        this.neighbors = {};
        this.verticesList = [];
        this.tt = "SQUARE";
        const [x, y] = pos;
        this.pos = [x, y];
        setUpNeighbors(this, [[1, 0], [0, 1], [-1, 0], [0, -1]]);
        this.renderPos = [
            x * SCALINGS.SQUARE,
            y * SCALINGS.SQUARE,
        ];
        const [rx, ry] = this.renderPos;
        const HS = SCALINGS.SQUARE / 2;
        this.verticesList = [
            [rx - HS, ry - HS],
            [rx + HS, ry - HS],
            [rx + HS, ry + HS],
            [rx - HS, ry + HS]
        ];
    }
}
class Hexagon_Tile {
    constructor(pos) {
        this.pos = [0, 0];
        this.renderPos = [0, 0];
        this.neighbors = {};
        this.verticesList = [];
        this.tt = "HEXAGON";
        const [x, y] = pos;
        this.pos = [x, y];
        setUpNeighbors(this, [[1, 0], [0, 1], [-1, 0], [0, -1], [-1, 1], [1, -1]]);
        this.renderPos = [
            x * SCALINGS.HEXAGON * 3 / 2,
            y * CONSTANTS.HEXAGON_HALF_SQRT_3 * 2 +
                x * CONSTANTS.HEXAGON_HALF_SQRT_3
        ];
        const [rx, ry] = this.renderPos;
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
class Triangle_Tile {
    constructor(pos) {
        this.pos = [0, 0];
        this.renderPos = [0, 0];
        this.neighbors = {};
        this.verticesList = [];
        this.isUpward = false;
        this.tt = "TRIANGLE";
        const [x, y] = pos;
        this.pos = [x, y];
        this.isUpward = (x + y) % 2 === 0;
        let vecList;
        if (this.isUpward)
            vecList = [[1, 0], [0, 1], [-1, 0]];
        else
            vecList = [[1, 0], [-1, 0], [0, -1]];
        setUpNeighbors(this, vecList);
        this.renderPos = [
            x * SCALINGS.TRIANGLE / 2,
            y * CONSTANTS.TRIANGLE_HEIGHT
        ];
        if (this.isUpward) {
            this.renderPos[1] += CONSTANTS.TRIANGLE_HEIGHT - (2 * CONSTANTS.TRIANGLE_CENTER_Y);
        }
        const [rx, ry] = this.renderPos;
        if (this.isUpward) {
            this.verticesList = [
                [rx, ry - (CONSTANTS.TRIANGLE_HEIGHT - CONSTANTS.TRIANGLE_CENTER_Y)],
                [rx - SCALINGS.TRIANGLE / 2, ry + CONSTANTS.TRIANGLE_CENTER_Y],
                [rx + SCALINGS.TRIANGLE / 2, ry + CONSTANTS.TRIANGLE_CENTER_Y]
            ];
        }
        else {
            this.verticesList = [
                [rx, ry + (CONSTANTS.TRIANGLE_HEIGHT - CONSTANTS.TRIANGLE_CENTER_Y)],
                [rx - SCALINGS.TRIANGLE / 2, ry - CONSTANTS.TRIANGLE_CENTER_Y],
                [rx + SCALINGS.TRIANGLE / 2, ry - CONSTANTS.TRIANGLE_CENTER_Y]
            ];
        }
    }
}
// set up for transitional rendering, also fix triangle
const CENTER_TILES = {
    SQUARE: new Square_Tile([0, 0]),
    HEXAGON: new Hexagon_Tile([0, 0]),
    TRIANGLE: new Triangle_Tile([0, 0])
};
CENTER_TILES.TRIANGLE.renderPos = [0, 0];
CENTER_TILES.TRIANGLE.verticesList.forEach(vertex => {
    vertex[1] -= CONSTANTS.TRIANGLE_HEIGHT - (2 * CONSTANTS.TRIANGLE_CENTER_Y);
});
function checkTileHovered(p, tile) {
    return p.dist(tile.renderPos[0], tile.renderPos[1], p.mouseX, p.mouseY) < RADIUS_SCALINGS[tile.tt];
}
function renderTile(p, tile) {
    p.beginShape();
    tile.verticesList.forEach(vPos => p.vertex(vPos[0], vPos[1]));
    p.endShape(p.CLOSE);
    ////////////////
    // p.push();
    // p.fill(MAIN_THEME.LIGHT);
    // p.text(tile.pos, tile.renderPos[0], tile.renderPos[1]);
    // p.pop();
}
function renderTransitionalTile(props) {
    let { p, tile, renderPos, scaleValue, rotateValue, extraRender } = props;
    renderPos = renderPos || tile.renderPos;
    p.push();
    p.translate(renderPos[0], renderPos[1]);
    p.scale(scaleValue);
    p.rotate(rotateValue);
    if (tile.tt === "TRIANGLE" && !tile.isUpward)
        p.rotate(180);
    renderTile(p, CENTER_TILES[tile.tt]);
    if (extraRender) {
        extraRender();
    }
    p.pop();
}
function renderPlayer(fillColor, strokeColor, props) {
    const p = props.p, tile = props.tile;
    p.fill(fillColor[0], fillColor[1], fillColor[2]);
    p.noStroke();
    props.extraRender = function () {
        p.stroke(strokeColor[0], strokeColor[1], strokeColor[2]);
        p.strokeWeight(5);
        if (tile.tt === "HEXAGON") {
            for (let i = 0; i < 6; i++) {
                p.line(20, 0, -20, 0);
                p.rotate(60);
            }
        }
        else if (tile.tt === "SQUARE") {
            p.line(-15, -15, 15, 15);
            p.line(15, -15, -15, 15);
        }
        else {
            for (let i = 0; i < 3; i++) {
                p.line(0, 0, 0, -20);
                p.rotate(120);
            }
        }
    };
    renderTransitionalTile(props);
}
// HELPER FUNCTIONS
function getOppositeVectors(vecs) {
    return vecs.map(vec => [vec[0] * -1, vec[1] * -1]);
}
function setUpNeighbors(tile, vectorsList) {
    vectorsList.forEach(vec => {
        const nKey = posToKey([
            tile.pos[0] + vec[0],
            tile.pos[1] + vec[1]
        ]);
        tile.neighbors[nKey] = {
            tile: null, isEdge: true, isWalled: false
        };
    });
}
function getNewTile(pos, tt) {
    if (tt === "HEXAGON") {
        return new Hexagon_Tile(pos);
    }
    if (tt === "SQUARE") {
        return new Square_Tile(pos);
    }
    return new Triangle_Tile(pos);
}
function posToKey(pos) {
    return `${pos[0]},${pos[1]}`;
}
function keyToPos(key) {
    const xy = key.split(",").map(n => Number(n));
    if (xy.length !== 2)
        throw "Not a valid pos key";
    if (xy.some(n => isNaN(n)))
        throw "NaN found in key";
    return [xy[0], xy[1]];
}
class Button {
    constructor(t, x, y, w, h, s, action, doHoverCheck) {
        this.isHovered = false;
        this.action = action;
        this.draw = function (p) {
            if (!doHoverCheck || doHoverCheck()) {
                if (p.mouseX > x - w / 2 && p.mouseX < x + w / 2 &&
                    p.mouseY > y - h / 2 && p.mouseY < y + h / 2) {
                    this.isHovered = true;
                }
            }
            // render
            if (this.isHovered)
                p.fill(MAIN_THEME.LIGHT);
            else
                p.noFill();
            p.stroke(MAIN_THEME.LIGHT);
            p.rect(x, y, w, h);
            p.fill(this.isHovered ? MAIN_THEME.DARK : MAIN_THEME.LIGHT);
            p.noStroke();
            p.textSize(s);
            p.text(t, x, y);
        };
        this.checkClicked = function () {
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
let currentScene = "MENU";
function renderArrow(p, props) {
    const { r, s, x, y } = props;
    p.push();
    p.translate(x, y);
    p.rotate(-r);
    p.scale(s);
    p.line(-50, 0, 50, 0);
    p.line(20, -30, 50, 0);
    p.line(20, 30, 50, 0);
    p.pop();
}
//# sourceMappingURL=build.js.map