import { BATTLE_MARKS } from "./battle-sprites.js";
// Combat cameras belong to their location. Exploration uses its own top-down art.
export function battleEnvironment(world, flags = {}) {
  if (world === "lab")
    return flags.labDamaged ? "battleLabDamaged" : "battleLab";
  if (world === "gym") return "battleGym";
  return "battleCourtyard";
}

// Battle-only floor treatment: approved exploration PNGs stay untouched.
export function drawBattleArena(g) {
  const floor=g.createLinearGradient(0,275,0,720);
  floor.addColorStop(0,'rgba(69,133,213,0)');floor.addColorStop(.075,'#639ce3');
  floor.addColorStop(1,'#426fbc');g.fillStyle=floor;g.fillRect(0,275,1280,445);
  for(const side of ['opponent','player']){
    const {x,y}=BATTLE_MARKS[side],rx=side==='player'?225:200,ry=side==='player'?64:58;
    g.save();
    const light=g.createRadialGradient(x,y,0,x,y,rx);
    light.addColorStop(0,'#81b8ed55');light.addColorStop(1,'#2b5fab22');
    g.fillStyle=light;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill();
    for(const [inset,width,color] of [[0,12,'#075fba'],[0,3,'#e5be69'],[10,2,'#83ebff'],[16,2,'#1562b4']]){
      g.beginPath();g.ellipse(x,y,rx-inset,ry-inset*.3,0,0,Math.PI*2);g.lineWidth=width;g.strokeStyle=color;g.stroke();
    }
    for(const [dx,dy] of [[-rx,0],[rx,0],[0,-ry],[0,ry]]){
      g.beginPath();g.moveTo(x+dx-13,y+dy);g.lineTo(x+dx,y+dy-9);g.lineTo(x+dx+13,y+dy);g.lineTo(x+dx,y+dy+9);g.closePath();
      g.fillStyle='#f0cf7e';g.fill();g.strokeStyle='#996e35';g.lineWidth=1.5;g.stroke();
      g.beginPath();g.moveTo(x+dx-6,y+dy);g.lineTo(x+dx,y+dy-4);g.lineTo(x+dx+6,y+dy);g.lineTo(x+dx,y+dy+4);g.closePath();g.fillStyle='#9eefff';g.fill();
    }
    g.restore();
  }
}
