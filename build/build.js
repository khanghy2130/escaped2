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
        ] } // 40
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
    teleporters: [null, null],
    startingTile: null,
    dummyBlockersList: [],
    puzzleIsReady: false,
    // setting up but not generating puzzle
    setUpPuzzle: function (blockersAmount, tt, p) {
        // set up mapTiles, mapTilesKeys, tt
        MinigameMaster.mapTiles = {};
        PUZZLE_MAPS[tt].data.forEach(pos => {
            if (!!MinigameMaster.mapTiles[posToKey(pos)])
                throw "repeated in map"; ////
            MinigameMaster.mapTiles[posToKey(pos)] = getNewTile(pos, tt);
        });
        MinigameMaster.mapTileKeys = Object.keys(MinigameMaster.mapTiles);
        MinigameMaster.tt = tt;
        MinigameMaster.blockersAmount = blockersAmount;
        // connect neighbors
        MinigameMaster.mapTileKeys.forEach((tileKey) => {
            const currentTile = MinigameMaster.mapTiles[tileKey];
            Object.keys(currentTile.neighbors).forEach((nKey) => {
                const nTile = MinigameMaster.mapTiles[nKey];
                if (nTile) { // if exists, modify current neighbor object
                    currentTile.neighbors[nKey] = {
                        tile: MinigameMaster.mapTiles[nKey], isEdge: false, isWalled: false
                    };
                }
            });
        });
        // teleporters
        const firstTeleporter = MinigameMaster.getRandomTile(p);
        MinigameMaster.teleporters = [firstTeleporter, firstTeleporter]; // apply first teleporter for check
        let secondTeleporter;
        while (true) {
            secondTeleporter = MinigameMaster.getRandomTile(p);
            // reroll if the same as the first or near it
            if (isAnythingAdjacent(secondTeleporter))
                continue;
            // reroll if on the same path as the first (check each direction > each tile)
            if (PUZZLE_MAPS[MinigameMaster.tt].dirVectors.some((vecs) => {
                const slideInfo = getSlideInfo(secondTeleporter, vecs, true);
                return slideInfo.tilesList.some(t => t === firstTeleporter);
            })) {
                continue;
            }
            break;
        }
        MinigameMaster.teleporters[1] = secondTeleporter;
    },
    // if fail: puzzleIsReady = false; succeed => true
    generatePuzzle: function (p) {
        // reset previous puzzle data
        MinigameMaster.generationSteps = [];
        MinigameMaster.blockersList = [];
        // make first step for generationSteps
        let newRandomTile;
        while (true) { // break if tile has no teleporter on it
            newRandomTile = MinigameMaster.getRandomTile(p);
            if (newRandomTile !== MinigameMaster.teleporters[0] &&
                newRandomTile !== MinigameMaster.teleporters[1])
                break;
        }
        MinigameMaster.generationSteps.push({ tile: newRandomTile, blocker: null });
        // not enough blockers yet?
        while (MinigameMaster.blockersList.length < MinigameMaster.blockersAmount) {
            const currentPosTile = MinigameMaster.generationSteps[MinigameMaster.generationSteps.length - 1].tile;
            const dirVectors = PUZZLE_MAPS[MinigameMaster.tt].dirVectors.slice();
            let pickedStep = null;
            // while there are dirs left
            while (dirVectors.length > 0) {
                const chosenVector = dirVectors.splice(p.floor(p.random(0, dirVectors.length)), 1)[0];
                const slideInfo = getSlideInfo(currentPosTile, chosenVector);
                // no tile available ahead? continue to next dir
                if (slideInfo.tilesList.length === 0)
                    continue;
                // check validation for both blocker types
                const heavyBlocker = getHeavyBlocker(currentPosTile, chosenVector);
                const mediumBlocker = getMediumBlocker(currentPosTile);
                const lightBlocker = getLightBlocker(slideInfo);
                const possibleMoves = [];
                if (heavyBlocker) {
                    // any pos ahead will do
                    slideInfo.tilesList.forEach(tile => {
                        possibleMoves.push({
                            tile: tile, blocker: heavyBlocker
                        });
                    });
                }
                if (mediumBlocker) {
                    // any pos ahead will do, except the first 1
                    slideInfo.tilesList.slice(1).forEach(tile => {
                        possibleMoves.push({
                            tile: tile, blocker: mediumBlocker
                        });
                    });
                }
                if (lightBlocker) {
                    // any pos ahead will do, except the first 2
                    slideInfo.tilesList.slice(2).forEach(tile => {
                        possibleMoves.push({
                            tile: tile, blocker: lightBlocker
                        });
                    });
                }
                // no possible move? continue to next dir
                if (possibleMoves.length === 0)
                    continue;
                // picking a move (prefer to pick light blocker)
                while (true) {
                    pickedStep = possibleMoves[p.floor(p.random(0, possibleMoves.length))];
                    const isNotLightBlocker = pickedStep.blocker.weight !== 1;
                    // 50% to reroll if not light blocker
                    if (isNotLightBlocker && p.random() < 0.5)
                        continue;
                    else
                        break;
                }
                break;
            }
            // if a step picked then apply, else fail generation
            if (pickedStep) {
                MinigameMaster.generationSteps.push(pickedStep);
                MinigameMaster.blockersList.push(pickedStep.blocker);
            }
            else
                break; // no more step available
        }
        // review generation
        if (MinigameMaster.blockersList.length < MinigameMaster.blockersAmount) {
            MinigameMaster.puzzleIsReady = false;
            console.log("failed");
        }
        else { // success
            MinigameMaster.startingTile = MinigameMaster.generationSteps[MinigameMaster.generationSteps.length - 1].tile;
            MinigameMaster.puzzleIsReady = true;
            console.log("solution:");
            MinigameMaster.generationSteps.slice(1).forEach((s) => {
                console.log(`${s.tile.pos.toString()} -> ${s.blocker.weight}`);
            });
        }
    },
    render: function (p) {
        p.translate(300, PUZZLE_MAPS[MinigameMaster.tt].yPos); // moves the map
        // renders map
        p.stroke(MAIN_THEME.LIGHT);
        p.strokeWeight(1.5);
        p.noFill();
        p.textSize(20);
        MinigameMaster.mapTileKeys.forEach((tileKey) => {
            renderTile(p, MinigameMaster.mapTiles[tileKey]);
        });
        // renders starting pos
        p.fill(230);
        p.noStroke();
        renderTransitionalTile({
            p: p, tile: MinigameMaster.startingTile,
            renderPos: null, scaleValue: 0.8, rotateValue: 0,
            extraRender: null
        });
        // renders teleporters
        p.stroke(230, 230, 0);
        p.strokeWeight(4);
        p.noFill();
        MinigameMaster.teleporters.forEach((teleporterTile) => {
            renderTransitionalTile({
                p: p, tile: teleporterTile,
                renderPos: null, scaleValue: 0.7, rotateValue: 0,
                extraRender: null
            });
            renderTransitionalTile({
                p: p, tile: teleporterTile,
                renderPos: null, scaleValue: 0.4, rotateValue: 0,
                extraRender: null
            });
            renderTransitionalTile({
                p: p, tile: teleporterTile,
                renderPos: null, scaleValue: 0.2, rotateValue: 0,
                extraRender: null
            });
        });
        // renders blockers
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
        ///////////// test
        /*
        this.mapTileKeys.forEach((tileKey: string) => {
            const tile: Tile = this.mapTiles[tileKey];
            if (p.mouseIsPressed && p.dist(
                p.mouseX,p.mouseY,tile.renderPos[0] + 300, tile.renderPos[1] + PUZZLE_MAPS[this.tt].yPos
            ) < 30){
                const vecs = PUZZLE_MAPS[this.tt].dirVectors[p.floor(p.frameCount % PUZZLE_MAPS[this.tt].dirVectors.length)]
                const slideInfo: SlideInfo = getSlideInfo(tile, vecs);
                // all pos ahead
                p.stroke(255,0,0);
                slideInfo.tilesList.forEach((yt:Tile) => renderTile(p, yt));
                // out of bound tile
                p.stroke(255,255,0);
                if (slideInfo.hitEdgeTile) renderTile(p, slideInfo.hitEdgeTile);
            }
        });*/
    },
    getRandomTile(p) {
        return MinigameMaster.mapTiles[MinigameMaster.mapTileKeys[p.floor(p.random(0, MinigameMaster.mapTileKeys.length))]];
    }
};
function getHeavyBlocker(currentPosTile, chosenVector) {
    // check the pos behind if empty and not near any light blocker
    const oppositeVector = [];
    chosenVector.forEach(vec => {
        oppositeVector.push([vec[0] * -1, vec[1] * -1]);
    });
    const targetPosTile = getSlideInfo(currentPosTile, oppositeVector).tilesList[0];
    if (!targetPosTile)
        return null; // tile not exist
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
// also checks if anything in target tile
function isAnythingAdjacent(targetPosTile) {
    // make a list of neighbor and target tiles
    const dangerTiles = Object.keys(targetPosTile.neighbors)
        .map((nKey) => targetPosTile.neighbors[nKey].tile);
    dangerTiles.push(targetPosTile);
    // any blocker or teleporter on these tiles?
    return dangerTiles.some((dangerTile) => {
        const hasBlocker = MinigameMaster.blockersList.some((b) => {
            return dangerTile === b.tile;
        });
        const hasTeleporter = MinigameMaster.teleporters.some((teleporterTile) => dangerTile === teleporterTile);
        return hasBlocker || hasTeleporter;
    });
}
function getSlideInfo(currentTile, vecs, countTeleporter) {
    const [vec1, vec2] = vecs;
    const result = {
        tilesList: [],
        hitBlocker: null,
        hitEdgeTile: null
    };
    let ccc = 0;
    while (true) {
        if (ccc++ > 10000) {
            console.log(MinigameMaster);
            debugger;
        }
        ;
        // vec1
        const vec1Pos = [
            currentTile.pos[0] + vec1[0],
            currentTile.pos[1] + vec1[1]
        ];
        let nextNeighbor = currentTile.neighbors[posToKey(vec1Pos)];
        // if is edge then quit
        if (nextNeighbor && nextNeighbor.isEdge) {
            result.hitEdgeTile = getEdgeNeighborTile(vec1Pos);
            break;
        }
        // if vec1 tile doesn't exist && vec2 is provided && vec2 is horizonal only
        const vec1TileNotExist = !nextNeighbor || !nextNeighbor.tile;
        const vec2IsProvided = vec2 && vec2[1] === 0;
        if (vec1TileNotExist && vec2IsProvided) {
            const vec2Pos = [
                currentTile.pos[0] + vec2[0],
                currentTile.pos[1] + vec2[1]
            ];
            nextNeighbor = currentTile.neighbors[posToKey(vec2Pos)];
            // if is edge then quit
            if (nextNeighbor && nextNeighbor.isEdge) {
                result.hitEdgeTile = getEdgeNeighborTile(vec2Pos);
                break;
            }
        }
        // if vec2 tile also doesn't exist then quit
        if (!nextNeighbor || !nextNeighbor.tile)
            break;
        // tile exists! check if has blocker
        const hasBlocker = MinigameMaster.blockersList.some((b) => {
            if (b.tile === nextNeighbor.tile) {
                result.hitBlocker = b;
                return true;
            }
            return false;
        });
        if (hasBlocker)
            break;
        if (!countTeleporter) { // apply teleporter rule?
            // check if is teleporter
            const isFirstTeleporter = nextNeighbor.tile === MinigameMaster.teleporters[0];
            const isSecondTeleporter = nextNeighbor.tile === MinigameMaster.teleporters[1];
            if (isFirstTeleporter) {
                currentTile = MinigameMaster.teleporters[1];
                continue;
            }
            else if (isSecondTeleporter) {
                currentTile = MinigameMaster.teleporters[0];
                continue;
            }
        }
        result.tilesList.push(nextNeighbor.tile); // this tile is good to be added
        currentTile = nextNeighbor.tile; // goes on
    }
    return result;
}
function getEdgeNeighborTile(pos) {
    return null; ////// 
    // if (!MinigameMaster.puzzleIsReady) return null; // is generating
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
        // rendering minigame scene
        if (MinigameMaster.puzzleIsReady)
            MinigameMaster.render(p);
        else
            MinigameMaster.generatePuzzle(p);
        // var hex = new Hexagon_Tile([0, 0]);
        // var sq = new Square_Tile([0, 0]);
        // var tri = new Triangle_Tile([0, -0.1]);
        // renderTile(p, hex);
        // renderTile(p, sq);
        // renderTile(p, tri);
        p.pop();
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
    SQUARE: 80.0, TRIANGLE: 110.0, HEXAGON: 47.0
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
    if (extraRender)
        extraRender();
    p.pop();
}
// HELPER FUNCTIONS
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
// https://github.com/khanghy2130/Spread/blob/master/js/tile_types.js
//# sourceMappingURL=build.js.map