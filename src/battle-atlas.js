import { contactCentre } from "./battle-contacts.js";
// Production battle atlases: six independently authored poses per actor.
// Originals stay unchanged; transparent margins are normalized once at loading.
export const BATTLE_POSES = ['ready','anticipation','leap','elemental','recovery','hurt'];
// Iris bounds are authored in each 512px cell; they never tint fur, leaves or FX.
const eyeShapes={
 fire:[[[380,300,13,16],[435,300,9,14]],[[386,435,13,15],[441,435,7,12]],[[402,316,13,16],[439,315,7,12]],[[359,216,13,16],[413,220,8,12]],[[397,343,13,15],[449,345,7,11]],[[285,194,17,14],[335,174,7,12]]],
 water:[[[354,345,13,17],[420,343,7,12]],[[354,405,11,15],[423,405,6,11]],[[405,327,12,17],[462,330,5,9]],[[333,226,12,15],[383,216,6,10]],[[419,342,11,14],[470,349,5,8]],[[366,196,12,15],[415,215,5,9]]],
 plant:[[[352,295,13,13],[405,293,7,11]],[[377,355,12,15]],[[425,292,12,14]],[[373,175,15,17]],[[454,304,11,13]],[[320,151,14,15]]],
};
function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function irisMask(key,data,index){
 const mask=canvas(512,512),ctx=mask.getContext('2d'),out=ctx.createImageData(512,512);
 for(const [cx,cy,rx,ry] of eyeShapes[key][index]){
  for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++){
   if(((x-cx)/rx)**2+((y-cy)/ry)**2>1)continue;
   const o=(y*512+x)*4,r=data[o],g=data[o+1],b=data[o+2];if(data[o+3]<230)continue;
   const iris=key==='fire'?r>140&&g>55&&g<225&&b<100:key==='water'?b>120&&r<110&&g<205:g>75&&g>r*1.05&&g>b*1.12&&r<190;
   if(!iris)continue;
   out.data[o]=255;out.data[o+1]=22;out.data[o+2]=48;out.data[o+3]=255;
  }
 }
 ctx.putImageData(out,0,0);return mask;
}
function removeStrays(bytes){
 const seen=new Uint8Array(512*512),groups=[];
 for(let first=0;first<512*512;first++){
  if(seen[first]||bytes[first*4+3]<225)continue;
  const queue=[first];seen[first]=1;let left=512,right=0,top=512,bottom=0;
  for(let n=0;n<queue.length;n++){
   const i=queue[n],x=i%512,y=Math.floor(i/512);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
   for(const j of [i-1,i+1,i-512,i+512]){const jx=j%512,jy=Math.floor(j/512);if(j<0||j>=512*512||Math.abs(jx-x)>1||Math.abs(jy-y)>1||seen[j]||bytes[j*4+3]<225)continue;seen[j]=1;queue.push(j);}
  }
  groups.push({pixels:queue,left,right,top,bottom});
 }
 groups.sort((a,b)=>b.pixels.length-a.pixels.length);
 const main=groups[0];
 for(const group of groups.slice(1)){
  const dx=Math.max(0,main.left-group.right,group.left-main.right),dy=Math.max(0,main.top-group.bottom,group.top-main.bottom);
  if(group.pixels.length>=20&&Math.hypot(dx,dy)<18)continue;
  for(const i of group.pixels)bytes[i*4+3]=0;
 }
}
export class BattleAtlas {
 constructor(images){
  this.actors={};this.lastDraws={};
  for(const key of ['fire','water','plant','lira']){
   const image=images['battle:'+key];if(!image)throw new Error(`Atlas de ${key} ausente.`);
   if(image.width!==1536||image.height!==1024)throw new Error(`Dimensões do atlas de ${key} inválidas.`);
   const frames=[];
   for(let index=0;index<6;index++){
    const c=canvas(512,512),ctx=c.getContext('2d');ctx.drawImage(image,(index%3)*512,Math.floor(index/3)*512,512,512,0,0,512,512);
    const pixels=ctx.getImageData(0,0,512,512),bytes=pixels.data;
    removeStrays(bytes);
    let left=512,right=0,top=512,bottom=0,count=0;
    for(let i=0;i<512*512;i++){
     const o=i*4;
     if(bytes[o+3]<225){bytes[o+3]=0;continue;}
     bytes[o+3]=255;const x=i%512,y=Math.floor(i/512);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);count++;
    }
    if(count<2500)throw new Error(`Pose vazia: ${key}/${index}.`);
    ctx.putImageData(pixels,0,0);
    const red=key==='lira'?null:irisMask(key,bytes,index);
    const mass=[];
    for(let y=Math.round(top+(bottom-top)*.62);y<Math.round(top+(bottom-top)*.88);y++)for(let x=left;x<=right;x++)if(bytes[(y*512+x)*4+3])mass.push(x);
    mass.sort((a,b)=>a-b);
    const anchor=mass[Math.floor(mass.length/2)] || (left+right)/2;
    frames.push({canvas:c,red,left,right,top,bottom,anchor,baseline:bottom,opaque:count});
   }
   const contact=contactCentre(key);
   if(contact){
    const dx=contact.x-frames[0].anchor,dy=contact.y-frames[0].baseline;
    for(const f of frames){f.anchor+=dx;f.baseline+=dy;}
   }
   this.actors[key]={frames,referenceHeight:frames[0].bottom-frames[0].top+1,contact};
  }
 }
 draw(ctx,key,pose,x,y,height,{flip=false,possessed=false,alpha=1,flash=0}={}){
  this.lastDraws[key]={pose:pose%6,possessed,height};
  const actor=this.actors[key],f=actor.frames[pose%6],scale=height/actor.referenceHeight;
  ctx.save();ctx.translate(x,y);if(flip)ctx.scale(-1,1);ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=false;
  ctx.drawImage(f.canvas,-f.anchor*scale,-f.baseline*scale,512*scale,512*scale);
  if(possessed&&f.red){ctx.shadowColor='#ff183b';ctx.shadowBlur=3;ctx.drawImage(f.red,-f.anchor*scale,-f.baseline*scale,512*scale,512*scale);ctx.shadowBlur=0;}
  if(flash){ctx.globalAlpha*=flash*.3;ctx.globalCompositeOperation='lighter';ctx.drawImage(f.canvas,-f.anchor*scale,-f.baseline*scale,512*scale,512*scale);}
  ctx.restore();
 }
 point(key,pose,height,point,flip=false){const a=this.actors[key],f=a.frames[pose%6],s=height/a.referenceHeight;return {x:(point[0]-f.anchor)*s*(flip?-1:1),y:(point[1]-f.baseline)*s};}
 reach(key,pose,height){const a=this.actors[key],f=a.frames[pose%6];return (key==='lira'?f.anchor-f.left:f.right-f.anchor)*height/a.referenceHeight;}
 stats(){return {mode:'sprite-atlases',webgl:false,poses:6,actors:Object.keys(this.actors),lastDraws:this.lastDraws};}
}
