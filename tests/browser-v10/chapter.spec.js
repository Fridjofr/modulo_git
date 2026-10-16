import {test,expect} from '@playwright/test';
import {start,snap,drive,door,toLab,select,fight,recover,practice,navigate} from './helpers.js';
for(const starter of ['fire','water','plant'])test(`roteiro 4.1 completo — ${starter}, portas distintas, derrota real, recalibração, ginásio e quarto`,async({page})=>{
 test.setTimeout(400000);const errors=[],missing=[];page.on('pageerror',e=>errors.push(e.stack));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('response',r=>{if(r.status()>=400)missing.push(r.url())});
 await start(page,{gender:starter==='water'?'male':'female'});
 let s=await snap(page);expect(s.state.zlink).toBe(false);expect(s.lira.world).toBe('forest');expect(s.state.name).toBe('Nara');
 if(starter==='fire'){
  await page.screenshot({path:'docs/screenshots/v10/02-floresta.png'});
  await page.locator('#minimap-zoom-in').click();expect((await snap(page)).settings.radarRange).toBe(488);await page.locator('#minimap-zoom-out').click();
  await page.keyboard.press('Escape');await expect(page.locator('#modal')).toHaveAttribute('data-kind','menu');await page.screenshot({path:'docs/screenshots/v10/03-menu.png'});await page.keyboard.press('Escape');
 }
 await toLab(page);s=await snap(page);expect(s.state.quest).toBe('choose');expect(s.state.zlink).toBe(true);
 if(starter==='fire')await page.screenshot({path:'docs/screenshots/v10/04-laboratorio.png'});
 await select(page,starter);s=await snap(page);expect(s.battle.storyBattle).toBe(true);expect(s.battle.opponent.partial).toBe(true);expect(s.state.story.flags.labDamaged).toBe(true);expect(s.state.story.possessed).toBe(true);expect(Object.keys(s.state.forms)).toEqual([starter]);
 await page.locator('#battle-speed').click();expect((await snap(page)).settings.battleSpeed).toBe(2);await page.locator('#battle-speed').click();expect((await snap(page)).settings.battleSpeed).toBe(3);await page.locator('#battle-speed').click();expect((await snap(page)).settings.battleSpeed).toBe(1);
 expect(await page.locator('[data-battle-tab="exit"]').isVisible()).toBe(false);
 await fight(page,{capture:starter==='fire'});expect((await snap(page)).battle.result).toBe('loss');
 await recover(page);s=await snap(page);expect(s.state.zlink).toBe(false);expect(s.state.world).toBe('clinic');
 await practice(page,{exitInstead:starter==='water'});s=await snap(page);expect(s.state.transformed).toBe(false);expect(s.state.zlink).toBe(true);expect(s.state.story.flags.trainingComplete).toBe(true);
 if(starter==='fire'){await page.locator('#dex-button').click();await expect(page.locator('.dex-entry')).toHaveCount(9);await expect(page.locator('#modal')).not.toContainText('Linha evolutiva');await page.screenshot({path:'docs/screenshots/v10/08-zimondex.png'});await page.keyboard.press('Escape');}
 if((await snap(page)).state.world==='lab')await door(page,'lab-corridor');if(starter==='fire')await page.screenshot({path:'docs/screenshots/v10/05-corredor.png'});await door(page,'corridor-gym');
 s=await snap(page);expect(s.state.quest).toBe('challenge');expect(s.actors.some(n=>n.id==='nina')).toBe(true);if(starter==='fire')await page.screenshot({path:'docs/screenshots/v10/06-ginasio.png'});
 await navigate(page,970,680);await page.keyboard.press('e');await drive(page,s=>s.scene==='battle'&&s.battle.phase==='player');expect((await snap(page)).battle.opponentId).toBe('nico');expect((await snap(page)).battle.world).toBe('gym');
 await fight(page);await page.locator('#return-world').click();await drive(page,s=>s.state.quest==='analysis');
 await door(page,'gym-corridor');await door(page,'corridor-lab');await navigate(page,828,369);await page.keyboard.press('e');await drive(page,s=>s.state.quest==='room');
 await door(page,'lab-corridor');await door(page,'corridor-dorm');if(starter==='fire'){await door(page,'dorm-corridor');await door(page,'corridor-dorm');expect((await snap(page)).lira.world).toBe('gym');}await navigate(page,310,440);await page.keyboard.press('e');await drive(page,s=>s.state.quest==='complete');
 s=await snap(page);expect(s.state.story.flags.chapterOne).toBe(true);expect(s.state.appearance).toMatchObject({style:1,outfit:2});expect(s.state.story.flags.nicoResolved).toBe(true);if(starter==='fire')await page.screenshot({path:'docs/screenshots/v10/09-alojamento.png'});
 if(starter!=='plant'){
  expect(s.lira.world).toBe('gym');
  await door(page,'dorm-corridor');await door(page,'corridor-gym');await page.keyboard.press('t');await drive(page,s=>s.state.transformed);
  expect((await snap(page)).state.transformed).toBe(true);
  await door(page,'gym-corridor');expect((await snap(page)).state.transformed).toBe(false);
  await page.keyboard.press('t');await page.waitForTimeout(120);expect((await snap(page)).state.transformed).toBe(false);
 }
 expect(errors).toEqual([]);expect(missing).toEqual([]);
});
