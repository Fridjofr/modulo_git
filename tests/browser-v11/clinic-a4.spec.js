import {test,expect} from '@playwright/test';
test('a parede sobre a porta oculta o personagem sem cobrir a passagem aberta',async({page})=>{
 await page.goto('/?debug=1');await expect(page.locator('#title')).toHaveClass(/active/);
 const result=await page.evaluate(async()=>{
  const {Assets}=await import('/src/assets.js'),{MAPS}=await import('/src/maps.js');
  const {resetDoorStates,setDoorProgress}=await import('/src/doors.js');
  const a=new Assets();await a.load();const map=MAPS.corridor,d=map.doorSpecs[0];
  const c=Object.assign(document.createElement('canvas'),{width:map.size[0],height:map.size[1]}),g=c.getContext('2d');
  resetDoorStates();for(const spec of map.doorSpecs)setDoorProgress('corridor',spec.id,1);
  // A visible silhouette would leak above the lintel without the foreground.
  g.fillStyle='#ff0000';g.fillRect(d.x,0,d.w,d.y+d.h);
  a.tiles.doorForeground(g,{world:'corridor'});
  const actual=g.getImageData(d.x,0,d.w,d.y).data;
  const expected=a.tiles.terrain('corridor').getContext('2d').getImageData(d.x,0,d.w,d.y).data;
  const aperture=[...g.getImageData(d.x+d.w/2,d.y+d.h/2,1,1).data];
  resetDoorStates();return {wallPreserved:actual.every((v,i)=>v===expected[i]),aperture};
 });
 expect(result.wallPreserved).toBe(true);expect(result.aperture).toEqual([255,0,0,255]);
});
test('nova enfermaria mantém a pose original de Lira e o fundo intacto, sem lençol extra',async({page})=>{
 await page.goto('/?debug=1');await expect(page.locator('#title')).toHaveClass(/active/);
 const result=await page.evaluate(async()=>{
  const {Assets}=await import('/src/assets.js'),{CLINIC}=await import('/src/clinic-layout.js');
  const a=new Assets();await a.load();const make=()=>Object.assign(document.createElement('canvas'),{width:768,height:579});
  const actual=make(),expected=make(),g=expected.getContext('2d');
  a.clinic.seatedLira(actual.getContext('2d'),1);
  g.save();g.imageSmoothingEnabled=false;g.translate(CLINIC.seat.x,CLINIC.seat.y);g.scale(-.11,.11);g.drawImage(a.clinic.lira[0].canvas,-580,-670);g.restore();
  const p=actual.getContext('2d').getImageData(0,0,768,579).data,q=g.getImageData(0,0,768,579).data;
  const terrain=a.tiles.terrain('clinic'),before=terrain.toDataURL();
  for(const progress of [0,.15,.5,.8,1])a.clinic.seatedLira(make().getContext('2d'),progress);
  return {samePose:p.every((v,i)=>v===q[i]),sameBackground:before===terrain.toDataURL(),extraPropsLoaded:!!a.images.clinicProps};
 });
 expect(result).toEqual({samePose:true,sameBackground:true,extraPropsLoaded:false});
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
