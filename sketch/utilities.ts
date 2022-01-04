let p: p5;


type SCENE_TYPE = "MENU" | "GENERATING" | "PLAY" | "GAMEOVER" | "REPORT" | "SHOP";
let currentScene: SCENE_TYPE = "MENU";

type ANY_SCENE_TYPE = MenuSceneType | null;

const SCENES: {[keys:string]: ANY_SCENE_TYPE} = {
    "MENU": MenuScene,
    "GENERATING": null,
    "PLAY": null,
    "GAMEOVER": null,
    "REPORT": null,
    "SHOP": null
};















function renderArrow(p: p5, props: {r: number, s: number, x: number, y: number}): void{
    const {r,s,x,y} = props;
    p.push();
    p.translate(x, y);
    p.rotate(-r);
    p.scale(s);
    p.line(-50, 0, 50, 0);
    p.line(20, -30, 50, 0);
    p.line(20, 30, 50, 0);
    p.pop();
}

function getRandomItemFromArr<Type>(arr: Type[]):Type{
    return arr[p.floor(p.random(0, arr.length))];
}

function connectNeighbors(mapKeys: string[], mapTiles: {[keys:string]: Tile}):void{
    mapKeys.forEach((tileKey: string) => {
        const currentTile = mapTiles[tileKey];
        Object.keys(currentTile.neighbors).forEach((nKey: string) => {
            const nTile: Tile = mapTiles[nKey];
            if (nTile){ // if exists, modify current neighbor object
                currentTile.neighbors[nKey] = {
                    tile: mapTiles[nKey], isEdge: false, isWalled: false
                };
            }
        });
    });
}