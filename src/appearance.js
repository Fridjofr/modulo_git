import { PALETTES } from "./model.js";

export const HAIRSTYLES = ["Original", "Curto", "Longo", "Coques duplos", "Rabo alto"];
export const OUTFITS = ["Exploração", "Jaqueta", "Uniforme", "Moletom", "Campo"];
export const LEGWEAR = ["Original", "Calça", "Calça cargo"];

// Additional pieces use the same 192px anchor as the authored material layers.
// They are composited for each direction/frame; the face and walking legs stay intact.
export function drawHairBack(ctx, direction, a, frame) {
  if (a.style < 2) return;
  const color = PALETTES.hair[a.hair];
  const sway = [0, -2, 0, 2][frame % 4];
  const side = direction === "left" ? 1 : direction === "right" ? -1 : 0;
  ctx.save();
  const g = ctx.createLinearGradient(55, 0, 125, 0);
  g.addColorStop(0, "#211c31"); g.addColorStop(.15, color); g.addColorStop(.85, color); g.addColorStop(1, "#292336");
  ctx.fillStyle = g; ctx.strokeStyle = "#201d2b"; ctx.lineWidth = 2;
  const shape = points => { const left=Math.min(...points.map(p=>p[0])),right=Math.max(...points.map(p=>p[0]));const shade=ctx.createLinearGradient(left,0,right,0);shade.addColorStop(0,"#272030");shade.addColorStop(.22,color);shade.addColorStop(.72,color);shade.addColorStop(1,"#342639");ctx.fillStyle=shade;ctx.beginPath(); points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.closePath(); ctx.fill(); ctx.stroke(); };
  if (a.style === 2) {
    const x = side ? 96+side*42 : 130;
    const extend = side || 1;
    shape([[x-9,22],[x+8,17],[x+extend*24,30],[x+extend*31+sway,64],[x+extend*26+sway,105],[x+extend*10+sway,126],[x+extend*14,75],[x-9,44]]);
    ctx.strokeStyle = color; ctx.beginPath();ctx.moveTo(x+7,38);ctx.lineTo(x+12+sway,92);ctx.stroke();
  } else if (a.style === 3) {
    for (const sign of [-1,1]) {
      if (side && sign !== side) continue;
      const x = 96+sign*48;
      shape([[x-11,25],[x-3,17],[x+9,18],[x+16,28],[x+14,43],[x+2,48],[x-11,40]]);
      ctx.save();ctx.strokeStyle=color;ctx.beginPath();ctx.arc(x+1,32,8,.3,4.8);ctx.stroke();ctx.restore();
    }
  } else {
    for (const sign of [-1,1]) {
      if (side && sign !== side) continue;
      const x = 96+sign*47;
      for(let i=0;i<10;i++) {
        const bx=x+(i%2?3:-3)+sway*i/10, y=68+i*7;
        shape([[bx-5,y-5],[bx+4,y-6],[bx+8,y],[bx+2,y+7],[bx-6,y+4]]);
      }
      ctx.fillStyle=PALETTES.accent[a.accent];ctx.fillRect(x-4+sway,136,8,4);ctx.fillStyle=g;
    }
  }
  ctx.restore();
}

export function drawClothing(ctx, a, direction, frame, layers) {
  if (!a.outfit && !a.legwear) return;
  const temporary = document.createElement("canvas");temporary.width=temporary.height=192;
  const c=temporary.getContext("2d");
  const fillMask = (source, y1, y2, color) => {
    c.clearRect(0,0,192,192);c.drawImage(source,0,0);
    c.globalCompositeOperation="source-in";
    const shade=c.createLinearGradient(60,y1,115,y2);shade.addColorStop(0,color);shade.addColorStop(1,"#25364c");
    c.fillStyle=shade;c.fillRect(0,0,192,192);c.globalCompositeOperation="source-over";
    ctx.save();ctx.beginPath();ctx.rect(0,y1,192,y2-y1);ctx.clip();ctx.drawImage(temporary,0,0);ctx.restore();
  };
  if(a.legwear) {
    fillMask(layers.skin,138,174,PALETTES.bottom[a.bottom]);
    fillMask(layers.bottom,132,174,PALETTES.bottom[a.bottom]);
  }
  if([1,3,4].includes(a.outfit)) {
    fillMask(layers.skin,94,124,PALETTES.top[a.top]);
    fillMask(layers.top,94,136,PALETTES.top[a.top]);
  }
  ctx.save();ctx.lineWidth=2;ctx.strokeStyle="#172737";
  const color=PALETTES.top[a.top],accent=PALETTES.accent[a.accent];
  const side=["left","right"].includes(direction), center=96;
  const panel=(x,y,w,h,fill)=>{ctx.fillStyle="#182b38";ctx.fillRect(x-1,y-1,w+2,h+2);ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);};
  if(a.outfit===4) {
    const half=side?17:27;
    ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(center-half+4,125);ctx.lineTo(center+half-4,125);ctx.lineTo(center+half,153);ctx.lineTo(center+4,155);ctx.lineTo(center,141);ctx.lineTo(center-4,155);ctx.lineTo(center-half,153);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=accent;ctx.fillRect(center-half+2,149,half-7,2);ctx.fillRect(center+5,149,half-7,2);
  }
  if(a.outfit===2) {
    if(side) {panel(center-8,100,16,31,color);panel(center-6,111,12,10,"#29444d");}
    else {for(const sign of [-1,1]){const x=center+sign*14-6;panel(x,98,12,35,color);panel(x+2,111,8,10,"#29444d");}}
    ctx.fillStyle=accent;ctx.fillRect(center-4,125,8,3);
  } else if(a.outfit) {
    if(direction!=="up") {
      ctx.strokeStyle="#172737";ctx.beginPath();ctx.moveTo(center,98);ctx.lineTo(center,135);ctx.stroke();
      ctx.fillStyle=accent;ctx.fillRect(center-1,104,2,28);
      if(a.outfit===1 || a.outfit===4){ctx.beginPath();ctx.moveTo(center-13,97);ctx.lineTo(center-5,108);ctx.lineTo(center,99);ctx.lineTo(center+5,108);ctx.lineTo(center+13,97);ctx.stroke();}
    } else {ctx.fillStyle=accent;ctx.fillRect(center-9,108,18,3);}
    if(a.outfit===3) {
      ctx.strokeStyle="#15313d";ctx.lineWidth=4;ctx.beginPath();ctx.arc(center,94,side?16:22,0,Math.PI);ctx.stroke();
      ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(center-6,100);ctx.lineTo(center-6,113);ctx.moveTo(center+6,100);ctx.lineTo(center+6,113);ctx.stroke();
      panel(center-11,121,22,9,color);
    }
  }
  if(a.legwear===2) {
    const shift=[0,2,-1,-2][frame%4];
    panel(center-14+shift,140,8,11,PALETTES.bottom[a.bottom]);
    if(!side)panel(center+6-shift,140,8,11,PALETTES.bottom[a.bottom]);
    ctx.fillStyle=accent;ctx.fillRect(center-12+shift,141,4,2);
  }
  ctx.restore();
}
