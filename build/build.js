const PLAYER_COLOR = [
    [230, 230, 230], [10, 10, 10]
];
const PUZZLE_MAPS = {
    TRIANGLE: { yPos: 320, rotateMax: 60,
        dirVectors: [
            [[0, 1], [1, 0]],
            [[0, 1], [-1, 0]],
            [[0, -1], [1, 0]],
            [[0, -1], [-1, 0]],
            [[1, 0]],
            [[-1, 0]]
        ],
        degreesMap: [330, 210, 30, 150, 0, 180],
        data: [
            [0, 0], [0, 1], [0, 2], [0, -1], [0, -2],
            [1, 0], [2, 0], [3, 0], [4, 0], [-1, 0], [-2, 0], [-3, 0], [-4, 0],
            [1, 1], [2, 1], [3, 1], [4, 1], [-1, 1], [-2, 1], [-3, 1], [-4, 1],
            [1, 2], [2, 2], [3, 2], [-1, 2], [-2, 2], [-3, 2],
            [1, -1], [2, -1], [3, -1], [4, -1], [-1, -1], [-2, -1], [-3, -1], [-4, -1],
            [1, -2], [2, -2], [3, -2], [4, -2], [-1, -2], [-2, -2], [-3, -2], [-4, -2]
        ] },
    SQUARE: { yPos: 290, rotateMax: 90,
        dirVectors: [
            [[0, 1]],
            [[0, -1]],
            [[1, 0]],
            [[-1, 0]]
        ],
        degreesMap: [270, 90, 0, 180],
        data: [
            [0, 0], [0, -1], [0, -2], [0, 1], [0, 2], [0, 3],
            [1, 0], [2, 0], [3, 0], [-1, 0], [-2, 0], [-3, 0],
            [1, 1], [2, 1], [3, 1], [-1, 1], [-2, 1], [-3, 1],
            [1, 2], [2, 2], [3, 2], [-1, 2], [-2, 2], [-3, 2],
            [1, -1], [2, -1], [3, -1], [-1, -1], [-2, -1], [-3, -1],
            [1, -2], [2, -2], [3, -2], [-1, -2], [-2, -2], [-3, -2],
            [1, 3], [2, 3], [3, 3], [-1, 3], [-2, 3], [-3, 3]
        ] },
    HEXAGON: { yPos: 310, rotateMax: 60,
        dirVectors: [
            [[1, 0]],
            [[0, 1]],
            [[-1, 0]],
            [[0, -1]],
            [[-1, 1]],
            [[1, -1]]
        ],
        degreesMap: [330, 270, 150, 90, 210, 30],
        data: [
            [0, 0], [0, 1], [0, 2], [0, 3], [0, -1], [0, -2], [1, 0], [2, 0], [3, 0],
            [-1, 0], [-2, 0], [-3, 0], [1, 1], [2, 1], [-1, 1], [-2, 1], [3, 1],
            [-3, 1], [1, -1], [2, -1], [3, -1], [-1, -1], [-2, -1], [-1, -2],
            [-1, 2], [-1, 3], [1, 2], [1, -2], [1, -3], [-3, 2], [-3, 3], [-3, 4],
            [3, -2], [3, -3], [-2, 2], [-2, 3], [2, -2], [2, -3], [-2, 4], [2, 2],
            [-3, -1], [3, -4]
        ] }
};
const PUZZLE_BLOCKER_COLORS = [
    [0, 130, 210],
    [180, 50, 230],
    [230, 0, 80]
];
const PUZZLE_CONSTANTS = {
    DIFFICULTY_1: 5,
    DIFFICULTY_2: 7,
    DIFFICULTY_3: 9,
    REMINDER_SCALE_MAX: 50,
    REMINDER_TRIGGER_POINT: -300,
    MOVE_DURATION: 12
};
const MinigameMaster = {
    tt: "SQUARE",
    blockersAmount: 5,
    mapTiles: {},
    mapTileKeys: [],
    generationSteps: [],
    blockersList: [],
    teleporters: [null, null],
    startingTile: null,
    solution: [],
    hasWon: false,
    puzzleIsReady: false,
    movement: {
        currentPosTile: null,
        hoveredVecs: null,
        isMoving: false,
        forceStopCountdown: 100,
        destinationTile: null,
        reminderScale: 0
    },
    dummyBlockersList: [],
    teleportAnimationProgress: 0,
    moveAnimation: { progress: 0, ghostTrails: [] },
    modal: { isOpen: false, content: null, contentIndex: 0, btns: {} },
    mainBtns: [],
    // setting up but not generating puzzle
    setUpPuzzle: function (blockersAmount, tt, p) {
        MinigameMaster.puzzleIsReady = false;
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
    },
    // if fail: puzzleIsReady = false; succeed => true
    generatePuzzle: function (p) {
        // reset previous puzzle data
        MinigameMaster.generationSteps = [];
        MinigameMaster.blockersList = [];
        MinigameMaster.solution = [];
        // teleporters (if not first difficulty)
        if (MinigameMaster.blockersAmount === PUZZLE_CONSTANTS.DIFFICULTY_1) {
            MinigameMaster.teleporters = [null, null];
        }
        else {
            const firstTeleporter = MinigameMaster.getRandomTile(p);
            MinigameMaster.teleporters = [firstTeleporter, firstTeleporter]; // apply first teleporter for check
            let secondTeleporter;
            while (true) {
                secondTeleporter = MinigameMaster.getRandomTile(p);
                // reroll if the same as the first or near it
                if (isAnythingAdjacent(secondTeleporter))
                    continue;
                // reroll if on the same path as the first (check each direction > each tile)
                if (getPM().dirVectors.some((vecs) => {
                    const slideInfo = getSlideInfo(secondTeleporter, vecs, true);
                    return slideInfo.tilesList.some(t => t === firstTeleporter);
                })) {
                    continue;
                }
                break;
            }
            MinigameMaster.teleporters[1] = secondTeleporter;
            // fail immediately if any teleporter on edge tile
            const teleporterOnEdge = MinigameMaster.teleporters
                .some(teleporterTile => {
                return Object.keys(teleporterTile.neighbors).some(nKey => {
                    return teleporterTile.neighbors[nKey].isEdge;
                });
            });
            if (teleporterOnEdge) {
                MinigameMaster.puzzleIsReady = false;
                return;
            }
        }
        // make first step for generationSteps
        let newRandomTile;
        while (true) { // break if tile has no teleporter on it
            newRandomTile = MinigameMaster.getRandomTile(p);
            if (newRandomTile !== MinigameMaster.teleporters[0] &&
                newRandomTile !== MinigameMaster.teleporters[1])
                break;
        }
        MinigameMaster.generationSteps.push({ tile: newRandomTile, blocker: null, vecs: null });
        // not enough blockers yet?
        while (MinigameMaster.blockersList.length < MinigameMaster.blockersAmount) {
            const currentPosTile = MinigameMaster.generationSteps[MinigameMaster.generationSteps.length - 1].tile;
            const dirVectors = getPM().dirVectors.slice();
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
                    slideInfo.tilesList.forEach((tile, index) => {
                        const step = { tile: tile, blocker: heavyBlocker, vecs: chosenVector };
                        for (let i = 0; i < index + 2; i++) { // +2 for a bit bias
                            possibleMoves.push(step);
                        }
                    });
                }
                if (mediumBlocker) {
                    // any pos ahead will do, except the first 1
                    slideInfo.tilesList.slice(1).forEach((tile, index) => {
                        const step = { tile: tile, blocker: mediumBlocker, vecs: chosenVector };
                        for (let i = 0; i < index + 1; i++) {
                            possibleMoves.push(step);
                        }
                    });
                }
                if (lightBlocker) { // preferred
                    // any pos ahead will do, except the first 2
                    slideInfo.tilesList.slice(2).forEach((tile, index) => {
                        const step = { tile: tile, blocker: lightBlocker, vecs: chosenVector };
                        for (let i = 0; i < index + 1; i++) {
                            possibleMoves.push(step);
                            // 50% chance to add more
                            if (p.random() < 0.5)
                                possibleMoves.push(step);
                        }
                    });
                }
                // no possible move? continue to next dir
                if (possibleMoves.length === 0)
                    continue;
                pickedStep = possibleMoves[p.floor(p.random(0, possibleMoves.length))];
                break;
            }
            // if a step picked then apply, else fail generation
            if (pickedStep) {
                MinigameMaster.generationSteps.push(pickedStep);
                MinigameMaster.blockersList.push(pickedStep.blocker);
                // add to solution
                const actualVecs = getOppositeVectors(pickedStep.vecs);
                getPM().dirVectors.some((vecs, vecsIndex) => {
                    // matching this vecs?
                    if (vecs.every((vec, index) => {
                        const targetVec = actualVecs[index];
                        if (targetVec && vec) {
                            return targetVec[0] === vec[0] && targetVec[1] === vec[1];
                        }
                        else
                            return index === 1 && targetVec === vec;
                    })) {
                        MinigameMaster.solution.unshift(getPM().degreesMap[vecsIndex]);
                        return true;
                    }
                    return false;
                });
            }
            else
                break; // no more step available
        }
        // review generation
        if (MinigameMaster.blockersList.length < MinigameMaster.blockersAmount) {
            MinigameMaster.puzzleIsReady = false;
        }
        else { // success
            MinigameMaster.startingTile = MinigameMaster.generationSteps[MinigameMaster.generationSteps.length - 1].tile;
            MinigameMaster.puzzleIsReady = true;
            MinigameMaster.reset();
        }
    },
    render: function (p) {
        const m = MinigameMaster.movement;
        // reset
        if (!m.isMoving)
            m.hoveredVecs = null;
        Object.keys(MinigameMaster.modal.btns).forEach(function (btnKey) {
            const btn = MinigameMaster.modal.btns[btnKey];
            btn.isHovered = false; // reset
        });
        // renders main buttons
        p.strokeWeight(2);
        MinigameMaster.mainBtns.forEach(function (btn) {
            btn.isHovered = false; // reset
            btn.draw(p);
        });
        p.translate(300, getPM().yPos); // moves the map
        // renders map
        p.stroke(MAIN_THEME.LIGHT);
        p.strokeWeight(1.5);
        p.noFill();
        p.textSize(20);
        MinigameMaster.mapTileKeys.forEach((tileKey) => {
            renderTile(p, MinigameMaster.mapTiles[tileKey]);
        });
        // renders teleporters
        if (MinigameMaster.teleporters[0]) {
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
        }
        // renders win text
        if (MinigameMaster.hasWon) {
            p.textSize(80 + p.cos(p.frameCount * 2.5) * 5);
            p.fill(MAIN_THEME.LIGHT);
            p.noStroke();
            p.text("ALL\nBLOCKERS\nDEFEATED", 0, 0);
        }
        // renders blockers
        p.textSize(36);
        p.noStroke();
        MinigameMaster.blockersList.forEach((b) => renderPuzzleBlocker(p, b));
        // renders ghost trails
        MinigameMaster.moveAnimation.ghostTrails = MinigameMaster.moveAnimation.ghostTrails
            .filter(gt => {
            gt.opacityValue -= 8;
            p.fill(gt.fillColor[0], gt.fillColor[1], gt.fillColor[2], p.min(gt.opacityValue, 120));
            renderTransitionalTile({
                p: p, tile: gt.tilePos,
                renderPos: gt.renderPos, scaleValue: 0.8, rotateValue: gt.rotation,
                extraRender: null
            });
            return gt.opacityValue >= 0;
        });
        // renders player
        let playerRenderPos, playerRotateValue = 0;
        if (m.isMoving && m.destinationTile && MinigameMaster.moveAnimation.progress >= 0) {
            playerRenderPos = [
                p.map(MinigameMaster.moveAnimation.progress, PUZZLE_CONSTANTS.MOVE_DURATION, 0, m.currentPosTile.renderPos[0], m.destinationTile.renderPos[0]),
                p.map(MinigameMaster.moveAnimation.progress, PUZZLE_CONSTANTS.MOVE_DURATION, 0, m.currentPosTile.renderPos[1], m.destinationTile.renderPos[1])
            ];
            playerRotateValue = p.map(MinigameMaster.moveAnimation.progress, PUZZLE_CONSTANTS.MOVE_DURATION, 0, 0, getPM().rotateMax);
            if (p.frameCount % 5 === 1) {
                MinigameMaster.moveAnimation.ghostTrails.push({
                    fillColor: PLAYER_COLOR[0], opacityValue: 300, tilePos: m.currentPosTile,
                    renderPos: playerRenderPos, rotation: playerRotateValue
                });
            }
        }
        renderPlayer(PLAYER_COLOR[0], PLAYER_COLOR[1], {
            p: p, tile: m.currentPosTile,
            renderPos: playerRenderPos, scaleValue: 0.8, rotateValue: playerRotateValue,
            extraRender: null
        });
        // update movement animation
        if (m.isMoving) {
            const ma = MinigameMaster.moveAnimation;
            if (ma.progress-- <= 1) { // done? finish moving
                m.currentPosTile = m.destinationTile;
                puzzleStartNextMove(p);
            }
        }
        else
            MinigameMaster.renderInputInterface(p, m); // input interface
        // renders input zone reminder
        if (m.reminderScale-- > 0) {
            MinigameMaster.renderEnlargingFrame(p, [230, 230, 230], m.currentPosTile, m.reminderScale);
        }
        // renders teleport effect
        if (MinigameMaster.teleportAnimationProgress-- > 0) {
            MinigameMaster.teleporters.forEach(t => MinigameMaster.renderEnlargingFrame(p, [230, 230, 0], t, MinigameMaster.teleportAnimationProgress));
        }
        // renders dummy blockers (copy of blocker render)
        p.noStroke();
        MinigameMaster.dummyBlockersList = MinigameMaster.dummyBlockersList.filter(db => {
            const bColor = PUZZLE_BLOCKER_COLORS[db.blocker.weight - 1];
            p.fill(bColor[0], bColor[1], bColor[2]);
            renderTransitionalTile({
                p: p, tile: db.blocker.tile,
                renderPos: [db.posVector.x, db.posVector.y], scaleValue: 0.8, rotateValue: db.rotation,
                extraRender: () => {
                    if (db.blocker.tile.tt === "TRIANGLE" && !db.blocker.tile.isUpward)
                        p.rotate(180);
                    p.fill(MAIN_THEME.LIGHT);
                    p.text(db.blocker.weight, 0, 0);
                }
            });
            // update
            const gravityVector = p.createVector(0, 0.5);
            db.velocityVector.add(gravityVector);
            db.posVector.add(db.velocityVector);
            db.rotation += db.rotationVel;
            return db.posVector.y < 800;
        });
        // update reminder
        if (!m.hoveredVecs && !m.isMoving) {
            if (m.reminderScale < PUZZLE_CONSTANTS.REMINDER_TRIGGER_POINT) {
                m.reminderScale = PUZZLE_CONSTANTS.REMINDER_SCALE_MAX;
            }
        }
        p.translate(-300, -getPM().yPos); // undo
        MinigameMaster.renderModal(p);
    },
    renderEnlargingFrame(p, colorValue, tile, scaleValue) {
        p.noFill();
        p.stroke(colorValue[0], colorValue[1], colorValue[2], p.map(scaleValue, PUZZLE_CONSTANTS.REMINDER_SCALE_MAX, 0, 255, 0));
        p.strokeWeight(2);
        renderTransitionalTile({
            p: p, tile: tile,
            renderPos: null,
            scaleValue: p.map(scaleValue, PUZZLE_CONSTANTS.REMINDER_SCALE_MAX, 0, 0.8, 2.0),
            rotateValue: 0,
            extraRender: null
        });
    },
    renderInputInterface(p, m) {
        if (MinigameMaster.modal.isOpen)
            return; // modal is open
        if (p.mouseY < 80 || MinigameMaster.hasWon)
            return; // out of board or won
        let currentRenderPos = m.currentPosTile.renderPos;
        let mousePos = [
            p.mouseX - 300,
            p.mouseY - getPM().yPos
        ];
        // close to player tile?
        const distFromPlayerTile = p.dist(mousePos[0], mousePos[1], currentRenderPos[0], currentRenderPos[1]);
        if (distFromPlayerTile < 180) {
            const hoveredDeg = getDegree(p, currentRenderPos, mousePos, getPM().degreesMap);
            m.hoveredVecs = getPM().dirVectors[getPM().degreesMap.indexOf(hoveredDeg)];
            const slideInfo = getSlideInfo(m.currentPosTile, m.hoveredVecs, false, true);
            if (slideInfo.hitEdgeTile)
                slideInfo.tilesList.push(slideInfo.hitEdgeTile);
            // remove all pos back to the destination tile
            for (let i = 0; i < slideInfo.tilesList.length; i++) {
                const t = slideInfo.tilesList[i];
                let blocker = null;
                MinigameMaster.blockersList.some(b => {
                    if (b.tile === t) {
                        blocker = b;
                        return true;
                    }
                    return false;
                });
                if (!blocker || blocker.isDestroyed)
                    continue; // skip this pos if not blocker
                // if this blocker is right next to player then remove ALL pos
                if (i === 0) {
                    slideInfo.tilesList = [];
                    break;
                }
                let sliceIndex;
                if (blocker.weight === 1)
                    sliceIndex = i + 2;
                else if (blocker.weight === 2)
                    sliceIndex = i + 1;
                else if (blocker.weight === 3)
                    sliceIndex = i;
                slideInfo.tilesList = slideInfo.tilesList.slice(0, sliceIndex);
                break;
            }
            // EXIT if no move available
            if (slideInfo.tilesList.length === 0) {
                m.hoveredVecs = null;
                return;
            }
            const redColor = p.color(230, 0, 0);
            const greenColor = p.color(0, 230, 0);
            const destinationTile = slideInfo.tilesList[slideInfo.tilesList.length - 1];
            const isOutOfBound = slideInfo.hitEdgeTile === destinationTile;
            if (isOutOfBound)
                m.hoveredVecs = null; // invalid move
            // renders move line
            if (isOutOfBound)
                p.stroke(redColor);
            else
                p.stroke(greenColor);
            p.strokeWeight(6);
            let previousTile = m.currentPosTile;
            slideInfo.tilesList.forEach((pathTile) => {
                // draw line if both previous and current tiles are not teleporters
                if (!MinigameMaster.teleporters.includes(pathTile) ||
                    !MinigameMaster.teleporters.includes(previousTile)) {
                    p.line(previousTile.renderPos[0], previousTile.renderPos[1], pathTile.renderPos[0], pathTile.renderPos[1]);
                }
                previousTile = pathTile;
            });
            // render destination tile
            if (isOutOfBound)
                p.fill(redColor);
            else
                p.fill(greenColor);
            p.noStroke();
            renderTile(p, destinationTile);
        }
    },
    renderModal(p) {
        const modal = MinigameMaster.modal;
        if (!modal.isOpen)
            return;
        // dark overlay
        p.fill(0, 0, 0, 200);
        p.rect(300, 300, 700, 700);
        p.strokeWeight(2);
        // content
        if (modal.content === "HELP") {
            p.textSize(30);
            p.fill(MAIN_THEME.LIGHT);
            if (modal.contentIndex === 1) {
                p.text("The goal is to smash all blockers, you know, the ones with a silly number on them. You are the cool looking one.", 300, 390, 500);
                p.text("You", 250, 310);
                p.text("Not you", 420, 320);
                p.stroke(MAIN_THEME.LIGHT);
                p.strokeWeight(6);
                renderArrow(p, {
                    r: 120, s: 1, x: 180, y: 280
                });
                renderArrow(p, {
                    r: 100, s: 1, x: 500, y: 280
                });
                p.noStroke();
                renderPlayer(PLAYER_COLOR[0], PLAYER_COLOR[1], {
                    p: p, tile: CENTER_TILES[MinigameMaster.tt],
                    renderPos: [130, 150], scaleValue: 1.5, rotateValue: -20,
                    extraRender: null
                });
                p.push();
                p.translate(400, 100);
                p.rotate(10);
                p.scale(1.5);
                renderPuzzleBlocker(p, {
                    tile: CENTER_TILES[MinigameMaster.tt], weight: 1
                });
                p.translate(50, 10);
                renderPuzzleBlocker(p, {
                    tile: CENTER_TILES[MinigameMaster.tt], weight: 2
                });
                p.translate(-40, 40);
                renderPuzzleBlocker(p, {
                    tile: CENTER_TILES[MinigameMaster.tt], weight: 3
                });
                p.pop();
            }
            else if (modal.contentIndex === 2) {
                p.text("Click to move in any direction your heart desires, except when the path is blocked, or you when would go out of bound.", 300, 350, 500);
                renderPlayer(PLAYER_COLOR[0], PLAYER_COLOR[1], {
                    p: p, tile: CENTER_TILES[MinigameMaster.tt],
                    renderPos: [300, 200], scaleValue: 1.5, rotateValue: 0,
                    extraRender: null
                });
                p.stroke(MAIN_THEME.LIGHT);
                p.strokeWeight(6);
                renderArrow(p, {
                    r: 140, s: 1, x: 160, y: 140
                });
                renderArrow(p, {
                    r: 330, s: 1, x: 450, y: 250
                });
            }
            else if (modal.contentIndex === 3) {
                p.text("The silly number each blocker has is its weight. The heaviest one (3) stops you as soon as you hit it. The less heavy ones allow you to move a bit more after the collision.", 300, 320, 500);
                p.text("The silly number", 420, 210);
                p.push();
                p.translate(200, 100);
                p.rotate(-10);
                p.scale(1.2);
                renderPuzzleBlocker(p, {
                    tile: CENTER_TILES["SQUARE"], weight: 1
                });
                p.scale(1.2);
                p.rotate(20);
                p.translate(50, 10);
                renderPuzzleBlocker(p, {
                    tile: CENTER_TILES["TRIANGLE"], weight: 2
                });
                p.scale(1.4);
                p.rotate(-10);
                p.translate(-50, 30);
                renderPuzzleBlocker(p, {
                    tile: CENTER_TILES["HEXAGON"], weight: 3
                });
                p.pop();
                p.stroke(MAIN_THEME.LIGHT);
                p.strokeWeight(6);
                renderArrow(p, {
                    r: 155, s: 1, x: 250, y: 220
                });
            }
            else if (modal.contentIndex === 4) {
                p.text("Oh and the teleporter could be useful too, who knows. Have fun sending these blockers flying!", 300, 350, 500);
                p.push();
                p.translate(170, 130);
                p.rotate(-50);
                p.scale(1.7);
                renderPuzzleBlocker(p, {
                    tile: CENTER_TILES[MinigameMaster.tt], weight: 1
                });
                p.translate(-30, 50);
                p.rotate(-20);
                renderPuzzleBlocker(p, {
                    tile: CENTER_TILES[MinigameMaster.tt], weight: 3
                });
                p.rotate(100);
                p.textSize(12);
                p.fill(MAIN_THEME.LIGHT);
                p.text("\"What have we ever done\nto deserve this??\"", 80, -80);
                p.pop();
            }
        }
        else if (modal.content === "SOLUTION") {
            p.textSize(36);
            p.fill(MAIN_THEME.LIGHT);
            p.noStroke();
            if (modal.contentIndex === 0) { // sure1
                p.text("Are you sure that you have given up on the pride of solving the puzzle on your own?", 300, 150, 500);
                modal.btns["solution,1,yes"].draw(p);
                modal.btns["solution,1,no"].draw(p);
            }
            else if (modal.contentIndex === 1) { // sure2
                p.text("Are you absolutely sure?", 300, 150);
                for (let noY = 0; noY < 4; noY++) {
                    for (let noX = 0; noX < 4; noX++) {
                        modal.btns["solution,2,btn," + noX + noY].draw(p);
                    }
                }
            }
            else if (modal.contentIndex === 2) { // solution
                p.textSize(24);
                MinigameMaster.solution.forEach((deg, i) => {
                    const x = 150 + (i % 3) * 150;
                    const y = 150 + p.floor(i / 3) * 150;
                    p.stroke(MAIN_THEME.LIGHT);
                    p.strokeWeight(10);
                    renderArrow(p, { r: deg, s: 1, x: x, y: y });
                    p.noStroke();
                    p.fill(MAIN_THEME.LIGHT);
                    p.ellipse(x, y, 40, 40);
                    p.fill(MAIN_THEME.DARK);
                    p.text(i + 1, x, y);
                });
            }
        }
        else if (modal.content === "NEW PUZZLE") {
            for (let i = 0; i < 3; i++) {
                modal.btns["newpuzzle," + i].draw(p);
            }
        }
        else if (modal.content === "TITLE") {
            renderTitle(p);
        }
    },
    mouseReleased(p) {
        // start moving if not moving and valid move
        const m = MinigameMaster.movement;
        if (!m.isMoving && m.hoveredVecs) {
            puzzleStartNextMove(p);
            return;
        }
        // check button clicks
        MinigameMaster.mainBtns.some(function (btn) {
            if (btn.isHovered)
                btn.action();
            return btn.isHovered;
        });
        // check modal clicks
        const modal = MinigameMaster.modal;
        if (modal.isOpen) {
            if (modal.content === "HELP") {
                modal.contentIndex++;
                if (modal.contentIndex > 4)
                    modal.isOpen = false;
                return;
            }
            else if (modal.content === "SOLUTION") {
                // close modal on last content page
                if (modal.contentIndex === 2)
                    modal.isOpen = false;
            }
            else if (modal.content === "NEW PUZZLE") {
                if (modal.contentIndex > 0)
                    modal.isOpen = false;
                modal.contentIndex++;
            }
            else if (modal.content === "TITLE") {
                modal.isOpen = false;
            }
            // check modal buttons
            Object.keys(modal.btns).some(function (btnKey) {
                const btn = modal.btns[btnKey];
                if (btn.isHovered)
                    btn.action();
                return btn.isHovered;
            });
        }
    },
    getRandomTile(p) {
        return MinigameMaster.mapTiles[MinigameMaster.mapTileKeys[p.floor(p.random(0, MinigameMaster.mapTileKeys.length))]];
    },
    reset() {
        const m = MinigameMaster.movement;
        m.currentPosTile = MinigameMaster.startingTile;
        m.reminderScale = 0;
        m.isMoving = false;
        MinigameMaster.hasWon = false;
        MinigameMaster.dummyBlockersList = [];
        MinigameMaster.moveAnimation.progress = 0;
        MinigameMaster.moveAnimation.ghostTrails = [];
        MinigameMaster.blockersList.forEach(b => b.isDestroyed = false);
        MinigameMaster.modal.isOpen = false;
    }
};
function displayTitle(p) {
    MinigameMaster.modal.isOpen = true;
    MinigameMaster.modal.content = "TITLE";
}
function renderTitle(p) {
    p.noStroke();
    p.fill(MAIN_THEME.LIGHT);
    p.textSize(60);
    p.text("Little", 230, 200);
    p.textSize(100);
    p.text("Minigame", 330, 300);
    p.stroke(MAIN_THEME.LIGHT);
    p.strokeWeight(6);
    p.line(0, 50, 600, 200);
    p.line(0, 350, 600, 500);
}
function renderPuzzleBlocker(p, b) {
    if (b.isDestroyed)
        return;
    const bColor = PUZZLE_BLOCKER_COLORS[b.weight - 1];
    p.fill(bColor[0], bColor[1], bColor[2]);
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
}
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
function puzzleStartNextMove(p) {
    const m = MinigameMaster.movement;
    // if current pos is teleporter then teleport
    MinigameMaster.teleporters.some((t, index) => {
        if (t === m.currentPosTile) {
            const otherTeleporter = MinigameMaster.teleporters[index === 0 ? 1 : 0];
            m.currentPosTile = otherTeleporter;
            MinigameMaster.teleportAnimationProgress = PUZZLE_CONSTANTS.REMINDER_SCALE_MAX;
            return true;
        }
        return false;
    });
    // go thru all vecs to check if that destination tile exists (triangle case)
    m.hoveredVecs.some(vec => {
        const newPos = [
            vec[0] + m.currentPosTile.pos[0],
            vec[1] + m.currentPosTile.pos[1]
        ];
        const neighbor = m.currentPosTile.neighbors[posToKey(newPos)];
        if (neighbor && neighbor.tile) {
            m.destinationTile = neighbor.tile;
            return true;
        }
        return false;
    });
    if (m.destinationTile === null)
        throw "destination tile is null when starting next move";
    // if hitting a blocker then set forcestop
    let blocker;
    MinigameMaster.blockersList.some((b) => {
        if (m.destinationTile === b.tile && !b.isDestroyed) {
            blocker = b;
            return true;
        }
        return false;
    });
    if (blocker && m.forceStopCountdown > 10) {
        if (blocker.weight === 1)
            m.forceStopCountdown = 2;
        else if (blocker.weight === 2)
            m.forceStopCountdown = 1;
        else if (blocker.weight === 3)
            m.forceStopCountdown = 0;
        blocker.isDestroyed = true;
        // add to animation
        const velocityVector = p.createVector(12 - p.sq(blocker.weight) * 0.5, 0);
        const degIndex = getPM().dirVectors.indexOf(m.hoveredVecs);
        velocityVector.rotate(-getPM().degreesMap[degIndex]);
        MinigameMaster.dummyBlockersList.push({
            blocker: blocker, rotation: 0,
            rotationVel: (4 - blocker.weight) * 0.8 * (p.random() > 0.5 ? 1 : -1),
            posVector: p.createVector(blocker.tile.renderPos[0], blocker.tile.renderPos[1]),
            velocityVector: velocityVector
        });
        // check win
        MinigameMaster.hasWon = MinigameMaster.blockersList.every(b => b.isDestroyed);
    }
    // check if time to stop
    if (m.forceStopCountdown <= 0) {
        m.reminderScale = PUZZLE_CONSTANTS.REMINDER_SCALE_MAX;
        m.isMoving = false;
        m.hoveredVecs = null;
        m.forceStopCountdown = 100;
    }
    else {
        m.forceStopCountdown--;
        m.isMoving = true;
        MinigameMaster.moveAnimation.progress = PUZZLE_CONSTANTS.MOVE_DURATION;
    }
}
function getPM() {
    return PUZZLE_MAPS[MinigameMaster.tt];
}
function getHeavyBlocker(currentPosTile, chosenVector) {
    // check the pos behind if empty and not near any light blocker
    const oppositeVector = getOppositeVectors(chosenVector);
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
function getSlideInfo(currentTile, vecs, ignoreTelerporter, // for spawning teleporters
ignoreBlocker // for input preview (add teleporter tiles too)
) {
    const [vec1, vec2] = vecs;
    const result = {
        tilesList: [],
        hitBlocker: null,
        hitEdgeTile: null
    };
    while (true) {
        // vec1
        const vec1Pos = [
            currentTile.pos[0] + vec1[0],
            currentTile.pos[1] + vec1[1]
        ];
        let nextNeighbor = currentTile.neighbors[posToKey(vec1Pos)];
        // if is edge then quit
        if (nextNeighbor && nextNeighbor.isEdge) {
            result.hitEdgeTile = createEdgeNeighborTile(vec1Pos);
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
                result.hitEdgeTile = createEdgeNeighborTile(vec2Pos);
                break;
            }
        }
        // if vec2 tile also doesn't exist then quit
        if (!nextNeighbor || !nextNeighbor.tile)
            break;
        // tile exists! check if has blocker (if not ignored)
        if (!ignoreBlocker) {
            const hasBlocker = MinigameMaster.blockersList.some((b) => {
                if (b.tile === nextNeighbor.tile) {
                    result.hitBlocker = b;
                    return true;
                }
                return false;
            });
            if (hasBlocker)
                break;
        }
        if (!ignoreTelerporter) { // not ignore?
            // check if is teleporter
            const isFirstTeleporter = nextNeighbor.tile === MinigameMaster.teleporters[0];
            const isSecondTeleporter = nextNeighbor.tile === MinigameMaster.teleporters[1];
            if (isFirstTeleporter) {
                if (ignoreBlocker) { // for input preview: add both teleporters
                    result.tilesList.push(nextNeighbor.tile);
                    result.tilesList.push(MinigameMaster.teleporters[1]);
                }
                currentTile = MinigameMaster.teleporters[1];
                continue;
            }
            else if (isSecondTeleporter) {
                if (ignoreBlocker) { // for input preview: add both teleporters
                    result.tilesList.push(nextNeighbor.tile);
                    result.tilesList.push(MinigameMaster.teleporters[0]);
                }
                currentTile = MinigameMaster.teleporters[0];
                continue;
            }
        }
        result.tilesList.push(nextNeighbor.tile); // this tile is good to be added
        currentTile = nextNeighbor.tile; // goes on
    }
    return result;
}
function createEdgeNeighborTile(pos) {
    if (!MinigameMaster.puzzleIsReady)
        return null; // is generating, no need to create
    return getNewTile(pos, MinigameMaster.tt);
}
const sketch = (p) => {
    let previousClickFrame = 0;
    p.setup = () => {
        p.createCanvas(600, 600);
        p.rectMode(p.CENTER);
        p.textAlign(p.CENTER, p.CENTER);
        p.textFont("monospace");
        p.angleMode(p.DEGREES);
        // set up puzzle main buttons
        const mainBtnsDoCheckHover = () => !MinigameMaster.modal.isOpen;
        const modal = MinigameMaster.modal;
        MinigameMaster.mainBtns = [
            new Button("Help", 80, 40, 130, 40, 22, () => {
                modal.isOpen = true;
                modal.content = "HELP";
                modal.contentIndex = 0;
            }, mainBtnsDoCheckHover),
            new Button("Reset", 220, 40, 130, 40, 22, () => {
                MinigameMaster.reset();
            }, mainBtnsDoCheckHover),
            new Button("Solution", 380, 40, 130, 40, 18, () => {
                modal.isOpen = true;
                modal.content = "SOLUTION";
                modal.contentIndex = 0;
            }, mainBtnsDoCheckHover),
            new Button("New Puzzle", 520, 40, 130, 40, 18, () => {
                modal.isOpen = true;
                modal.content = "NEW PUZZLE";
                modal.contentIndex = 0;
            }, mainBtnsDoCheckHover)
        ];
        // set up puzzle modal buttons
        const yesAction = () => modal.contentIndex++;
        const noAction = () => modal.isOpen = false;
        modal.btns["solution,1,yes"] = new Button("Yes", 200, 400, 100, 60, 30, yesAction);
        modal.btns["solution,1,no"] = new Button("No", 400, 400, 100, 60, 30, noAction);
        const yesX = p.floor(p.random(1, 4)), yesY = p.floor(p.random(1, 4));
        for (let noY = 0; noY < 4; noY++) {
            for (let noX = 0; noX < 4; noX++) {
                let action;
                let btnText;
                if (noX === yesX && noY === yesY) {
                    action = yesAction;
                    btnText = "Yes";
                }
                else {
                    action = noAction;
                    btnText = "No";
                }
                modal.btns["solution,2,btn," + noX + noY] = new Button(btnText, 120 + noX * 120, 270 + noY * 80, 100, 60, 30, action);
            }
        }
        // new puzzle buttons
        const tts = ["TRIANGLE", "SQUARE", "HEXAGON"];
        const difs = [PUZZLE_CONSTANTS.DIFFICULTY_1, PUZZLE_CONSTANTS.DIFFICULTY_2, PUZZLE_CONSTANTS.DIFFICULTY_3];
        ["Super easy", "Pretty easy", "Not so easy"].forEach((name, i) => {
            modal.btns["newpuzzle," + i] = new Button(name, 300, 150 + i * 100, 270, 70, 30, () => {
                MinigameMaster.setUpPuzzle(difs[i], tts[p.floor(p.random(0, 3))], p);
            });
        });
        // default game
        MinigameMaster.setUpPuzzle(PUZZLE_CONSTANTS.DIFFICULTY_1, tts[p.floor(p.random(0, 3))], p);
    };
    p.draw = () => {
        p.push();
        p.background(MAIN_THEME.DARK);
        // rendering minigame scene
        if (MinigameMaster.puzzleIsReady)
            MinigameMaster.render(p);
        else {
            p.fill(MAIN_THEME.LIGHT);
            p.textSize(40);
            p.text("Generating...", 300, 300);
            MinigameMaster.generatePuzzle(p);
        }
        // var hex = new Hexagon_Tile([0, 0]);
        // var sq = new Square_Tile([0, 0]);
        // var tri = new Triangle_Tile([0, -0.1]);
        // renderTile(p, hex);
        // renderTile(p, sq);
        // renderTile(p, tri);
        p.pop();
    };
    p.mouseReleased = () => {
        // prevents rapid trigger
        if (p.frameCount - previousClickFrame < 10)
            return;
        else
            previousClickFrame = p.frameCount;
        // mini game scene
        if (MinigameMaster.puzzleIsReady)
            MinigameMaster.mouseReleased(p);
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
// returns the degree in degreesMap that is closest to tracker direction
function getDegree(p, centerPos, trackerPos, degreesMap) {
    let a = p.atan2(trackerPos[1] - centerPos[1], trackerPos[0] - centerPos[0]) * -1;
    if (a < 0)
        a = 360 + a;
    // see which is the closest to input deg
    const proximities = degreesMap
        .map(function (deg, index) {
        const abs1 = p.abs(a - deg);
        let abs2 = 999;
        if (a > 270) {
            abs2 = p.abs(-(360 - a) - deg);
        }
        return [p.min(abs1, abs2), index];
    });
    proximities.sort((prox1, prox2) => prox1[0] - prox2[0]);
    return degreesMap[proximities[0][1]];
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
//# sourceMappingURL=build.js.map