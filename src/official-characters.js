// The only protagonist bodies used at runtime: authored frames from the approved
// replacement sheet. Unsupported looks never fall back to an older anatomy.
export const OFFICIAL_CHARACTERS = ['lira', 'female', 'male'];
export const OFFICIAL_DIRECTIONS = ['down', 'up', 'left', 'right'];
export const CHARACTER_SCALE = Object.freeze({ height: 84, radius: 11, separation: 32 });
export class OfficialCharacters {
  constructor(images) { this.images=images; this.cache=new Map(); }
  frame(key, direction='down', index=0, appearance=null, zlink=false) {
    const row=OFFICIAL_DIRECTIONS.indexOf(direction);
    if(row<0 || !OFFICIAL_CHARACTERS.includes(key))throw Error('Quadro oficial inválido: '+key+'/'+direction);
    const col=((Math.trunc(index)%4)+4)%4, id=[key,direction,col,!!zlink].join(':');
    if(this.cache.has(id))return this.cache.get(id);
    const canvas=Object.assign(document.createElement('canvas'),{width:192,height:192});
    const g=canvas.getContext('2d');g.imageSmoothingEnabled=false;
    g.drawImage(this.images['official:'+key],col*192,row*192,192,192,0,0,192,192);
    // One small wearable, anchored to the new wrist. No bag/body/head overlays.
    if(zlink && key!=='lira' && direction!=='up') {
      const wrist = key==='female' ? {down:[76,133],left:[95,132],right:[85,130]}
                                  : {down:[74,134],left:[111,136],right:[79,136]};
      const [x,y]=wrist[direction];
      g.fillStyle='#142e4a';g.fillRect(x-3,y-2,7,5);
      g.fillStyle='#d8b55e';g.fillRect(x-2,y-1,5,3);
      g.fillStyle='#55edff';g.fillRect(x-1,y-1,3,2);
    }
    const result={canvas,w:192,h:192,anchor:96,baseline:180,referenceHeight:174,
      official:true,anatomy:{hip:140,knee:160,eyes:key==='female'?[[85,84],[107,84]]:[[87,83],[110,83]]},
      source:'assets/characters/official/'+key+'.png',sourceFrame:col};
    this.cache.set(id,result);return result;
  }
}
