import { extractSprite } from "./character-atlas.js";
import { CLINIC, bedPhase, mix, smooth } from "./clinic-layout.js";

export class ClinicRenderer {
  constructor(assets) {
    this.assets = assets;
    const image = assets.images.clinicProps;
    this.bed = extractSprite(image, [0, 0, 835, 550]);
    this.blanket = extractSprite(image, [835, 0, image.width - 835, 550]);
    this.chair = extractSprite(image, [0, 550, 835, image.height - 550]);
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
  prop(g, p, r) {
    g.imageSmoothingEnabled = false;
    g.drawImage(
      p.canvas,
      p.l,
      p.t,
      p.r - p.l + 1,
      p.b - p.t + 1,
      Math.round(r.x),
      Math.round(r.y),
      r.w,
      r.h,
    );
  }
  furniture(g, state) {
    const q = state.story.bedPose;
    const opening =
      q === undefined ? 0 : smooth(q / 0.12) * (1 - smooth((q - 0.78) / 0.22));
    const gate = { x: CLINIC.bed.x + 100, y: CLINIC.bed.y + 50, w: 8, h: 77 };
    // The lateral safety rail telescopes down before the transfer. It is an
    // independent piece of the SAME bed, exposing the actual floor underneath.
    g.save();
    g.beginPath();
    g.rect(CLINIC.bed.x, CLINIC.bed.y, CLINIC.bed.w, CLINIC.bed.h);
    g.rect(gate.x, gate.y, gate.w, gate.h);
    g.clip("evenodd");
    this.prop(g, this.bed, CLINIC.bed);
    g.restore();
    const remaining = gate.h * (1 - opening);
    if (remaining > 0) {
      g.save();
      g.beginPath();
      g.rect(gate.x, gate.y + gate.h - remaining, gate.w, remaining);
      g.clip();
      this.prop(g, this.bed, CLINIC.bed);
      g.restore();
    }
    this.prop(g, this.chair, CLINIC.chair);
  }
  blanketLayer(g, state) {
    const p=state.story.bedPose;
    const lift=p===undefined?0:Math.sin(p*Math.PI)*2;
    const m=CLINIC.mattress;
    g.save();
    g.beginPath();
    g.moveTo(m.x,m.y);g.lineTo(m.x+m.w,m.y);
    g.lineTo(m.x+m.w-2,m.y+m.h);g.lineTo(m.x+1,m.y+m.h);
    g.closePath();g.clip();
    this.prop(g,this.blanket,{...CLINIC.blanket,y:CLINIC.blanket.y-lift});
    g.restore();
  }
  chairForeground(g) {
    // Reuse the exact near armrest from the same chair, with the same transform.
    // No separate approximate sprite and no painted patch of the floor.
    const r = CLINIC.chair;
    g.save();
    g.beginPath();
    // Clip the diagonal near arm only, not the seat through the thighs.
    for (const [i, point] of [[5,35],[16,33],[51,41],[51,50],[41,49],[5,42]].entries())
      g[i ? "lineTo" : "moveTo"](r.x + point[0], r.y + point[1]);
    g.closePath();
    g.clip();
    this.prop(g, this.chair, r);
    g.restore();
  }
  seatedLira(g, q) {
    const unit=0.11, finalHip=[580,670], sole=this.soles[0];
    // This is exactly the already approved final seated transform.
    const planted={
      x:CLINIC.seat.x+(finalHip[0]-sole.x)*unit,
      y:CLINIC.seat.y+(sole.y-finalHip[1])*unit,
    };
    if(q<0.38){
      const step=smooth((q-0.1)/0.28);
      const phase=q<0.1?0:Math.floor(step*4)%4;
      this.assets.draw(g,"lira","right",this.assets.walkIndex("lira","right",phase),
        mix(CLINIC.liraApproach[0],planted.x,step),
        mix(CLINIC.liraApproach[1],planted.y,step),84,null,false);
      return;
    }
    const index=q<0.72?1:0, f=this.lira[index], contact=this.soles[index];
    // The feet stay planted through both approved poses. No interpolation of
    // the hip's x coordinate, and no lateral slide when a pose is selected.
    g.save();g.imageSmoothingEnabled=false;
    if(index===0){
      // Preserve the approved final matrix bit for bit, including raster rounding.
      g.translate(CLINIC.seat.x,CLINIC.seat.y);g.scale(-unit,unit);
      g.drawImage(f.canvas,-finalHip[0],-finalHip[1]);
    }else{
      g.translate(planted.x,planted.y);g.scale(-unit,unit);
      g.drawImage(f.canvas,-contact.x,-contact.y);
    }
    g.restore();
    this.chairForeground(g);
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
        { x: mix(438, 405, p.sit), y: mix(241.76, 246, p.sit) },
        p.sit,
      );
    } else if (q < 0.72) {
      const t = smooth((q - 0.3) / 0.42);
      this.sittingPlayer(
        g,
        state,
        {
          x: mix(405, 360, t),
          y: mix(246, CLINIC.playerRest[1] - (44 * 84) / 174, t),
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
    if (!state.story.eyesClosed) return base;
    const key = "bed-closed:" + JSON.stringify(state.appearance);
    if (this.assets.frames.has(key)) return this.assets.frames.get(key);
    const c = Object.assign(document.createElement("canvas"), {
        width: 192,
        height: 192,
      }),
      g = c.getContext("2d");
    g.drawImage(base.canvas, 0, 0);
    // Close only the authored eye pixels using cheek colour. Landmarks differ
    // for original and alternate heads, so the mask follows their actual face.
    const eyeY = state.appearance.style ? 82 : 80;
    const pixels = g.getImageData(0, 0, 192, 192).data;
    for (const x of [83, 107]) {
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
