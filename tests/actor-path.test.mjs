import {test} from 'node:test';import assert from 'node:assert/strict';
import {sceneRoute,actorCanStand,ACTOR_SEPARATION,clearSegment} from '../src/actor-path.js';
import {mapStand,MAPS} from '../src/maps.js';import {stageUpdate} from '../src/scene-staging.js';
test('caminhada de cena contorna um personagem parado sem sobrepor os pés nem cortar uma bancada',()=>{
 const actor={world:'lab',x:640,y:480},other={world:'lab',x:750,y:480,visible:true};
 const route=sceneRoute('lab',actor,[[900,480]],[other]);let x=actor.x,y=actor.y;
 for(const [tx,ty] of route){let steps=0;while(Math.abs(x-tx)+Math.abs(y-ty)>.01){if(++steps>2000)throw Error('Rota não terminou');if(Math.abs(tx-x)>.01)x+=Math.sign(tx-x)*Math.min(1,Math.abs(tx-x));else y+=Math.sign(ty-y)*Math.min(1,Math.abs(ty-y));assert.ok(mapStand('lab',x,y,11));assert.ok(Math.hypot(x-other.x,y-other.y)>=ACTOR_SEPARATION);}}
 assert.equal(x,900);assert.equal(y,480);
 assert.equal(actorCanStand('lab',750,480,actor,[other]),false);
});
test('possessão no mapa mantém Lira fora da trajetória do avanço e dentro do piso acessível',()=>{
 const s={x:640,y:500,story:{lira:{x:868,y:369},flags:{}}};
 for(let i=0;i<=1000;i++){stageUpdate(s,{kind:'rampage',start:0,duration:1000},i);assert.ok(Math.hypot(s.x-s.story.lira.x,s.y-s.story.lira.y)>=ACTOR_SEPARATION,`sobreposição em ${i}`);assert.ok(mapStand('lab',s.x,s.y,11),`protagonista no sólido em ${i}`);assert.ok(mapStand('lab',s.story.lira.x,s.story.lira.y,11),`Lira no sólido em ${i}`);}
 assert.ok(s.story.flags.labDamaged);assert.ok(s.story.flags.labSecondDamage);
});

test('Lira deixa o alojamento contornando o protagonista que ouviu a apresentação',()=>{
 const lira={world:'dorm',x:530,y:440},player={world:'dorm',x:640,y:440,visible:true};
 const route=sceneRoute('dorm',lira,[[530,500],[640,500],[640,640]],[player]);let {x,y}=lira;
 for(const [tx,ty] of route){while(Math.abs(tx-x)+Math.abs(ty-y)>.01){if(Math.abs(tx-x)>.01)x+=Math.sign(tx-x)*Math.min(1,Math.abs(tx-x));else y+=Math.sign(ty-y)*Math.min(1,Math.abs(ty-y));assert.ok(actorCanStand('dorm',x,y,lira,[player]));}}
 assert.equal(y,640);
});

test('Lira alcança a saída física de cada etapa da escolta sem atravessar o protagonista',()=>{
 for(const [world,start,goal,player] of [['forest',[1400,480],[1430,430],[1360,525]],['plaza',[768,260],[768,174],[768,330]],['corridor',[652,750],[242,215],[652,790]]]){
  const actor={world,x:start[0],y:start[1]},other={world,x:player[0],y:player[1],visible:true},route=sceneRoute(world,actor,[goal],[other]);let {x,y}=actor;
  for(const [tx,ty] of route){while(Math.abs(tx-x)+Math.abs(ty-y)>.01){if(Math.abs(tx-x)>.01)x+=Math.sign(tx-x)*Math.min(1,Math.abs(tx-x));else y+=Math.sign(ty-y)*Math.min(1,Math.abs(ty-y));assert.ok(actorCanStand(world,x,y,actor,[other]),world+' '+x+','+y);}}
  assert.equal(x,goal[0]);assert.equal(y,goal[1]);
 }
});

test('a soleira física de todas as portas admite os pés do personagem antes da transição',()=>{
 for(const [world,map] of Object.entries(MAPS))for(const exit of map.exits)assert.ok(mapStand(world,exit.x,exit.y,11),world+': '+exit.id);
 const player={world:'lab',x:560,y:560,visible:true},lira={world:'lab',x:868,y:369};
 assert.ok(sceneRoute('lab',lira,[[868,480],[640,480],[640,626]],[player]).length>0);
});
test('replanejamento aceita a distância válida da física, sem faixa morta entre 32 e 35 pixels',()=>{
 const actor={world:'clinic',x:421.2,y:336},other={world:'clinic',x:438,y:308,visible:true};
 assert.ok(actorCanStand('clinic',actor.x,actor.y,actor,[other]));
 const route=sceneRoute('clinic',actor,[[640,674]],[other]);let from=[actor.x,actor.y];
 for(const p of route){assert.ok(clearSegment((x,y)=>actorCanStand('clinic',x,y,actor,[other]),from,p));from=p;}
 assert.deepEqual(from,[640,674]);
});
test('a escolta sai da enfermaria sem impasse entre Lira e o protagonista',async(t)=>{
 globalThis.document={hidden:false};t.after(()=>delete globalThis.document);
 const {OpeningStory}=await import('../src/story.js');
 const s={world:'clinic',quest:'medical',x:438,y:263,story:{flags:{},lira:{world:'clinic',x:248,y:303,visible:true}}};
 const story=new OpeningStory({state:()=>s,actors:()=>[s,s.story.lira],stage:async()=>{}});story.active=true;
 let done=false,failure;
 const task=story.guideExit(MAPS.clinic.exits[0]).then(()=>done=true,e=>{failure=e;done=true;});
 for(let n=0;n<1200&&!done;n++){
  story.update(1/60);
  if(s.story.lira.visible)assert.ok(Math.hypot(s.x-s.story.lira.x,s.y-s.story.lira.y)>=ACTOR_SEPARATION-1e-6);
  for(let k=0;k<3;k++)await Promise.resolve();
 }
 assert.ok(done,JSON.stringify({player:[s.x,s.y],lira:[s.story.lira.x,s.story.lira.y],motion:story.motion?.points}));
 await task;if(failure)throw failure;
 assert.equal(s.story.lira.visible,false);
 assert.deepEqual([s.story.lira.x,s.story.lira.y],[640,674]);
});
