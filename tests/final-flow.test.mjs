import {test} from 'node:test';import assert from 'node:assert/strict';
import {OpeningStory,openingState} from '../src/story.js';import {MAPS,mapStand} from '../src/maps.js';
import {worldNpcs,resetNpcs,updateNpcs} from '../src/npcs.js';
import {ACTOR_SEPARATION} from '../src/actor-path.js';
test('pular uma caminhada acelera a rota sem teleportar nem desligar as colisões',async(t)=>{
 globalThis.document={hidden:false};t.after(()=>delete globalThis.document);
 const state={world:'lab',x:400,y:500,story:openingState()};
 const story=new OpeningStory({state:()=>state,actors:()=>[state]});story.active=true;
 const walking=story.walk(state,[[800,500]],150);story.skipWalk();
 assert.deepEqual([state.x,state.y],[400,500]);assert.ok(story.motion);
 story.update(1/60);assert.ok(state.x>400&&state.x<=405);assert.ok(mapStand('lab',state.x,state.y,11));
 for(let frame=0;frame<500&&story.motion;frame++)story.update(1/60);
 await walking;assert.deepEqual([state.x,state.y],[800,500]);
});
test('a calibração apresenta as três essências uma única vez',async()=>{
 const state={world:'lab',x:640,y:500,story:openingState()},stages=[];
 const story=new OpeningStory({state:()=>state,stage:async kind=>stages.push(kind),choose:()=>stages.push('choose')});
 story.play=(_,fn)=>fn();story.walk=async()=>{};story.scene=async()=>{};
 await story.calibrate();assert.deepEqual(stages,['calibration','choose']);assert.equal(state.story.flags.calibrated,true);
});
test('reversão da crise ocorre no laboratório antes de repetir o sonho dos pais',async()=>{
 const state={world:'lab',starter:'water',transformed:true,zlink:true,story:{...openingState(),lira:{world:'lab',x:802,y:425,partial:true}}};
 const events=[];const story=new OpeningStory({state:()=>state,talk:async()=>{},transform:async to=>{events.push([state.world,state.transformed,state.story.down,to]);state.transformed=to;},stage:async()=>{},maxHP:()=>132});
 story.play=(_,fn)=>fn();story.scene=async id=>{if(id===8)events.push(['dream',state.story.dream]);};story.leaveDoor=async()=>{};story.setQuest=q=>state.quest=q;
 story.location=async(world)=>{state.world=world;};story.api.transition=async(_,fn)=>fn();
 await story.recovered();assert.deepEqual(events,[['lab',true,true,false],['dream','parents']]);assert.equal(state.quest,'recalibrate');
});
test('Nina/Caio entram e saem por rotas físicas; sussurro e duelos ficam fora dos espectadores',async(t)=>{
 resetNpcs();globalThis.document={hidden:false};t.after(()=>{delete globalThis.document;resetNpcs();});
 const s={world:'gym',x:1015,y:600,story:{...openingState(),lira:{world:'gym',x:1105,y:600,visible:true}}},stages=[];
 const npcs=()=>worldNpcs('gym');const actors=()=>[s,s.story.lira,...npcs()];
 const story=new OpeningStory({state:()=>s,npcs,actors,refresh:()=>{},stage:async kind=>{stages.push(kind);assert.deepEqual(npcs().filter(n=>['nina','caio'].includes(n.id)).map(n=>[n.x,n.y]),[[400,465],[875,350]]);}});
 story.active=true;let whisper=false;
 story.scene=async(id,from)=>{if(id===14&&from===10){assert.equal(s.story.whisper,true);assert.ok(Math.hypot(s.x-1105,s.y-600)<35);whisper=true;}};
 async function run(action){let done=false,error;const task=action.then(()=>done=true,e=>{error=e;done=true;});for(let frame=0;frame<10000&&!done;frame++){
  story.update(1/60);updateNpcs(s,1/60,null,true,null,story.motion?.actor);
  const walking=story.motion?.actor;if(walking)assert.ok(mapStand('gym',walking.x,walking.y,11));
  const a=actors();for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)assert.ok(Math.hypot(a[i].x-a[j].x,a[i].y-a[j].y)>=ACTOR_SEPARATION-1e-5,'sobreposição');
  for(let n=0;n<4;n++)await Promise.resolve();
 }assert.ok(done,'encenação não terminou');await task;if(error)throw error;}
 await run(story.studentsScene());assert.deepEqual(stages,['exhibition']);assert.equal(whisper,true);assert.equal(s.quest,'challenge');
 const nico=npcs().find(n=>n.id==='nico');await run(story.arenaEntry(nico));assert.deepEqual([s.x,s.y,nico.x,nico.y],[400,465,875,350]);
 await run(story.arenaExit());assert.deepEqual([s.x,s.y,nico.x,nico.y],[1015,600,1105,500]);
 assert.ok(npcs().every(n=>n.x<250||n.x>1000));
});
