import {extractSprite} from './character-atlas.js';
const IDS=['nico','nina','caio','mara','aya','iris'],DIRS=['down','left','right','up'];
const make=()=>Object.assign(document.createElement('canvas'),{width:192,height:192});
export class NpcAtlas{
 constructor(image){this.cache=new Map();this.frames={};
  for(let col=0;col<IDS.length;col++)this.frames[IDS[col]]=DIRS.map((dir,row)=>{
   const rows=[0,286,546,800,1024],f=extractSprite(image,[col*256,rows[row],256,rows[row+1]-rows[row]]),c=make(),g=c.getContext('2d'),scale=174/(f.b-f.t+1),w=(f.r-f.l+1)*scale;g.imageSmoothingEnabled=false;
   g.drawImage(f.canvas,f.l,f.t,f.r-f.l+1,f.b-f.t+1,96-w/2,6,w,174);return c;
  });
 }
 frame(key,dir,index=0){
  const id=key.replace('npc:',''),signature=[id,dir,index].join(':');if(this.cache.has(signature))return this.cache.get(signature);
  const source=this.frames[id][DIRS.indexOf(dir)],c=make(),g=c.getContext('2d'),stride=[0,1,0,-1][index%4];g.imageSmoothingEnabled=false;
  if(['left','right'].includes(dir)){g.save();g.translate(96,145);g.rotate(stride*.12);g.drawImage(source,0,145,192,47,-96,0,192,47);g.restore();}
  else for(let side=0;side<2;side++){const x=side?103:89;g.save();g.translate(x,145);g.rotate(stride*(side?1:-1)*.11);g.drawImage(source,side*96,145,96,47,side*96-x,0,96,47);g.restore();}
  g.drawImage(source,0,0,192,149,0,stride?-1:0,192,149);
  const frame={canvas:c,w:192,h:192,anchor:96,baseline:180,referenceHeight:174};this.cache.set(signature,frame);return frame;
 }
}
