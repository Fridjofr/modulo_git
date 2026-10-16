import {test} from 'node:test';
import assert from 'node:assert/strict';
import {battlePose,battleForm,BATTLE_MARKS,CONTACT} from '../src/battle-sprites.js';
import {newGame,createContainment} from '../src/model.js';
test('animação física se aproxima na diagonal, atinge no contato e retorna à âncora',()=>{
 const s=newGame();s.starter='fire';const b=createContainment(s);
 const fx={kind:'strike',side:'player',target:'opponent',action:'attack',start:0,duration:2000};
 const home=battlePose('player',b,fx,0), hit=battlePose('player',b,fx,2000*CONTACT), end=battlePose('player',b,fx,2000);
 assert.equal(home.x,BATTLE_MARKS.player.x);assert.ok(hit.x>home.x+300);assert.ok(hit.y<home.y-30);
 assert.equal(end.x,home.x);assert.equal(end.y,home.y);
 const before=battlePose('opponent',b,fx,2000*(CONTACT-.01));assert.equal(before.flash,0);
 assert.ok(battlePose('opponent',b,fx,1600).flash>0);
});
test('nocaute aguarda o impacto visível e redução de movimento preserva o contato necessário ao ataque',()=>{
 const s=newGame();s.starter='plant';const b=createContainment(s);b.player.hp=0;b.displayHP={player:22};
 assert.equal(battlePose('player',b,null,0).alpha,1);
 b.displayHP=null;assert.equal(battlePose('player',b,null,0).alpha,1);
 const fx={kind:'strike',side:'player',action:'attack',start:0,duration:2000};
 assert.ok(battlePose('player',b,fx,1300,true).x>BATTLE_MARKS.player.x+350);
});
test('forma muda sob o casulo, respeita humanos já transformados e Lira parcial',()=>{
 const s=newGame();s.starter='water';const b=createContainment(s);
 const fx={kind:'transform',side:'both',to:true,start:0,duration:7800,already:{opponent:true}};
 assert.equal(battleForm(b,'player',fx,1000),false);assert.equal(battleForm(b,'player',fx,6000),true);
 assert.equal(battleForm(b,'opponent',fx,6000),false);
});
