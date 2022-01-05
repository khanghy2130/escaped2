const MENU_LINE_LENGTH: number = 220; // shouldn't cover 3 whole walls
const MENU_LINE_TIMER: number = 120; // how long a line appears
let MENU_LINE_SPEED: number = 10; // divisible by 5


/* start when at a certain timer
stop growing when hit max length
shrink when timer is done
set up all lines again when all lines are done shrinking*/
interface MENU_LINE {
    timer: number, length: number, 
    wallsList: ({
        tile: Tile,
        progress: number, // goes from 0 to 100 to 200 (progress - 100 backwards)
        twoRenderPos: [Position2D, Position2D]
    })[] // first wall is head, last vertex is head
}
interface MENU_LETTER {
    letter: string,
    renderPos: Position2D,
    rotation: number,
    ghostTrails: ({
        renderPos: Position2D, opacity: number, rotation: number
    })[]
}

interface MenuSceneType {
    tt: Tile_Type;
    mapTiles: {[keys:string]: Tile}; 
    mapTileKeys: string[];

    lines: MENU_LINE[],
    letters: MENU_LETTER[],

    setUpGrid: (tt: Tile_Type) => void;
    render: () => void;
    mouseReleased: () => void;
}






const MenuScene: MenuSceneType = {
    tt: "SQUARE",
    mapTiles: {}, 
    mapTileKeys: [],
    lines: [],
    letters: [],
    
    // set up tt, mapTiles, mapTileKeys, lines
    setUpGrid: function(tt: Tile_Type):void{
        MenuScene.tt = tt;
        MenuScene.mapTiles = {};
        // map size: 0 => 12, -4 => 12
        for (let y=-4;y<13;y++){
            for (let x=0;x<13;x++){
                const pos: Position2D = [x,y];
                MenuScene.mapTiles[posToKey(pos)] = getNewTile(pos, tt);
            }
        }
        MenuScene.mapTileKeys = Object.keys(MenuScene.mapTiles);
        // connect neighbors
        connectNeighbors(MenuScene.mapTileKeys, MenuScene.mapTiles);
        
        if (tt === "HEXAGON") {MENU_LINE_SPEED = 15;}
        else {MENU_LINE_SPEED = 10;}

        MenuScene.lines = [];
        for (let i=0; i < 20; i++){ // add multiple lines
            // pick a tile then a wall
            const pickedTile: Tile = MenuScene.mapTiles[
                getRandomItemFromArr<string>(MenuScene.mapTileKeys)
            ];

            MenuScene.lines.push({
                timer: MENU_LINE_TIMER + i*30, // delay between lines appearing
                length:0, wallsList: [{
                    tile: pickedTile, progress: 0,
                    twoRenderPos: [
                        pickedTile.verticesList[0],
                        pickedTile.verticesList[1]
                    ]
                }]
            });
        }
    },

    render: function():void{
        // renders title
        /////////////////////

        // set up grid if not having one or all done
        const allLinesDone: boolean = MenuScene.lines.every(l => l.length <= 0 && l.timer <= 0);
        if (MenuScene.lines.length === 0 || allLinesDone) {
            MenuScene.setUpGrid(TTs[p.floor(p.random(0,3))]);
            return;
        }

        // update & render lines
        p.stroke(MAIN_THEME.LIGHT);
        p.strokeWeight(5);
        MenuScene.lines.forEach(l=>{
            if (l.wallsList.length <= 0) return;

            l.timer--;
            // time to moving forward?
            if (l.timer <= MENU_LINE_TIMER && l.timer >= 0){
                l.length += MENU_LINE_SPEED;
                const headWall: MENU_LINE["wallsList"][0] = l.wallsList[0];
                if (headWall.progress < 100){ // still covering the wall
                    headWall.progress += MENU_LINE_SPEED;
                } else { // covered the wall? add new wall
                    l.wallsList.unshift(getNextWallsListItem(headWall));
                }
            }

            // shrinking (when ending or at max length)
            if (l.timer < 0 || l.length >= MENU_LINE_LENGTH){
                l.length -= MENU_LINE_SPEED;
                const tailWall: MENU_LINE["wallsList"][0] = l.wallsList[l.wallsList.length-1];
                if (tailWall.progress < 200){ // still shrinking
                    tailWall.progress += MENU_LINE_SPEED;
                } else { // done shrinking
                    // remove wall
                    l.wallsList.pop();
                }
            }

            // render line
            l.wallsList.forEach(WLitem => {
                if (WLitem.progress <= 0){return;} // not started
                // growing?
                if (WLitem.progress <= 100){
                    const headRenderPos: Position2D = [
                        p.map(WLitem.progress, 0, 100, 
                            WLitem.twoRenderPos[0][0], 
                            WLitem.twoRenderPos[1][0]
                        ),
                        p.map(WLitem.progress, 0, 100, 
                            WLitem.twoRenderPos[0][1], 
                            WLitem.twoRenderPos[1][1]
                        )
                    ];
                    p.line(
                        WLitem.twoRenderPos[0][0],
                        WLitem.twoRenderPos[0][1],
                        headRenderPos[0],
                        headRenderPos[1]
                    );
                } else if (WLitem.progress <= 200){
                    const tailRenderPos: Position2D = [
                        p.map(WLitem.progress, 200, 100, 
                            WLitem.twoRenderPos[1][0],
                            WLitem.twoRenderPos[0][0] 
                        ),
                        p.map(WLitem.progress, 200, 100, 
                            WLitem.twoRenderPos[1][1],
                            WLitem.twoRenderPos[0][1]
                        )
                    ];
                    p.line(
                        tailRenderPos[0],
                        tailRenderPos[1],
                        WLitem.twoRenderPos[1][0],
                        WLitem.twoRenderPos[1][1]
                    );
                }
            });
        });
        
    },

    mouseReleased: function():void{
        // toggleTileMap(p);
    }
};


function getNextWallsListItem(
    currentItem: MENU_LINE["wallsList"][0]
): MENU_LINE["wallsList"][0] {
    let nextItem: MENU_LINE["wallsList"][0]; // list of possible next wallsList item
    const [firstVertex, lastVertex] = currentItem.twoRenderPos;
    const possibleItems: MENU_LINE["wallsList"] = [];

    const tilesList: Tile[] = [currentItem.tile];
    const thisTileNeighbors: Tile["neighbors"] = currentItem.tile.neighbors;
    Object.keys(thisTileNeighbors).forEach(nKey => {
        const n: Tile = thisTileNeighbors[nKey].tile;
        if (n) {tilesList.push(n);}
    });

    // add to possibleItems
    tilesList.forEach((t) => {
        // check for same vertex only
        t.verticesList.some((vpos, posIndex) => {
            if (p.dist(vpos[0], vpos[1], lastVertex[0], lastVertex[1]) < 1){
                // found matching vertex!
                [posIndex-1,posIndex+1].forEach(vIndex => {
                    // constrain
                    if (vIndex < 0) vIndex = t.verticesList.length - 1;
                    if (vIndex >= t.verticesList.length) vIndex = 0;
                   
                    const possibleNextVertex: Position2D = t.verticesList[vIndex];
                    const isFirstVertex: boolean = p.dist(
                        possibleNextVertex[0], possibleNextVertex[1], 
                        firstVertex[0], firstVertex[1]
                    ) < 1;
                    if (isFirstVertex){return;}  // must not be first vertex
                    
                    possibleItems.push({tile: t, progress: 0, twoRenderPos: [
                        lastVertex, possibleNextVertex
                    ]});
                });

                return true;
            }
            return false; // not same vertex
        });
    });

    return getRandomItemFromArr<typeof nextItem>(possibleItems);
}



const temList: Position2D[] = [];
for (let y=-5;y<=15;y++){
    for (let x=0;x<=15;x++){
        temList.push([x,y]);
    }
}
// set up with temList
/*
p.textSize(12);
p.stroke(MAIN_THEME.LIGHT);
p.strokeWeight(1);
MenuScene.mapTileKeys.forEach((tileKey: string) => {
    const tile : Tile = MenuScene.mapTiles[tileKey];
    if (tile.item !== "YES") p.noFill();
    else p.fill(100, 100, 100);

    renderTile(tile);
});
*/
function toggleTileMap(): void{
    MenuScene.mapTileKeys.some((tileKey: string) => {
        const tile : Tile = MenuScene.mapTiles[tileKey];
        if (checkTileHovered(tile)){
            if (tile.item === "YES") tile.item = null;
            else tile.item = "YES";
            return true;
        }
        return false;
    });
    if (p.keyIsPressed) printMap(); // hold key then click
}
function printMap():void{
    let result: string = "";
    MenuScene.mapTileKeys.forEach(tileKey => {
        const tile: Tile = MenuScene.mapTiles[tileKey];
        if (tile.item !== "YES") return;
        const pos: Position2D = tile.pos;
        result += `[${pos[0]},${pos[1]}],`;
    });
    console.log(result);
}



