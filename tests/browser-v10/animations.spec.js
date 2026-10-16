import {test,expect} from '@playwright/test';
import {snap,drive,toLab,select} from './helpers.js';
test.use({reducedMotion:'no-preference'});
test('ritmo normal: despertar, casulo, crise, braços e contato com dano no instante do acerto',async({page})=>{
 test.setTimeout(260000);const errors=[];page.on('pageerror',e=>errors.push(e.stack));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto('/?debug=1');await expect(page.locator('#title')).toHaveClass(/active/);await page.screenshot({path:'docs/screenshots/v10/11-tela-inicial.png'});
 await page.locator('#title-new').click();await page.locator('#player-name').fill('Nara');await page.locator('#start').click();
 const observed=new Set();page.effectObserver=async s=>{
  const e=s.effect;
  const names={wake:'12-despertar',transform:'13-casulo',rampage:'14-possessao', 'partial-world':'15-lira-parcial'};
  if(names[e.kind]&&e.progress>.53&&e.progress<.9&&!observed.has(e.kind)){
   observed.add(e.kind);await page.screenshot({path:`docs/screenshots/v10/${names[e.kind]}.png`});
  }
 };
 await drive(page,s=>s.state.quest==='forest',45000);expect(observed.has('wake')).toBe(true);expect((await snap(page)).settings.briefAnimations).toBe(false);
 // The story scenes above run on the normal clock. Traverse through the actual doors.
 await toLab(page);await select(page,'fire');let s=await snap(page);
 for(const key of ['transform','rampage','partial-world'])expect(observed.has(key),key).toBe(true);
 expect(s.state.story.flags.labSecondDamage).toBe(true);expect(s.state.story.flags.labDamaged).toBe(true);
 if(!await page.locator('#fight-panel').isVisible())await page.locator('[data-battle-tab="fight"]').click();const hp=s.battle.opponent.hp,hpText=await page.locator('#enemy-hp').innerText();
 const card=await page.locator('.player-stat').boundingBox(),arena=await page.locator('#battle').boundingBox();expect(card.y+card.height).toBeLessThan(arena.y+arena.height*.31);
 await page.locator('[data-action="attack"]').click();
 await page.waitForFunction(()=>{const e=window.zimonsDebug.snapshot().effect;return e?.kind==='strike'&&e.progress>.48&&e.progress<.66});
 s=await snap(page);expect(s.effect.duration).toBe(1650);expect(await page.locator('#enemy-hp').innerText()).toBe(hpText);
 await page.waitForFunction(()=>{const e=window.zimonsDebug.snapshot().effect;return e?.kind==='strike'&&e.progress>.69&&e.progress<.86});
 s=await snap(page);expect(s.battle.opponent.hp).toBeLessThan(hp);expect(await page.locator('#enemy-hp').innerText()).not.toBe(hpText);await page.screenshot({path:'docs/screenshots/v10/16-contato-fisico.png'});
 await expect.poll(async()=> (await snap(page)).battle.phase,{timeout:15000}).toBe('player');
 await page.locator('[data-action="skill"]').click();await page.waitForFunction(()=>{const e=window.zimonsDebug.snapshot().effect;return e?.kind==='strike'&&e.progress>.56&&e.progress<.78});
 await page.screenshot({path:'docs/screenshots/v10/17-lanca-chamas.png'});
 // Speed is cyclic and shares the animation clock; changing it during a strike stays responsive.
 await page.locator('#battle-speed').click();expect((await snap(page)).settings.battleSpeed).toBe(2);await page.locator('#battle-speed').click();expect((await snap(page)).settings.battleSpeed).toBe(3);await page.locator('#battle-speed').click();expect((await snap(page)).settings.battleSpeed).toBe(1);
 expect(errors).toEqual([]);
});
