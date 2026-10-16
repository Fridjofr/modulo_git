import {test,expect} from '@playwright/test';
import {start,snap,drive,navigate,move,door,select,recover,practice} from './helpers.js';
const cases=[
 ['female','fire','Curto','Uniforme',false],
 ['male','fire','Original','Exploração',true],
 ['female','water','Longo','Campo',true],
 ['male','water','Rabo alto','Moletom',true],
 ['female','plant','Coques duplos','Jaqueta',true],
 ['male','plant','Curto','Uniforme',true],
];
test.use({reducedMotion:'no-preference'});
test.describe.configure({mode:'parallel'});
for(const [gender,starter,style,outfit,brief] of cases)test(`${gender}-${starter}: capítulo completo e ${gender==='female'?'vitória':'derrota'} no ginásio`,async({page},info)=>{
 test.setTimeout(600000);page.reviewScreenshots=false;
 const errors=[],dreams=[],observed={calibrations:0,labBeast:false,labHuman:false,whisper:false},seen=new Set();let lastDream=null,lastEffect=null;
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 page.effectObserver=async s=>{
  const dream=s.state?.story.dream||null;if(dream&&dream!==lastDream)dreams.push(dream);lastDream=dream;
  if(s.effect?.kind==='calibration'&&lastEffect!=='calibration')observed.calibrations++;lastEffect=s.effect?.kind;
  if(s.state?.world==='lab'&&s.state.story.down){if(s.state.transformed)observed.labBeast=true;else observed.labHuman=true;}
  if(s.state?.story.whisper)observed.whisper=true;
  if(s.state?.story.resting&&s.state.world==='clinic')seen.add('clinic');
 };
 const shot=async n=>page.screenshot({path:info.outputPath(n+'.png')});
 await start(page,{gender,brief,style,outfit});
 const appearance=(await snap(page)).state.appearance;
 await move(page,'y',600);await move(page,'x',1160);await move(page,'y',500);await move(page,'x',1420);
 await drive(page,s=>s.state.quest==='entrance');await navigate(page,768,270);
 await drive(page,s=>s.state.quest==='choose',180000);console.log(gender,starter,'LAB');
 await select(page,starter);let s=await snap(page);
 expect(Object.keys(s.state.forms)).toEqual([starter]);expect(s.battle.storyBattle).toBe(true);expect(s.battle.opponent.partial).toBe(true);
 expect(s.battle.mandatory).toBe(true);expect(observed.calibrations).toBe(1);
 await shot('batalha-laboratorio');
 for(const expected of [2,3,1]){await page.keyboard.press('v');expect((await snap(page)).settings.battleSpeed).toBe(expected);}
 await duel(page,'containment');
 s=await snap(page);expect(s.battle.result).toBe('loss');expect(s.battle.fallen).toBe(true);expect(s.battle.player.transformed).toBe(true);
 await recover(page);console.log(gender,starter,'RECOVERED');
 expect(observed.labBeast).toBe(true);expect(observed.labHuman).toBe(true);expect(dreams).toEqual(['parents','parents']);expect(seen.has('clinic')).toBe(true);
 expect((await snap(page)).state.dir).toBe('down');
 await practice(page);s=await snap(page);console.log(gender,starter,'GYM');
 expect(s.state.world).toBe('gym');expect(s.state.quest).toBe('challenge');expect(observed.whisper).toBe(true);
 expect(s.actors.filter(a=>['nina','caio','nico'].includes(a.id)).every(a=>a.x<250||a.x>1000)).toBe(true);
 expect(s.state.appearance).toEqual(appearance);
 await page.locator('#dex-button').click();await expect(page.locator('#modal')).toBeVisible();await page.keyboard.press('Escape');
 await navigate(page,1070,520);await page.keyboard.press('e');await drive(page,s=>s.scene==='battle'&&s.battle.phase==='player');
 s=await snap(page);expect(s.state.x).toBe(400);expect(s.state.y).toBe(465);expect(s.actors.find(a=>a.id==='nico').x).toBe(875);
 await shot('batalha-ginasio');
 for(const viewport of [{width:1366,height:768},{width:1920,height:1080},{width:800,height:450}]){
  await page.setViewportSize(viewport);
  for(const tab of ['fight','bag','swap']){
   await page.locator(`[data-battle-tab="${tab}"]`).click();
   const shown=await page.locator('#home-panel,#fight-panel,#bag-panel,#swap-panel,#exit-panel').evaluateAll(ns=>ns.filter(n=>!n.hidden).map(n=>n.id));expect(shown).toEqual(['home-panel',tab+'-panel']);
   const overflow=await page.locator(`#${tab}-panel button:visible`).evaluateAll(ns=>ns.filter(n=>{const r=n.getBoundingClientRect();return r.left<0||r.right>innerWidth+1||r.top<0||r.bottom>innerHeight+1;}).map(n=>n.textContent));expect(overflow).toEqual([]);
  }
 }
 await page.setViewportSize({width:1366,height:768});
 await duel(page,gender==='female'?'win':'loss');
 s=await snap(page);expect(s.battle.result).toBe(gender==='female'?'win':'loss');expect(s.battle.opponent.transformed).toBe(false);expect(s.battle.player.transformed).toBe(false);
 await page.locator('#return-world').click();await drive(page,s=>s.state.quest==='complete',150000);
 s=await snap(page);expect(s.state.appearance).toEqual(appearance);expect(s.state.story.flags.chapterOne).toBe(true);expect(s.state.health).toBe(s.battle.player.maxHP);expect(s.state.energy).toBe(s.battle.player.maxEnergy);
 expect(s.actors.filter(a=>['nina','caio','nico'].includes(a.id)).every(a=>a.x<250||a.x>1000)).toBe(true);
 expect(s.state.story.lira.world).toBe('gym');expect(s.state.story.flags.arenaOccupied).toBeFalsy();
 await page.keyboard.press('t');await drive(page,s=>s.state.transformed);await door(page,'gym-corridor');expect((await snap(page)).state.transformed).toBe(false);
 await page.keyboard.press('t');await page.waitForTimeout(150);expect((await snap(page)).state.transformed).toBe(false);
 expect(errors).toEqual([]);console.log(gender,starter,'COMPLETE');
});
async function duel(page,mode){
 for(let turn=0;turn<45;turn++){
  const s=await snap(page);if(s.battle.result)break;
  if(s.battle.phase!=='player'){await page.waitForTimeout(100);continue;}
  let action='attack',tab='fight';
  if(mode==='loss'){tab='swap';action='transform';}
  else if(mode==='win'&&s.battle.player.hp<55&&s.state.inventory.tonic>0){tab='bag';action='tonic';}
  else if(s.battle.player.energy>=14&&!(mode==='win'&&s.battle.enemy==='plant'&&s.battle.starter==='water')&&turn%2)action='skill';
  await page.locator(`[data-battle-tab="${tab}"]`).click();await page.locator(`[data-action="${action}"]`).click();
  await expect.poll(async()=>{const a=await snap(page);return a.battle.result||a.battle.phase==='player';},{timeout:25000}).toBeTruthy();
 }
 await expect(page.locator('#battle-result')).toBeVisible({timeout:25000});
}
