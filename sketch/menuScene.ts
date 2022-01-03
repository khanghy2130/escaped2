const MENU_LINE_LENGTH: number = 20; // shouldn't cover 3 whole walls


interface MENU_LINE {
    timer: number, length: number, 
    wallsList: ([Position2D, Position2D])[] // first wall is head
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
    render: (p: p5) => void;
    mouseReleased: (p: p5) => void;
}






const MenuScene: MenuSceneType = {
    tt: "SQUARE",
    mapTiles: {}, 
    mapTileKeys: [],
    lines: [],
    letters: [],
    
    // set up tt, mapTiles, mapTileKeys
    setUpGrid: function(tt: Tile_Type):void{
        MenuScene.tt = tt;
        MenuScene.mapTiles = {};
        // 0 => 12, -4 => 12
        for (let y=-4;y<13;y++){
            for (let x=0;x<13;x++){
                const pos: Position2D = [x,y];
                MenuScene.mapTiles[posToKey(pos)] = getNewTile(pos, tt);
            }
        }
        MenuScene.mapTileKeys = Object.keys(MenuScene.mapTiles);
        
    },

    render: function(p:p5):void{
        if (MenuScene.mapTileKeys.length === 0) {return;} // not set up
        p.stroke(MAIN_THEME.LIGHT);
        p.strokeWeight(1);
        MenuScene.mapTileKeys.forEach((tileKey: string) => {
            const tile : Tile = MenuScene.mapTiles[tileKey];
            if (tile.item !== "YES") p.noFill();
            else p.fill(100, 100, 100);

            renderTile(p, tile);
        });
    },

    mouseReleased: function(p:p5):void{
        // toggleTileMap(p);


    }
};





const temList: Position2D[] = [];
for (let y=-5;y<=15;y++){
    for (let x=0;x<=15;x++){
        temList.push([x,y]);
    }
}
// set up with temList, render YES colored
function toggleTileMap(p:p5): void{
    MenuScene.mapTileKeys.some((tileKey: string) => {
        const tile : Tile = MenuScene.mapTiles[tileKey];
        if (checkTileHovered(p, tile)){
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



