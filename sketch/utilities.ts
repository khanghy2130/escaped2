type SCENE_TYPE = "MENU" | "GENERATING" | "PLAY" | "GAMEOVER" | "REPORT" | "SHOP";
let currentScene: SCENE_TYPE = "MENU";

















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