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
