const PUZZLE_MAPS = {
    TRIANGLE: { yPos: 320,
        dirVectors: [
            [[0, 1], [1, 0]],
            [[0, 1], [-1, 0]],
            [[0, -1], [1, 0]],
            [[0, -1], [-1, 0]],
            [[1, 0]],
            [[-1, 0]]
        ], data: [
            [0, 0], [0, 1], [0, 2], [0, -1], [0, -2],
            [1, 0], [2, 0], [3, 0], [4, 0], [-1, 0], [-2, 0], [-3, 0], [-4, 0],
            [1, 1], [2, 1], [3, 1], [4, 1], [-1, 1], [-2, 1], [-3, 1], [-4, 1],
            [1, 2], [2, 2], [3, 2], [-1, 2], [-2, 2], [-3, 2],
            [1, -1], [2, -1], [3, -1], [4, -1], [-1, -1], [-2, -1], [-3, -1], [-4, -1],
            [1, -2], [2, -2], [3, -2], [4, -2], [-1, -2], [-2, -2], [-3, -2], [-4, -2]
        ] },
    SQUARE: { yPos: 290,
        dirVectors: [
            [[0, 1]],
            [[0, -1]],
            [[1, 0]],
            [[-1, 0]]
        ], data: [
            [0, 0], [0, -1], [0, -2], [0, 1], [0, 2], [0, 3],
            [1, 0], [2, 0], [3, 0], [-1, 0], [-2, 0], [-3, 0],
            [1, 1], [2, 1], [3, 1], [-1, 1], [-2, 1], [-3, 1],
            [1, 2], [2, 2], [3, 2], [-1, 2], [-2, 2], [-3, 2],
            [1, -1], [2, -1], [3, -1], [-1, -1], [-2, -1], [-3, -1],
            [1, -2], [2, -2], [3, -2], [-1, -2], [-2, -2], [-3, -2],
            [1, 3], [2, 3], [3, 3], [-1, 3], [-2, 3], [-3, 3]
        ] },
    HEXAGON: { yPos: 320,
        dirVectors: [
            [[1, 0]],
            [[0, 1]],
            [[-1, 0]],
            [[0, -1]],
            [[-1, 1]],
            [[1, -1]]
        ], data: [
            [0, 0], [0, 1], [0, 2], [0, -1], [0, -2], [1, 0], [2, 0], [3, 0],
            [-1, 0], [-2, 0], [-3, 0], [1, 1], [2, 1], [-1, 1], [-2, 1],
            [-3, 1], [1, -1], [2, -1], [3, -1], [-1, -1], [-2, -1], [-1, -2],
            [-1, 2], [-1, 3], [1, 2], [1, -2], [1, -3], [-3, 2], [-3, 3],
            [3, -2], [3, -3], [-2, 2], [-2, 3], [2, -2], [2, -3]
        ] }
};
const MinigameMaster = {
    tt: "SQUARE",
    blockersAmount: 5,
    mapTiles: {},
    mapTileKeys: [],
    generationSteps: [],
    blockersList: [],
    startingTile: null,
    dummyBlockersList: [],
    puzzleIsReady: false,
    setUpPuzzle: function (blockersAmount, tt, p) {
        this.mapTiles = {};
        PUZZLE_MAPS[tt].data.forEach(pos => {
            if (!!this.mapTiles[posToKey(pos)])
                throw "repeated in map";
            this.mapTiles[posToKey(pos)] = getNewTile(pos, tt);
        });
        this.mapTileKeys = Object.keys(this.mapTiles);
        this.tt = tt;
        this.blockersAmount = blockersAmount;
        this.mapTileKeys.forEach((tileKey) => {
            const currentTile = this.mapTiles[tileKey];
            Object.keys(currentTile.neighbors).forEach((nKey) => {
                const nTile = this.mapTiles[nKey];
                if (nTile) {
                    currentTile.neighbors[nKey] = {
                        tile: this.mapTiles[nKey], isEdge: false, isWalled: false
                    };
                }
            });
        });
    },
    generatePuzzle: function (p) {
        this.generationSteps = [];
        this.blockersList = [];
        this.generationSteps.push({
            tile: this.mapTiles[this.mapTileKeys[p.floor(p.random(0, this.mapTileKeys.length))]],
            vec: null,
            blocker: null
        });
        while (this.blockersList.length < this.blockersAmount) {
            const currentPosTile = this.generationSteps[this.generationSteps.length - 1].tile;
            const dirVectors = PUZZLE_MAPS[this.tt].dirVectors.slice();
            let pickedStep = null;
            while (dirVectors.length > 0) {
                const chosenVector = dirVectors.splice(p.floor(p.random(0, dirVectors.length)), 1)[0];
                const slideInfo = getSlideInfo(currentPosTile, chosenVector[0], chosenVector[1]);
                if (slideInfo.tilesList.length === 0)
                    continue;
                const heavyBlocker = getHeavyBlocker(currentPosTile, chosenVector);
                const lightBlocker = getLightBlocker(slideInfo);
                const possibleMoves = [];
                if (heavyBlocker) {
                    slideInfo.tilesList.forEach(tile => {
                        possibleMoves.push({
                            tile: tile, vec: chosenVector, blocker: heavyBlocker
                        });
                    });
                }
                if (lightBlocker) {
                    slideInfo.tilesList.slice(2).forEach(tile => {
                        possibleMoves.push({
                            tile: tile, vec: chosenVector, blocker: lightBlocker
                        });
                    });
                }
                if (possibleMoves.length === 0)
                    continue;
                pickedStep = possibleMoves[p.floor(p.random(0, possibleMoves.length))];
                break;
            }
            if (pickedStep) {
                this.generationSteps.push(pickedStep);
                this.blockersList.push(pickedStep.blocker);
            }
            else
                break;
        }
        if (this.blockersList.length < this.blockersAmount) {
            this.puzzleIsReady = false;
            console.log("failed");
        }
        else {
            this.startingTile = this.generationSteps[this.generationSteps.length - 1].tile;
            this.puzzleIsReady = true;
            console.log("solution:");
            this.generationSteps.forEach((s) => console.log(s.tile.pos));
        }
    },
    render: function (p) {
        if (!this.puzzleIsReady) {
            p.textSize(30);
            p.fill(250);
            p.text("Loading", 300, 300);
            return;
        }
        p.translate(300, PUZZLE_MAPS[this.tt].yPos);
        p.stroke(255);
        p.noFill();
        this.mapTileKeys.forEach((tileKey) => {
            renderTile(p, this.mapTiles[tileKey]);
        });
        this.blockersList.forEach((b) => {
            if (b.type === "HEAVY")
                p.fill(0, 230, 0);
            else
                p.fill(0, 0, 230);
            renderTile(p, b.tile);
        });
        p.fill(255, 0, 0);
        renderTile(p, MinigameMaster.startingTile);
    }
};
function getHeavyBlocker(currentPosTile, chosenVector) {
    const oppositeVector = [];
    chosenVector.forEach(vec => {
        oppositeVector.push([vec[0] * -1, vec[1] * -1]);
    });
    const targetPosTile = getSlideInfo(currentPosTile, oppositeVector[0], oppositeVector[1]).tilesList[0];
    if (!targetPosTile)
        return null;
    const notEmpty = MinigameMaster.blockersList.some(b => {
        return b.tile === targetPosTile;
    });
    if (notEmpty)
        return null;
    if (anyBlockerAdjacent(targetPosTile))
        return null;
    return { tile: targetPosTile, type: "HEAVY" };
}
function getLightBlocker(slideInfo) {
    const targetPosTile = slideInfo.tilesList[0];
    const notEmpty = MinigameMaster.blockersList.some(b => {
        return b.tile === targetPosTile;
    });
    if (notEmpty)
        return null;
    if (anyBlockerAdjacent(targetPosTile))
        return null;
    return { tile: targetPosTile, type: "LIGHT" };
}
function anyBlockerAdjacent(targetPosTile) {
    return Object.keys(targetPosTile.neighbors).some((nKey) => {
        const nTile = targetPosTile.neighbors[nKey].tile;
        return MinigameMaster.blockersList.some((b) => {
            return nTile === b.tile;
        });
    });
}
function getSlideInfo(currentTile, vec1, vec2) {
    const result = {
        tilesList: [],
        hitBlocker: null,
        hitEdgeTile: null
    };
    while (true) {
        const vec1Pos = [
            currentTile.pos[0] + vec1[0],
            currentTile.pos[1] + vec1[1]
        ];
        let nextNeighbor = currentTile.neighbors[posToKey(vec1Pos)];
        if (nextNeighbor && nextNeighbor.isEdge) {
            result.hitEdgeTile = getEdgeNeighborTile(vec1Pos);
            break;
        }
        const vec1TileNotExist = !nextNeighbor || !nextNeighbor.tile;
        const vec2IsProvided = vec2 && vec2[1] === 0;
        if (vec1TileNotExist && vec2IsProvided) {
            const vec2Pos = [
                currentTile.pos[0] + vec2[0],
                currentTile.pos[1] + vec2[1]
            ];
            nextNeighbor = currentTile.neighbors[posToKey(vec2Pos)];
            if (nextNeighbor && nextNeighbor.isEdge) {
                result.hitEdgeTile = getEdgeNeighborTile(vec2Pos);
                break;
            }
        }
        if (!nextNeighbor || !nextNeighbor.tile)
            break;
        const hasBlocker = MinigameMaster.blockersList.some((b) => {
            if (b.tile === nextNeighbor.tile) {
                result.hitBlocker = b;
                return true;
            }
            return false;
        });
        if (hasBlocker)
            break;
        result.tilesList.push(nextNeighbor.tile);
        currentTile = nextNeighbor.tile;
    }
    return result;
}
function getEdgeNeighborTile(pos) {
    return null;
    return getNewTile(pos, MinigameMaster.tt);
}
const sketch = (p) => {
    p.setup = () => {
        p.createCanvas(600, 600);
        p.rectMode(p.CENTER);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(20);
        const l = ["TRIANGLE", "SQUARE", "HEXAGON"];
        MinigameMaster.setUpPuzzle(7, l[p.floor(p.random(0, 3))], p);
    };
    p.draw = () => {
        p.push();
        p.background(20);
        p.stroke(0);
        p.noFill();
        if (MinigameMaster.puzzleIsReady)
            MinigameMaster.render(p);
        else
            MinigameMaster.generatePuzzle(p);
        p.pop();
    };
};
window.onload = () => {
    const canvasDiv = document.getElementById("canvas-program-container");
    canvasDiv.oncontextmenu = function (e) {
        e.preventDefault();
    };
    new p5(sketch, canvasDiv);
};
const SCALINGS = {
    SQUARE: 80.0, TRIANGLE: 110.0, HEXAGON: 50.0
};
const CONSTANTS = {
    HEXAGON_HALF_SQRT_3: SCALINGS.HEXAGON * Math.sqrt(3) / 2,
    HEXAGON_HALF_SCALING: SCALINGS.HEXAGON / 2,
    TRIANGLE_HEIGHT: SCALINGS.TRIANGLE * Math.sqrt(3) / 2,
    TRIANGLE_CENTER_Y: SCALINGS.TRIANGLE / (Math.sqrt(3) * 2),
};
class Square_Tile {
    constructor(pos) {
        this.pos = [0, 0];
        this.renderPos = [0, 0];
        this.neighbors = {};
        this.verticesList = [];
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
function renderTile(p, tile) {
    p.beginShape();
    tile.verticesList.forEach(vPos => p.vertex(vPos[0], vPos[1]));
    p.endShape(p.CLOSE);
    p.push();
    p.fill("white");
    p.text(tile.pos, tile.renderPos[0], tile.renderPos[1]);
    p.pop();
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
    if (tt === "HEXAGON")
        return new Hexagon_Tile(pos);
    if (tt === "SQUARE")
        return new Square_Tile(pos);
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
//# sourceMappingURL=build.js.map