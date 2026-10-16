import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {MAPS,mapStand} from '../src/maps.js';
import {updateDoors,doorProgress,setDoorProgress,resetDoorStates,crossingPoint} from '../src/doors.js';
import {sceneRoute,clearSegment} from '../src/actor-path.js';
test('os dois PNGs finais são preservados byte a byte e conservam a proporção',async()=>{
 for(const [file,hash] of [
  ['ZIMONS_Laboratorio_Base_Final_Aprovada.png','c14bf12983d4c969462bec1a34674f37d0bff91fc175fc754423cbcbc38951c9'],
  ['ZIMONS_Salao_Academia_Base_Final_Aprovada.png','cacb83aec53ec32f711ffeac8039c3baa7a27ed57f9b344f2754aaf26fc785b1']]){
  const bytes=await readFile(new URL('../assets/world/approved-final/'+file,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),hash);
  const map=file.includes('Salao')?MAPS.corridor:MAPS.lab;
  assert.ok(Math.abs(map.size[1]-map.size[0]*bytes.readUInt32BE(20)/bytes.readUInt32BE(16))<.5);
 }
});
test('porta superior esquerda fecha inicialmente, bloqueia os pés e só abre na aproximação autorizada',()=>{
 resetDoorStates();
 const m=MAPS.corridor,d=m.doorSpecs[0],s={world:'corridor',quest:'complete',x:650,y:500,story:{lira:{visible:false},flags:{}}};
 updateDoors(m,s,1);assert.equal(doorProgress(m.id,d.id),0);
 assert.equal(mapStand(m.id,242,150),false);
 s.x=242;s.y=245;
 for(let i=0;i<20;i++)updateDoors(m,s,.016);
 assert.ok(doorProgress(m.id,d.id)>0&&doorProgress(m.id,d.id)<.96);assert.equal(mapStand(m.id,242,150),false);
 for(let i=0;i<30;i++)updateDoors(m,s,.016);
 assert.equal(doorProgress(m.id,d.id),1);assert.equal(mapStand(m.id,242,150),true);
 const path=sceneRoute(m.id,s,[crossingPoint(m,m.exits[0])]);let from=[s.x,s.y];
 for(const p of path){assert.ok(clearSegment((x,y)=>mapStand(m.id,x,y,11),from,p));from=p;}
 s.x=650;s.y=500;for(let i=0;i<40;i++)updateDoors(m,s,.016);
 assert.equal(doorProgress(m.id,d.id),0);assert.equal(mapStand(m.id,242,150),false);
 // Restricted sectors remain closed when the protagonist approaches them.
 s.quest='entrance';s.x=551;s.y=235;
 for(let i=0;i<40;i++)updateDoors(m,s,.016);
 assert.equal(doorProgress(m.id,'corridor-lab'),0);
 resetDoorStates();
});
test('travessia livre aciona a transição física sem exigir E dentro da parede',async()=>{
 const {OpeningStory}=await import('../src/story.js');
 const state={world:'corridor',quest:'complete',x:242,y:190,story:{flags:{},lira:{world:'gym',visible:false}}};
 const used=[];const story=new OpeningStory({state:()=>state,travel:e=>used.push(e.id)});
 resetDoorStates();story.checkTriggers();assert.deepEqual(used,[]);
 setDoorProgress('corridor','corridor-clinic',1);story.checkTriggers();assert.deepEqual(used,['corridor-clinic']);
 resetDoorStates();
});
test('a aproximação já fica no eixo antes da zona da porta, sem correção lateral final',async()=>{
 const {doorPath,doorApproach,approachingDoor}=await import('../src/doors.js');
 for(const world of ['corridor','lab']){
  const map=MAPS[world];
  for(const exit of map.exits){
   const d=map.doorSpecs.find(d=>d.id===exit.id),actor={x:world==='corridor'?650:850,y:500};
   const a=doorApproach(map,exit),goals=doorPath(map,actor,exit);
   assert.equal(a.x,exit.x);assert.ok(Math.abs(a.y-exit.y)>100);
   const route=sceneRoute(world,actor,goals);let from=[actor.x,actor.y];
   for(const point of route){
    assert.ok(clearSegment((x,y)=>mapStand(world,x,y,11),from,point));
    const steps=Math.ceil(Math.hypot(point[0]-from[0],point[1]-from[1]));
    for(let n=0;n<=steps;n++){
     const x=from[0]+(point[0]-from[0])*(n/Math.max(steps,1)),y=from[1]+(point[1]-from[1])*(n/Math.max(steps,1));
     if(Math.abs(y-exit.y)<100)assert.equal(x,exit.x,world+' '+exit.id+' alinhamento tardio');
    }from=point;
   }
   assert.equal(approachingDoor(map,exit,{x:exit.x+15,y:exit.y+(d.upper?40:-40)}),false);
   assert.equal(approachingDoor(map,exit,{x:exit.x,y:exit.y+(d.upper?40:-40)}),true);
  }
 }
 resetDoorStates();
});
test('a porta não fecha sobre um ocupante que deixa o eixo; chegada ao salão fica fora das folhas',()=>{
 resetDoorStates();const m=MAPS.corridor,e=m.exits.find(e=>e.id==='corridor-plaza');
 const s={world:'corridor',quest:'entrance',x:644.5,y:790,story:{flags:{},lira:{visible:false}}};
 setDoorProgress(m.id,e.id,1);
 for(let n=0;n<60;n++)updateDoors(m,s,1/60);
 assert.equal(doorProgress(m.id,e.id),1);assert.ok(mapStand(m.id,s.x,s.y,11));
 s.y=750;
 for(let n=0;n<60;n++)updateDoors(m,s,1/60);
 assert.equal(doorProgress(m.id,e.id),0);
 const arrival=MAPS.plaza.exits.find(e=>e.to==='corridor');
 assert.ok(mapStand('corridor',arrival.tx,arrival.ty,11),'chegada não depende de porta aberta');
 resetDoorStates();
});
test('no piso livre, Lira alinha com a porta antes de subir, sem desvio da grade no fim',async()=>{
 const {doorPath}=await import('../src/doors.js');const m=MAPS.corridor,e=m.exits[0];
 const actor={world:'corridor',x:652,y:720},other={world:'corridor',x:652,y:760,visible:true};
 const route=sceneRoute(m.id,actor,doorPath(m,actor,e),[other]);
 assert.deepEqual(route[0],[e.x,actor.y]);
 assert.ok(route.slice(1).every(p=>p[0]===e.x));
 assert.deepEqual(route.at(-1),[e.x,e.y]);
});
test('ao sair de outra sala, a rota entra no corredor antes de alinhar com a próxima porta',async()=>{
 const {doorPath}=await import('../src/doors.js');const m=MAPS.corridor,e=m.exits.find(e=>e.to==='lab');
 const goals=doorPath(m,{x:290,y:285},e);
 assert.deepEqual(goals,[[290,335],[e.x,335],[e.x,e.y]]);
});
