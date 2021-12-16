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
    HEXAGON: { yPos: 300,
        dirVectors: [
            [[1, 0]],
            [[0, 1]],
            [[-1, 0]],
            [[0, -1]],
            [[-1, 1]],
            [[1, -1]]
        ], data: [
            [0, 0], [0, 1], [0, 2], [0, 3], [0, -1], [0, -2], [1, 0], [2, 0], [3, 0],
            [-1, 0], [-2, 0], [-3, 0], [1, 1], [2, 1], [-1, 1], [-2, 1], [3, 1],
            [-3, 1], [1, -1], [2, -1], [3, -1], [-1, -1], [-2, -1], [-1, -2],
            [-1, 2], [-1, 3], [1, 2], [1, -2], [1, -3], [-3, 2], [-3, 3], [-3, 4],
            [3, -2], [3, -3], [-2, 2], [-2, 3], [2, -2], [2, -3], [-2, 4], [2, 2]
        ] }
};
const BLOCKER_COLORS = [
    [0, 130, 210],
    [180, 50, 230],
    [230, 0, 80]
];
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
        MinigameMaster.mapTiles = {};
        PUZZLE_MAPS[tt].data.forEach(pos => {
            if (!!MinigameMaster.mapTiles[posToKey(pos)])
                throw "repeated in map";
            MinigameMaster.mapTiles[posToKey(pos)] = getNewTile(pos, tt);
        });
        MinigameMaster.mapTileKeys = Object.keys(MinigameMaster.mapTiles);
        MinigameMaster.tt = tt;
        MinigameMaster.blockersAmount = blockersAmount;
        MinigameMaster.mapTileKeys.forEach((tileKey) => {
            const currentTile = MinigameMaster.mapTiles[tileKey];
            Object.keys(currentTile.neighbors).forEach((nKey) => {
                const nTile = MinigameMaster.mapTiles[nKey];
                if (nTile) {
                    currentTile.neighbors[nKey] = {
                        tile: MinigameMaster.mapTiles[nKey], isEdge: false, isWalled: false
                    };
                }
            });
        });
    },
    generatePuzzle: function (p) {
        MinigameMaster.generationSteps = [];
        MinigameMaster.blockersList = [];
        MinigameMaster.generationSteps.push({
            tile: MinigameMaster.mapTiles[MinigameMaster.mapTileKeys[p.floor(p.random(0, MinigameMaster.mapTileKeys.length))]],
            blocker: null
        });
        while (MinigameMaster.blockersList.length < MinigameMaster.blockersAmount) {
            const currentPosTile = MinigameMaster.generationSteps[MinigameMaster.generationSteps.length - 1].tile;
            const dirVectors = PUZZLE_MAPS[MinigameMaster.tt].dirVectors.slice();
            let pickedStep = null;
            while (dirVectors.length > 0) {
                const chosenVector = dirVectors.splice(p.floor(p.random(0, dirVectors.length)), 1)[0];
                const slideInfo = getSlideInfo(currentPosTile, chosenVector[0], chosenVector[1]);
                if (slideInfo.tilesList.length === 0)
                    continue;
                const heavyBlocker = getHeavyBlocker(currentPosTile, chosenVector);
                const mediumBlocker = getMediumBlocker(currentPosTile);
                const lightBlocker = getLightBlocker(slideInfo);
                const possibleMoves = [];
                if (heavyBlocker) {
                    slideInfo.tilesList.forEach(tile => {
                        possibleMoves.push({
                            tile: tile, blocker: heavyBlocker
                        });
                    });
                }
                if (mediumBlocker) {
                    slideInfo.tilesList.slice(1).forEach(tile => {
                        possibleMoves.push({
                            tile: tile, blocker: mediumBlocker
                        });
                    });
                }
                if (lightBlocker) {
                    slideInfo.tilesList.slice(2).forEach(tile => {
                        possibleMoves.push({
                            tile: tile, blocker: lightBlocker
                        });
                    });
                }
                if (possibleMoves.length === 0)
                    continue;
                while (true) {
                    pickedStep = possibleMoves[p.floor(p.random(0, possibleMoves.length))];
                    const isNotLightBlocker = pickedStep.blocker.weight !== 1;
                    if (isNotLightBlocker && p.random() < 0.5)
                        continue;
                    else
                        break;
                }
                break;
            }
            if (pickedStep) {
                MinigameMaster.generationSteps.push(pickedStep);
                MinigameMaster.blockersList.push(pickedStep.blocker);
            }
            else
                break;
        }
        if (MinigameMaster.blockersList.length < MinigameMaster.blockersAmount) {
            MinigameMaster.puzzleIsReady = false;
            console.log("failed");
        }
        else {
            MinigameMaster.startingTile = MinigameMaster.generationSteps[MinigameMaster.generationSteps.length - 1].tile;
            MinigameMaster.puzzleIsReady = true;
            console.log("solution:");
            MinigameMaster.generationSteps.forEach((s) => console.log(s.tile.pos));
        }
    },
    render: function (p) {
        p.translate(300, PUZZLE_MAPS[MinigameMaster.tt].yPos);
        p.stroke(MAIN_THEME.LIGHT);
        p.noFill();
        p.textSize(20);
        MinigameMaster.mapTileKeys.forEach((tileKey) => {
            renderTile(p, MinigameMaster.mapTiles[tileKey]);
        });
        p.fill(230);
        renderTransitionalTile({
            p: p, tile: MinigameMaster.startingTile,
            renderPos: null, scaleValue: 0.8, rotateValue: 0,
            extraRender: null
        });
        p.textSize(36);
        p.noStroke();
        MinigameMaster.blockersList.forEach((b) => {
            p.fill(BLOCKER_COLORS[b.weight - 1]);
            renderTransitionalTile({
                p: p, tile: b.tile,
                renderPos: null, scaleValue: 0.8, rotateValue: 0,
                extraRender: () => {
                    if (b.tile.tt === "TRIANGLE" && !b.tile.isUpward)
                        p.rotate(180);
                    p.fill(MAIN_THEME.LIGHT);
                    p.text(b.weight, 0, 0);
                }
            });
        });
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
    if (isAnythingAdjacent(targetPosTile))
        return null;
    return { tile: targetPosTile, weight: 3 };
}
function getMediumBlocker(targetPosTile) {
    if (isAnythingAdjacent(targetPosTile))
        return null;
    return { tile: targetPosTile, weight: 2 };
}
function getLightBlocker(slideInfo) {
    const targetPosTile = slideInfo.tilesList[0];
    if (isAnythingAdjacent(targetPosTile))
        return null;
    return { tile: targetPosTile, weight: 1 };
}
function isAnythingAdjacent(targetPosTile) {
    const dangerTiles = Object.keys(targetPosTile.neighbors)
        .map((nKey) => targetPosTile.neighbors[nKey].tile);
    dangerTiles.push(targetPosTile);
    return dangerTiles.some((dangerTile) => {
        const hasBlocker = MinigameMaster.blockersList.some((b) => {
            return dangerTile === b.tile;
        });
        const hasTeleporter = false;
        return hasBlocker || hasTeleporter;
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
        p.textFont("monospace");
        p.angleMode(p.DEGREES);
        const l = ["TRIANGLE", "SQUARE", "HEXAGON"];
        MinigameMaster.setUpPuzzle(7, l[p.floor(p.random(0, 3))], p);
    };
    p.draw = () => {
        p.push();
        p.background(MAIN_THEME.DARK);
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
const MAIN_THEME = {
    LIGHT: 240, DARK: 30
};
const SCALINGS = {
    SQUARE: 80.0, TRIANGLE: 110.0, HEXAGON: 45.0
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
const CENTER_TILES = {
    SQUARE: new Square_Tile([0, 0]),
    HEXAGON: new Hexagon_Tile([0, 0]),
    TRIANGLE: new Triangle_Tile([0, 0])
};
CENTER_TILES.TRIANGLE.renderPos = [0, 0];
CENTER_TILES.TRIANGLE.verticesList.forEach(vertex => {
    vertex[1] -= CONSTANTS.TRIANGLE_HEIGHT - (2 * CONSTANTS.TRIANGLE_CENTER_Y);
});
function renderTile(p, tile) {
    p.beginShape();
    tile.verticesList.forEach(vPos => p.vertex(vPos[0], vPos[1]));
    p.endShape(p.CLOSE);
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
    if (extraRender)
        extraRender();
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