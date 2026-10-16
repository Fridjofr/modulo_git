import {setDoorProgress} from "../src/doors.js";
import {MAPS,mapStand} from "../src/maps.js";
import { FOREST_POINTS } from "../src/world.js";
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  ELEMENTS,
  ELEMENT_TABLE,
  STARTERS,
  newGame,
  canLinkHere,
  validateSave,
  movePlayer,
  canStand,
  createBattle,
  createContainment,
  WALKABLE,
  resolveMove,
  chooseEnemyAction,
  tickStatus,
  grantVictory,
} from "../src/model.js";

test("tabela completa: 64 confrontos; Cristal tem apenas as cinco vantagens ofensivas propostas", () => {
  assert.equal(ELEMENTS.length, 8);
  for (const a of ELEMENTS)
    for (const d of ELEMENTS)
      assert.ok([0.75, 1, 1.25, 1.5].includes(ELEMENT_TABLE[a][d]));
  for (const basic of ["Água", "Fogo", "Terra", "Planta", "Elétrico"]) {
    assert.equal(ELEMENT_TABLE.Cristal[basic], 1.25);
    assert.equal(ELEMENT_TABLE[basic].Cristal, 1);
  }
  for (const e of ["Luz", "Sombra", "Cristal"])
    assert.equal(ELEMENT_TABLE.Cristal[e], 1);
  assert.equal(ELEMENT_TABLE.Fogo.Planta, 1.5);
  assert.equal(ELEMENT_TABLE.Água.Fogo, 1.5);
  assert.equal(ELEMENT_TABLE.Planta.Água, 1.5);
});
test("novo explorador começa sem dispositivo, forma ou progressão; aparência fica isolada", () => {
  const a = newGame(),
    b = newGame();
  a.appearance.hair = 3;
  assert.equal(b.appearance.hair, 0);
  assert.equal(a.zlink, false);
  assert.equal(a.starter, null);
  assert.equal(a.quest, "awakening");
  assert.equal(a.world, "forest");
  assert.equal(a.story.freeLink, false);
  assert.equal(a.zimondex, false);
  assert.equal(a.transformed, false);
});
test("cinco elementos básicos têm duas vantagens e duas resistências, com confrontos recíprocos", () => {
  const basics = ELEMENTS.slice(0, 5);
  for (const a of basics) {
    const values = basics
      .filter((d) => d !== a)
      .map((d) => ELEMENT_TABLE[a][d]);
    assert.equal(values.filter((n) => n === 1.5).length, 2);
    assert.equal(values.filter((n) => n === 0.75).length, 2);
    for (const d of basics)
      if (ELEMENT_TABLE[a][d] === 1.5) assert.equal(ELEMENT_TABLE[d][a], 0.75);
  }
});
test("save round-trip preserva todos os detalhes e rejeita estados inválidos", () => {
  const state = newGame(
    { gender: "male", hair: 3, bag: 2, style: 2 },
    "<Alex>",
  );
  state.quest = "crisis";
  state.world = "lab";
  state.x = 640;
  state.y = 480;
  state.zlink = true;
  state.starter = "plant";
  state.transformed = true;
  state.forms = Object.fromEntries(
    Object.keys(STARTERS).map((k) => [k, { level: 5, xp: 0 }]),
  );
  const copy = validateSave(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(copy, state);
  for (const invalid of [
    null,
    {},
    { ...state, version: 1 },
    { ...state, starter: "unknown" },
    { ...state, zlink: false },
    { ...state, starter: "constructor" },
    { ...state, quest: "constructor" },
    { ...state, starter: ["fire"] },
    { ...state, quest: ["awakening"] },
    { ...state, x: NaN },
    { ...state, appearance: { ...state.appearance, hair: 99 } },
    { ...state, appearance: { ...state.appearance, gender: "other" } },
  ])
    assert.equal(validateSave(invalid), null);
});
test("save fora da área navegável é recuperado em posição segura", () => {
  const state = newGame();
  state.x = -200;
  const restored = validateSave(state);
  assert.equal(restored.x, FOREST_POINTS.spawn.x);
  assert.ok(canStand("forest", restored.x, restored.y));
});
test("colisões não permitem cruzar água, paredes, bancadas ou limites, mesmo com um frame longo", () => {
  const s = newGame();
  s.world = "plaza";
  s.x = 590;
  s.y = 580;
  for (let i = 0; i < 100; i++) movePlayer(s, "left", 1);
  assert.ok(s.x >= 354 && s.x < 360);
  assert.ok(canStand(s.world, s.x, s.y));
  s.world = "lab";
  s.x = 640;
  s.y = 460;
  for (let i = 0; i < 100; i++) movePlayer(s, "up", 1);
  assert.ok(s.y >= 326);
  assert.ok(s.y < 330);
  s.x = 870;
  s.y = 580;
  for (let i = 0; i < 100; i++) movePlayer(s, "down", 1);
  assert.ok(s.y <= 615 && s.y > 612);
});
test("cada direção move apenas um eixo e usa a animação correspondente", () => {
  for (const dir of ["up", "down", "left", "right"]) {
    const s = newGame();
    s.world = "plaza";
    s.x = 640;
    s.y = 550;
    assert.ok(movePlayer(s, dir, 0.04));
    assert.equal(s.dir, dir);
    assert.equal(
      ["up", "down"].includes(dir) ? s.x : s.y,
      ["up", "down"].includes(dir) ? 640 : 550,
    );
  }
});
test("humano não pode usar técnicas; energia insuficiente não consome recursos ou vida", () => {
  const b = createBattle("fire");
  assert.ok(resolveMove(b, "player", "skill").error);
  assert.equal(b.opponent.hp, b.opponent.maxHP);
  resolveMove(b, "player", "transform");
  b.player.energy = 0;
  assert.ok(resolveMove(b, "player", "special").error);
  assert.equal(b.player.energy, 0);
});
test("Defender foi removido; ataque físico recupera energia sem ultrapassar 60", () => {
  const b = createBattle("water", true);
  b.player.energy = 56;
  const before = structuredClone(b);
  assert.ok(resolveMove(b, "player", "guard").error);
  assert.deepEqual(b, before);
  assert.ok(resolveMove(b, "player", "attack").damage);
  assert.equal(b.player.energy, 60);
});
test("as três técnicas especiais aplicam seus efeitos e respeitam a duração", () => {
  for (const [key, info] of Object.entries(STARTERS)) {
    const b = createBattle(key, true, { level: 8, enemyLevel: 8, hp: 132 });
    b.player.hp -= 20;
    resolveMove(b, "player", "special");
    assert.equal(b.opponent.status.type, info.effect);
    assert.equal(b.player.energy, b.player.maxEnergy - 30);
    const before = b.opponent.hp;
    tickStatus(b.opponent);
    assert.equal(b.opponent.status.turns, 1);
    tickStatus(b.opponent);
    assert.equal(b.opponent.status, null);
    if (key !== "water") assert.ok(b.opponent.hp < before);
    if (key === "plant") assert.equal(b.player.hp, b.player.maxHP - 8);
  }
});
for (const key of Object.keys(STARTERS))
  test(`${STARTERS[key].name}: treinamento vencível alternando técnicas e recuperação física`, () => {
    const b = createBattle(key, true, { level: 8, enemyLevel: 8, hp: 132 });
    resolveMove(b, "opponent", "transform");
    for (
      let turn = 0;
      turn < 30 && b.player.hp > 0 && b.opponent.hp > 0;
      turn++
    ) {
      const action =
        b.player.energy >= 30
          ? "special"
          : b.player.energy >= 14
            ? "skill"
            : "attack";
      resolveMove(b, "player", action);
      tickStatus(b.opponent);
      if (b.opponent.hp <= 0) break;
      resolveMove(b, "opponent", chooseEnemyAction(b));
      tickStatus(b.player);
      b.turn++;
    }
    assert.equal(b.opponent.hp, 0);
    assert.ok(b.player.hp > 0);
  });
test("recompensa não se repete; desafios concluídos não concedem EXP adicional", () => {
  const s = newGame();
  s.quest = "battle";
  s.starter = "fire";
  s.forms.fire = { level: 5, xp: 0 };
  assert.equal(grantVictory(s), true);
  assert.equal(s.level, 6);
  assert.equal(s.xp, 80);
  assert.equal(s.inventory.tonic, 5);
  assert.equal(grantVictory(s), false);
  assert.equal(s.xp, 80);
  assert.equal(s.inventory.tonic, 5);
  assert.equal(s.victories, 1);
});
test("metadados corrigidos usam a identidade real e quatro frames por direção", async () => {
  const meta = JSON.parse(
    await readFile(new URL("../assets/sprites.json", import.meta.url)),
  );
  assert.equal(meta.male.file, "assets/characters/layers/male-base.png");
  assert.equal(meta.lira.file, "assets/characters/layers/lira-base.png");
  for (const k of ["male", "female", "lira"])
    for (const d of ["up", "down", "left", "right"])
      assert.equal(meta[k].directions[d].length, 4);
  for (const key of ["male", "female", "lira"]) {
    assert.equal(meta[key].referenceHeight, 174);
    assert.equal(meta[key].baseline, 180);
    for (const anchors of Object.values(meta[key].anchors))
      assert.deepEqual(anchors, [96, 96, 96, 96]);
  }
  for (const key of ["male", "female"])
    for (const region of ["hair", "skin", "top", "bottom", "accent"]) {
      assert.ok(meta[key].materialPixels[region] > 1000);
      assert.ok(meta[key].layers[region].includes(region));
    }
  assert.ok(meta.water.directions.up[0][1] > 310);
});

test("nível 5 oferece física e elemental; especial exige nível 8 sem consumir recurso quando bloqueada", () => {
  const b = createBattle("fire", true);
  assert.ok(resolveMove(b, "player", "skill").damage);
  for (const action of ["special"]) {
    const before = structuredClone(b);
    assert.ok(resolveMove(b, "player", action).error);
    assert.deepEqual(b, before);
  }
  b.player.level = 6;
  assert.ok(resolveMove(b, "player", "skill").damage);
  assert.ok(resolveMove(b, "player", "special").error);
  b.player.level = 8;
  assert.ok(resolveMove(b, "player", "special").damage);
});
test("Troca conserva a proporção de HP, energia e status, sem cura por alternância", async () => {
  const { switchBattleForm } = await import("../src/model.js");
  const s = newGame();
  s.starter = "fire";
  s.forms = {
    fire: { level: 5, xp: 0 },
    water: { level: 5, xp: 0 },
    plant: { level: 5, xp: 0 },
  };
  const b = createBattle("fire", true);
  b.player.hp = 31;
  b.player.energy = 18;
  b.player.status = { type: "burn", turns: 2 };
  const before = structuredClone(b);
  assert.ok(switchBattleForm(s, b, "unknown").error);
  assert.deepEqual(b, before);
  switchBattleForm(s, b, "water");
  assert.equal(b.player.energy, 18);
  assert.equal(b.player.hp, Math.floor((31 / 106) * 116));
  assert.deepEqual(b.player.status, { type: "burn", turns: 2 });
  switchBattleForm(s, b, "fire");
  assert.ok(b.player.hp <= 31);
  assert.equal(s.level, 5);
  assert.equal(b.player.transformed, true);
});
test("EXP por forma aprende golpes progressivamente e preserva os demais níveis", async () => {
  const { addFormXP } = await import("../src/model.js");
  const s = newGame();
  s.starter = "plant";
  s.forms = {
    plant: { level: 5, xp: 0 },
    water: { level: 5, xp: 0 },
    fire: { level: 5, xp: 0 },
  };
  assert.deepEqual(addFormXP(s, 79), []);
  assert.equal(s.level, 5);
  assert.deepEqual(addFormXP(s, 1), []);
  assert.equal(s.forms.plant.level, 6);
  assert.deepEqual(addFormXP(s, 250), ["special"]);
  assert.equal(s.forms.plant.level, 8);
  assert.equal(s.forms.water.level, 5);
  assert.equal(s.forms.fire.xp, 0);
});
test("validação não libera almas não conquistadas nem aceita o progresso antigo como novo prólogo", () => {
  const s = newGame();
  Object.assign(s, {
    zlink: true,
    starter: "water",
    quest: "complete",
    world: "lab",
    x: 640,
    y: 480,
    forms: { water: { level: 5, xp: 0 } },
  });
  const copy = validateSave(s);
  assert.deepEqual(Object.keys(copy.forms), ["water"]);
  assert.equal(validateSave({ ...s, version: 2 }), null);
});
test("duelo com aluno dá EXP sem pular missão e não repete tônicos extras", () => {
  const s = newGame();
  s.starter = "fire";
  s.forms.fire = { level: 5, xp: 0 };
  s.quest = "complete";
  const b = createBattle("fire", true, {
    id: "nico",
    name: "Nico",
    world: "plaza",
  });
  assert.equal(grantVictory(s, b), true);
  assert.deepEqual(s.duelWins, ["nico"]);
  assert.equal(s.quest, "complete");
  assert.equal(s.level, 6);
  assert.equal(s.inventory.tonic, 5);
  assert.equal(grantVictory(s, b), false);
  assert.equal(s.inventory.tonic, 5);
  assert.equal(s.xp, 80);
});

for (const starter of Object.keys(STARTERS))
  test(`contenção de ${starter}: protagonista perde sob controle do jogador, Lira manifesta somente os braços`, () => {
    const s = newGame();
    s.starter = starter;
    s.forms = { [starter]: { level: 5, xp: 0 } };
    const before = structuredClone(s);
    const b = createContainment(s);
    assert.equal(b.storyBattle, true);
    assert.equal(b.mandatory, true);
    assert.equal(b.playerName, s.name);
    assert.equal(b.opponentName, "Lira");
    assert.equal(b.opponent.partial, true);
    assert.equal(b.opponent.transformed, false);
    assert.equal(b.enemy, "plant", "Lira mantém o vínculo com Verdrax nos três iniciais");
    for (let i = 0; i < 12 && b.player.hp > 0; i++) {
      resolveMove(b, "player", b.player.energy >= 14 ? "skill" : "attack");
      if (b.opponent.hp > 0) resolveMove(b, "opponent", chooseEnemyAction(b));
      b.turn++;
    }
    assert.equal(b.player.hp, 0);
    assert.ok(b.opponent.hp > 0);
    assert.deepEqual(s, before);
  });

test('cada porta e interação dos mapas é acessível sem atravessar os objetos desenhados',()=>{
 for(const [world,m] of Object.entries(MAPS)){
  const start=m.exits[0],queue=[[Math.round(start.x/10)*10,Math.round(start.y/10)*10]],seen=new Set([queue[0].join()]);
  assert.ok(canStand(world,...queue[0]),world+' entrada');
  for(let i=0;i<queue.length;i++)for(const [dx,dy] of [[10,0],[-10,0],[0,10],[0,-10]]){const n=[queue[i][0]+dx,queue[i][1]+dy],k=n.join();if(!seen.has(k)&&canStand(world,...n)){seen.add(k);queue.push(n);}}
  for(const goal of [...m.exits,...m.objects.filter(o=>o.id)])assert.ok(queue.some(([x,y])=>Math.hypot(x-goal.x,y-goal.y)<(goal.type===undefined?64:75)),`${world}: ${goal.id}`);
  for(const o of m.objects.filter(o=>o.solid)){const [x,y,w,h]=o.solid;assert.equal(mapStand(world,x+w/2,y+h/2),false,world+' '+o.type);}
 }
 assert.equal(canStand('missing',0,0),false);
});
test('Sincro exige Lira presente no mesmo local e nunca libera o exterior',()=>{
 const s=newGame();s.starter='fire';s.zlink=true;s.world='lab';s.quest='choose';s.story.lira={world:'lab',visible:true,moving:false};assert.equal(canLinkHere(s),false);
 s.quest='practice';assert.equal(canLinkHere(s),true);s.story.lira.visible=false;assert.equal(canLinkHere(s),false);
 s.story.flags.trainingComplete=true;s.quest='complete';s.world='gym';s.story.lira={world:'gym',visible:true,moving:false};assert.equal(canLinkHere(s),true);
 s.story.lira.world='lab';assert.equal(canLinkHere(s),false);s.story.lira.world='gym';s.story.lira.moving=true;assert.equal(canLinkHere(s),false);s.story.lira.moving=false;
 for(const world of ['forest','road','plaza','corridor','clinic','dorm','gardens']){s.world=world;assert.equal(canLinkHere(s),false);}
 s.zlink=false;s.world='gym';assert.equal(canLinkHere(s),false);
});
test('exibições repetíveis concedem EXP novamente sem duplicar o bônus da primeira vitória',()=>{
 const s=newGame();s.quest='complete';s.starter='fire';s.forms.fire={level:5,xp:0};const b=createBattle('fire',true,{id:'nico',name:'Nico',repeatable:true});
 assert.equal(grantVictory(s,b),true);const first=s.xp,tonics=s.inventory.tonic;s.challenges.nico={result:'win'};
 assert.equal(grantVictory(s,b),false);assert.ok(s.xp>first);assert.equal(s.lastReward.xp,25);assert.equal(s.inventory.tonic,tonics);
});
test("Lira tenta contato e não revida no primeiro turno da contenção",()=>{
 const s=newGame();s.starter="fire";const b=createContainment(s),hp=b.player.hp,energy=b.opponent.energy;
 assert.equal(chooseEnemyAction(b),"hold");const result=resolveMove(b,"opponent","hold");assert.equal(result.hold,true);assert.equal(b.player.hp,hp);assert.equal(b.opponent.energy,energy);
 b.turn=2;assert.notEqual(chooseEnemyAction(b),"hold");assert.equal(resolveMove(b,"opponent","hold").error,"Ação inválida.");
});
test("a plataforma permanece livre e as bancadas e os aparelhos desenhados têm colisão",()=>{
 for(const [x,y] of [[640,380],[400,490],[900,490],[640,626],[180,490],[1080,490]])assert.equal(canStand("lab",x,y),true);
 for(const [x,y] of [[200,220],[640,240],[1050,240],[640,300],[1070,300]])assert.equal(canStand("lab",x,y),false);
});

test('união do piso e da soleira não cria uma parede invisível nos corredores das portas',()=>{
 for(const world of ['gym'])for(let y=575;y<=680;y++)assert.ok(canStand(world,640,y),world+' '+y);
 for(const world of ['corridor','lab','clinic']){
  const map=MAPS[world];
  for(const d of map.doorSpecs){
   assert.equal(canStand(world,d.x+d.w/2,d.y+d.h/2),false,world+' porta fechada');
   setDoorProgress(world,d.id,1);
   const x=map.exits.find(e=>e.id===d.id).x;
   const start=d.upper?d.y+12:d.y-20,end=d.upper?242:d.y+d.h+12;
   for(let y=start;y<=end;y++)assert.ok(canStand(world,x,y),world+' '+d.id+' '+y);
   setDoorProgress(world,d.id,0);
  }
 }
 assert.equal(MAPS.forest.exits[0].to,'plaza');assert.equal('road' in MAPS,false);
});
test('MP máximo cresce com o nível sem ser truncado na recuperação física',()=>{
 const b=createBattle('fire',true,{level:8});assert.equal(b.player.maxEnergy,66);b.player.energy=64;resolveMove(b,'player','attack');assert.equal(b.player.energy,66);
});
