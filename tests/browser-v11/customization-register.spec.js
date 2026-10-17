import {test,expect} from '@playwright/test';
test('48 quadros oficiais: fonte exclusiva, transparência, pés constantes e quatro poses autorais',async({page})=>{
 await page.goto('/?debug=1');await expect(page.locator('#title')).toHaveClass(/active/);
 const result=await page.evaluate(async()=>{
  const {Assets}=await import('/src/assets.js'),{DEFAULT_APPEARANCE:D}=await import('/src/model.js');
  const a=new Assets();await a.load();const errors=[];
  const bytes=c=>c.getContext('2d').getImageData(0,0,192,192).data;
  const same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
  for(const key of ['male','female','lira'])for(const [row,dir] of ['down','up','left','right'].entries()){
   const hashes=new Set(),heights=[];
   for(let phase=0;phase<4;phase++){
    const f=a.frame(key,dir,a.walkIndex(key,dir,phase),{...D,gender:key}),p=bytes(f.canvas);
    const c=Object.assign(document.createElement('canvas'),{width:192,height:192});
    c.getContext('2d').drawImage(a.images['official:'+key],phase*192,row*192,192,192,0,0,192,192);
    if(!same(p,bytes(c)))errors.push(key+'/'+dir+'/'+phase+': pixels trocados');
    let top=192,bottom=-1;for(let y=0;y<192;y++)for(let x=0;x<192;x++)if(p[(y*192+x)*4+3]){top=Math.min(top,y);bottom=Math.max(bottom,y);}
    if(bottom!==179||top<2||p[3]!==0)errors.push(key+'/'+dir+': recorte/base inválida '+top+'/'+bottom);
    heights.push(bottom-top);hashes.add(f.canvas.toDataURL());
    if(f.anchor!==96||f.baseline!==180||f.referenceHeight!==174)errors.push('âncora divergente');
    const unsupported=bytes(a.frame(key,dir,phase,{...D,gender:key,style:4,outfit:4,skin:3,hair:3,bag:2}).canvas);
    if(!same(p,unsupported))errors.push('aparência antiga vazou para '+key);
   }
   if(hashes.size<3)errors.push(key+'/'+dir+': quadros não distintos');
   if(Math.max(...heights)-Math.min(...heights)>9)errors.push(key+'/'+dir+': salto de escala');
  }
  const plain=bytes(a.frame('female','down',0,D,false).canvas),linked=bytes(a.frame('female','down',0,D,true).canvas);
  let changed=0;for(let i=0;i<plain.length;i+=4)if(!same(plain.slice(i,i+4),linked.slice(i,i+4)))changed++;
  if(changed<3||changed>40)errors.push('relógio alterou anatomia: '+changed);
  return {errors,legacyLoaded:Object.keys(a.images).filter(k=>/^(male|female|lira)(:|-|$)/.test(k))};
 });expect(result).toEqual({errors:[],legacyLoaded:[]});
});
