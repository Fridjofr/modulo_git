import {test,expect} from '@playwright/test';
test('câmera mantém a escala entre os seis ambientes; repouso vem da nova base oficial',async({page})=>{
 await page.goto('/?debug=1');await expect(page.locator('#title')).toHaveClass(/active/);
 const result=await page.evaluate(async()=>{
  const {Assets}=await import('/src/assets.js'),{Renderer}=await import('/src/render.js'),{newGame,DEFAULT_APPEARANCE:D}=await import('/src/model.js');
  const {CLINIC}=await import('/src/clinic-layout.js');
  const a=new Assets();await a.load();const r=new Renderer(a),c=Object.assign(document.createElement('canvas'),{width:1280,height:720});
  c.getBoundingClientRect=()=>({width:1280,height:720});r.world=c.getContext('2d');r.labels=document.createElement('div');
  const zooms={};for(const world of ['forest','plaza','corridor','clinic','lab','gym']){
   const s=newGame();s.world=world;s.quest='complete';r.drawWorld(s,1000,0,null,false);zooms[world]=r.camera.zoom;
  }
  const problems=[];
  for(const gender of ['female','male']) {
   const s=newGame({...D,gender});s.world='clinic';s.story.eyesClosed=true;
   const base=a.frame(gender,'down',0,s.appearance),f=a.clinic.patientFrame(s);
   if(!f.official||f.source!==base.source)problems.push(gender+': repouso usa corpo antigo');
   const p=f.canvas.getContext('2d').getImageData(0,0,192,192).data;
   const scale=84/f.referenceHeight,top=CLINIC.playerRest[1]-f.baseline*scale;
   for(let y=0;y<192;y++)for(let x=0;x<192;x++)if(p[(y*192+x)*4+3]){
    const wx=CLINIC.playerRest[0]+(x-f.anchor)*scale,wy=top+y*scale;
    if(wx<CLINIC.mattress.x||wx>CLINIC.mattress.x+CLINIC.mattress.w||wy<CLINIC.mattress.y-1||wy>CLINIC.mattress.y+CLINIC.mattress.h)problems.push(gender+': repouso fora do colchão');
   }
  }
  return {zooms,problems:[...new Set(problems)]};
 });expect(result).toEqual({zooms:{forest:1,plaza:1,corridor:1,clinic:1,lab:1,gym:1},problems:[]});
});
