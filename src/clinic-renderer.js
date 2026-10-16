import { relaxedHumanFrame } from "./human-rig.js";
import { extractSprite } from "./character-atlas.js";
import { CLINIC, bedPhase, mix, smooth } from "./clinic-layout.js";

export class ClinicRenderer {
  constructor(assets) {
    this.assets = assets;
    const pose = assets.images.liraSeated;
    this.lira = [0, 1].map((i) =>
      extractSprite(pose, [
        (i * pose.width) / 2,
        0,
        pose.width / 2,
        pose.height,
      ]),
    );
    this.soles = this.lira.map(f => {
      const d=f.canvas.getContext("2d").getImageData(0,0,f.canvas.width,f.canvas.height).data;
      const xs=[];
      for(let y=f.b-10;y<=f.b;y++)for(let x=f.l;x<=f.r;x++)
        if(d[(y*f.canvas.width+x)*4+3]>=224)xs.push(x);
      return {x:xs.reduce((a,b)=>a+b,0)/xs.length,y:f.b+1};
    });
  }
  seatedLira(g, q) {
    const unit=.11, finalHip=[580,670], sole=this.soles[0];
    const planted={x:CLINIC.seat.x+(finalHip[0]-sole.x)*unit,
      y:CLINIC.seat.y+(sole.y-finalHip[1])*unit};
    g.save();g.imageSmoothingEnabled=false;
    if(q>=1){
      // Same authored pixels, same scale and final pose; only the chair anchor changed.
      g.translate(CLINIC.seat.x,CLINIC.seat.y);g.scale(-unit,unit);
      g.drawImage(this.lira[0].canvas,-finalHip[0],-finalHip[1]);
    }else{
      const step=Math.round(smooth((q-.1)/.9)*48);
      this.sitFrames ||= new Map();
      if(!this.sitFrames.has(step))this.sitFrames.set(step,this.sitFrame(step/48));
      g.drawImage(this.sitFrames.get(step),planted.x-80,planted.y-130);
    }
    g.restore();
  }
  sitFrame(t) {
    // Register the two APPROVED poses at the soles. Articulated bands follow
    // common head/torso/knee landmarks before blending, avoiding a whole-sprite
    // swap, a sliding body or a scale jump. Assets and the final pose stay intact.
    const c=Object.assign(document.createElement("canvas"),{width:160,height:160});
    const g=c.getContext("2d");g.imageSmoothingEnabled=false;
    const rows=[
      [[0,550],[140,550],[380,550],[580,530],[680,450],[740,430],[846,this.soles[0].x],[887,this.soles[0].x]],
      [[0,340],[62,340],[300,340],[530,350],[620,330],[710,350],[848,this.soles[1].x],[887,this.soles[1].x]],
    ];
    const target=rows[0].map((p,i)=>[
      mix(rows[1][i][0]-this.soles[1].y,p[0]-this.soles[0].y,t),
      mix(rows[1][i][1]-this.soles[1].x,p[1]-this.soles[0].x,t),
    ]);
    g.translate(80,130);g.scale(-.11,.11);g.globalCompositeOperation="lighter";
    for(const index of [1,0]){
      g.globalAlpha=index?1-t:t;
      for(let i=0;i<rows[index].length-1;i++){
        const [y,x]=rows[index][i],[ny,nx]=rows[index][i+1];
        const [ty,tx]=target[i],[by,bx]=target[i+1];
        const sy=(by-ty)/(ny-y),shear=((bx-nx)-(tx-x))/(ny-y);
        g.save();g.transform(1,0,shear,sy,tx-x-shear*y,ty-sy*y);
        g.drawImage(this.lira[index].canvas,0,y,887,ny-y,0,y,887,ny-y);
        g.restore();
      }
    }
    return c;
  }
  sittingPlayer(g, state, hip, bend = 1, lean = 0, dir = "right") {
    const f = this.assets.frame(
        state.appearance.gender,
        dir,
        0,
        { ...state.appearance, bag: 0 },
        state.zlink,
      ),
      s = 84 / f.referenceHeight;
    g.save();
    g.imageSmoothingEnabled = false;
    g.translate(hip.x, hip.y);
    g.rotate(lean);
    g.drawImage(f.canvas, 0, 0, 192, 136, -96 * s, -136 * s, 192 * s, 136 * s);
    const angle = (-Math.PI / 2) * bend;
    g.save();
    g.rotate(angle);
    g.drawImage(f.canvas, 64, 136, 64, 20, -32 * s, 0, 64 * s, 20 * s);
    g.restore();
    const kneeX = -Math.sin(angle) * 20 * s,
      kneeY = Math.cos(angle) * 20 * s;
    g.drawImage(
      f.canvas,
      64,
      156,
      64,
      24,
      kneeX - 32 * s,
      kneeY,
      64 * s,
      24 * s,
    );
    g.restore();
  }
  patient(g, state) {
    const q = state.story.bedPose ?? 1,
      p = bedPhase(q),
      r = p.recline;
    if (q < 0.3) {
      this.sittingPlayer(
        g,
        state,
        { x: mix(CLINIC.playerApproach[0], CLINIC.sideHip[0], p.sit), y: mix(CLINIC.playerApproach[1]-21.24, CLINIC.sideHip[1], p.sit) },
        p.sit,
      );
    } else if (q < 0.72) {
      const t = smooth((q - 0.3) / 0.42);
      this.sittingPlayer(
        g,
        state,
        {
          x: mix(CLINIC.sideHip[0], CLINIC.playerRest[0], t),
          y: mix(CLINIC.sideHip[1], CLINIC.playerRest[1] - (44 * 84) / 174, t),
        },
        1,
        -Math.sin(t * Math.PI) * 0.12,
        t < 0.78 ? "right" : "down",
      );
    } else {
      const f = this.patientFrame(state),
        s = 84 / f.referenceHeight;
      const [x, y] = CLINIC.playerRest;
      g.save();
      g.imageSmoothingEnabled = false;
      g.drawImage(
        f.canvas,
        Math.round(x - f.anchor * s),
        Math.round(y - f.baseline * s),
        Math.round(192 * s),
        Math.round(192 * s),
      );
      g.restore();
    }
  }
  patientFrame(state) {
    const base = this.assets.frame(
      state.appearance.gender,
      "down",
      0,
      { ...state.appearance, bag: 0 },
      state.zlink,
    );
    const key = "bed-rest:" + JSON.stringify([state.appearance,!!state.story.eyesClosed]);
    if (this.assets.frames.has(key)) return this.assets.frames.get(key);
    const c = Object.assign(document.createElement("canvas"), {
        width: 192,
        height: 192,
      }),
      g = c.getContext("2d");
    g.drawImage(relaxedHumanFrame(base.canvas), 0, 0);
    // Close only the authored eye pixels using cheek colour. Landmarks differ
    // for original and alternate heads, so the mask follows their actual face.
    const eyeY = 74;
    const pixels = g.getImageData(0, 0, 192, 192).data;
    for (const x of state.story.eyesClosed ? [84, 108] : []) {
      const k = ((eyeY + 10) * 192 + x) * 4;
      g.fillStyle = `rgb(${pixels[k]},${pixels[k + 1]},${pixels[k + 2]})`;
      g.fillRect(x - 5, eyeY - 5, 11, 12);
      g.strokeStyle = "#553a33";
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(x - 4, eyeY + 1);
      g.quadraticCurveTo(x, eyeY + 4, x + 4, eyeY + 1);
      g.stroke();
    }
    const f = { ...base, canvas: c };
    this.assets.frames.set(key, f);
    return f;
  }
}
