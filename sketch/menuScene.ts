const MENU_LINE_MAX_LENGTH: number = 20; // shouldn't cover 3 whole walls
const MENU_LINE_PROGRESS_SPEED: number = 10; // divisible by 5

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
        
        MenuScene.lines = [];
        for (let i=0; i < 10; i++){ // add multiple lines
            // pick a tile then a wall
            const pickedTile: Tile = MenuScene.mapTiles[
                getRandomItemFromArr<string>(MenuScene.mapTileKeys)
            ];

            MenuScene.lines.push({
                timer: 120 + i*100, // delay between lines appearing
                length:0, wallsList: [{
                    tile: pickedTile, progress: 0,
                    twoRenderPos: [
                        pickedTile.verticesList[0],
                        pickedTile.verticesList[1]
                    ]
                }]
            });
        }

        /// test runnnnnnnn
        MenuScene.lines.forEach(l=>{
            l.wallsList.push(getNextWallsListItem(l.wallsList[0]))
        });
    },

    render: function():void{
        if (MenuScene.mapTileKeys.length === 0) {return;} // not set up

        // renders grid ////
        p.textSize(12);
        p.stroke(MAIN_THEME.LIGHT);
        p.strokeWeight(1);
        MenuScene.mapTileKeys.forEach((tileKey: string) => {
            const tile : Tile = MenuScene.mapTiles[tileKey];
            if (tile.item !== "YES") p.noFill();
            else p.fill(100, 100, 100);

            renderTile(tile);
        });

        // renders test line /////
        p.stroke(200,0,0);
        p.strokeWeight(5);
        MenuScene.lines.forEach(l => {
            l.wallsList.forEach(WLitem => {
                p.line(
                    WLitem.twoRenderPos[0][0],
                    WLitem.twoRenderPos[0][1],
                    WLitem.twoRenderPos[1][0],
                    WLitem.twoRenderPos[1][1]
                );
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
// set up with temList, render YES colored
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



