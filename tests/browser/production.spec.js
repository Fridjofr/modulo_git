import {test,expect} from '@playwright/test';
import {begin,toLaboratory,choose,snap,contain,practice,move,drive,social} from './helpers.js';
test('bolsa e Zimondex funcionam no percurso real, sem aparelho de recuperação',async({page})=>{
 test.setTimeout(480000);const errors=[];page.openingCaptures=new Set();page.on('pageerror',e=>errors.push(e.message));
 await begin(page,'female');await page.keyboard.press('Escape');
 await expect(page.locator('.menu-buttons button').first()).toHaveAccessibleName('Zimondex');await expect(page.locator('.menu-buttons button').first()).toBeDisabled();await page.keyboard.press('Escape');
 await toLaboratory(page);expect((await snap(page)).state.story.flags.stone).not.toBe(true);await choose(page,'fire');
 await page.emulateMedia({reducedMotion:'no-preference'});
 // Brief mode was enabled through the title settings for the long journey; normal timings are checked in revision.spec.js.
 await page.emulateMedia({reducedMotion:'reduce'});await contain(page);
 expect((await snap(page)).state.story.flags.mistDream).toBe(true);expect((await snap(page)).state.story.possessed).toBe(false);
 await page.keyboard.press('t');expect((await snap(page)).state.transformed).toBe(false);await expect(page.locator('#toast')).toBeHidden();
 await page.keyboard.press('Escape');await page.screenshot({path:'docs/screenshots/v09-20-menu-real.png'});
 await page.getByRole('button',{name:'Zimondex',exact:true}).click();await expect(page.locator('.dex-entry')).toHaveCount(3);await expect(page.locator('.dex-detail')).toContainText('Alma vinculada');await expect(page.locator('#modal-body')).not.toContainText('Missões');
 await page.screenshot({path:'docs/screenshots/v09-21-zimondex-real.png'});await page.keyboard.press('Escape');await page.keyboard.press('Escape');
 await practice(page);await move(page,'y',580);await move(page,'x',640);await page.keyboard.press('e');await drive(page,s=>s.state.world==='plaza');
 await page.keyboard.press('i');await expect(page.locator('.inventory-slot')).toHaveCount(12);await expect(page.getByRole('button',{name:'Usar tônico',exact:true})).toBeDisabled();await page.screenshot({path:'docs/screenshots/v09-22-bolsa-real.png'});await page.keyboard.press('Escape');
 expect((await snap(page)).state.story.flags.trainingComplete).toBe(true);expect(errors).toEqual([]);
});
test('atlases completos têm seis poses legíveis e máscaras de olhos limitadas à íris',async({page})=>{
 await page.goto('/?debug=1');await expect(page.locator('#title')).toHaveClass(/active/);
 const result=await page.evaluate(async()=>{const {Assets}=await import('/src/assets.js');const a=new Assets();await a.load();return Object.fromEntries(Object.entries(a.battle.actors).map(([key,actor])=>[key,actor.frames.map(f=>({opaque:f.opaque,eyes:f.red?Array.from(f.red.getContext('2d').getImageData(0,0,512,512).data).filter((v,i)=>i%4===3&&v).length:0}))]));});
 for(const [key,frames] of Object.entries(result)){expect(frames).toHaveLength(6);for(const f of frames){expect(f.opaque).toBeGreaterThan(20000);if(key!=='lira'){expect(f.eyes).toBeGreaterThan(8);expect(f.eyes).toBeLessThan(1300);}}}
});
