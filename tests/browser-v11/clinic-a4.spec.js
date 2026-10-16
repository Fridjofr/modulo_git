import {test,expect} from '@playwright/test';
test('pose final aprovada de Lira é idêntica e o lençol fica somente no colchão',async({page})=>{
 await page.goto('/?debug=1');await expect(page.locator('#title')).toHaveClass(/active/);
 const errors=await page.evaluate(async()=>{
  const {Assets}=await import('/src/assets.js'),{CLINIC}=await import('/src/clinic-layout.js');
  const a=new Assets();await a.load();const make=()=>Object.assign(document.createElement('canvas'),{width:1280,height:720});
  const actual=make(),expected=make(),g=expected.getContext('2d'),errors=[];
  a.clinic.seatedLira(actual.getContext('2d'),1);
  g.save();g.imageSmoothingEnabled=false;g.translate(212,283);g.scale(-.11,.11);g.drawImage(a.clinic.lira[0].canvas,-580,-670);g.restore();a.clinic.chairForeground(g);
  const p=actual.getContext('2d').getImageData(0,0,1280,720).data,q=g.getImageData(0,0,1280,720).data;
  if(p.some((v,n)=>v!==q[n]))errors.push('Pose final aprovada foi alterada');
  for(const progress of [0,.15,.5,.8,1]){
   const c=make();a.clinic.blanketLayer(c.getContext('2d'),{story:{bedPose:progress}});
   const d=c.getContext('2d').getImageData(0,0,1280,720).data,m=CLINIC.mattress;let count=0;
   for(let y=0;y<720;y++)for(let x=0;x<1280;x++)if(d[(y*1280+x)*4+3]){count++;if(x<m.x||x>=m.x+m.w||y<m.y||y>=m.y+m.h)errors.push('Lençol fora do colchão');}
   if(count<1000)errors.push('Lençol desapareceu');
  }
  return [...new Set(errors)];
 });expect(errors).toEqual([]);
});
test('os três Zimons usam o centro de apoio das patas, com retorno ao mesmo ponto',async({page})=>{
 await page.goto('/?debug=1');await expect(page.locator('#title')).toHaveClass(/active/);
 const errors=await page.evaluate(async()=>{
  const {Assets}=await import('/src/assets.js'),{contactCentre}=await import('/src/battle-contacts.js'),{battlePose,BATTLE_MARKS}=await import('/src/battle-sprites.js');
  const a=new Assets();await a.load();const errors=[];
  for(const key of ['fire','water','plant']){
   const contact=contactCentre(key),f=a.battle.actors[key].frames[0];
   if(f.anchor!==contact.x||f.baseline!==contact.y)errors.push(key+': origem não corresponde ao apoio');
   for(const flip of [false,true]){const p=a.battle.point(key,0,165,[contact.x,contact.y],flip);if(Math.abs(p.x)>1e-6||Math.abs(p.y)>1e-6)errors.push(key+': contato deslocado');}
   const b={player:{transformed:true},opponent:{transformed:true},contactGap:{player:100,opponent:100}};
   const fx={kind:'strike',side:'player',target:'opponent',action:'attack',delivery:'melee',start:0,duration:2000};
   const pose=battlePose('player',b,fx,2000,false);
   if(pose.x!==BATTLE_MARKS.player.x||pose.ground!==BATTLE_MARKS.player.y)errors.push(key+': não retornou à posição');
  }
  return errors;
 });expect(errors).toEqual([]);
});
