import {test,expect} from '@playwright/test';
import {begin,snap} from './helpers.js';
test('cinco cabelos e cinco modelos de roupa são distintos nas quatro direções, com cores independentes',async({page})=>{
 await page.goto('/?debug=1');await expect(page.locator('#title')).toHaveClass(/active/);
 const issues=await page.evaluate(async()=>{
  const {Assets}=await import('/src/assets.js'),{DEFAULT_APPEARANCE}=await import('/src/model.js');const a=new Assets();await a.load();
  const hash=async c=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',c.getContext('2d').getImageData(0,0,c.width,c.height).data))).join();
  const issues=[];
  for(const gender of ['male','female']) for(const dir of ['up','down','left','right']) {
   for(const [key,count] of [['style',5],['outfit',5],['legwear',3]]) {
    const variants=[];for(let value=0;value<count;value++) variants.push(await hash(a.frame(gender,dir,0,{...DEFAULT_APPEARANCE,gender,[key]:value}).canvas));
    if(new Set(variants).size!==count)issues.push(`${gender}/${dir}/${key}`);
   }
  }
  return issues;
 });expect(issues).toEqual([]);
 await page.locator('#title-new').click();
 await page.getByRole('button',{name:'Penteado: Rabo alto',exact:true}).click();
 await expect(page.locator('#style-value')).toHaveText('Rabo alto');
 await page.getByRole('button',{name:'Modelo da roupa: Jaqueta',exact:true}).click();
 await page.getByRole('button',{name:'Modelo inferior: Calça',exact:true}).click();
 await page.locator('#start').click();
 expect((await snap(page)).state.appearance).toMatchObject({style:4,outfit:1,legwear:1});
});
test('Esc abre menu tradicional; subpágina retorna ao menu por Esc e exploração fica parada',async({page})=>{
 await begin(page);const start=(await snap(page)).state;
 await page.keyboard.press('Escape');await expect(page.locator('#modal')).toHaveAttribute('data-kind','menu');
 await expect(page.locator('.journey-profile h3')).toHaveText('Nara');
 const lightness=await page.locator('.menu-buttons button:not(:disabled) strong').evaluateAll(ns=>ns.map(n=>{const c=getComputedStyle(n).color.match(/[0-9.]+/g).map(Number);return .2126*c[0]+.7152*c[1]+.0722*c[2];}));expect(lightness.every(v=>v>140)).toBe(true);
 await page.getByRole('button',{name:'Bolsa',exact:true}).click();await expect(page.locator('#modal-title')).toHaveText('Bolsa');
 await page.keyboard.press('ArrowRight');await page.waitForTimeout(100);expect((await snap(page)).state.x).toBe(start.x);
 await page.keyboard.press('Escape');await expect(page.locator('#modal-title')).toHaveText('');
 await page.getByRole('button',{name:'Configurações',exact:true}).click();await expect(page.getByRole('slider',{name:'Volume da música'})).toBeVisible();
 await page.keyboard.press('Escape');await page.keyboard.press('Escape');await expect(page.locator('#modal')).toBeHidden();
});
test('três linhagens preservam as folhas aprovadas em cada quadro do combate e não carregam modelos 3D',async({page})=>{
 const requested=[];page.on('request',r=>requested.push(r.url()));await page.goto('/?debug=1');await expect(page.locator('#title')).toHaveClass(/active/);
 const result=await page.evaluate(async()=>{
  const {Assets}=await import('/src/assets.js'),{Renderer}=await import('/src/render.js'),{newGame,createContainment}=await import('/src/model.js');
  const a=new Assets();await a.load();const r=new Renderer(a),s=newGame();const seen=[];
  const original=a.battle.draw.bind(a.battle);a.battle.draw=(ctx,key,...args)=>{seen.push(key);return original(ctx,key,...args);};
  for(const starter of ['fire','water','plant']) {s.starter=starter;s.zlink=true;const b=createContainment(s);b.phase='player';r.beginBattle(s,b);
   r.drawBattle(s,b,1400,{kind:'strike',side:'player',target:'opponent',action:'skill',element:'Fogo',color:'#ff985e',start:0,duration:2100},false);
  }
  return {seen,mode:r.battleSprites.stats()};
 });expect(result.seen).toEqual(['lira','fire','lira','water','lira','plant']);expect(result.mode.webgl).toBe(false);expect(result.mode.poses).toBe(6);
 expect(requested.filter(url=>/battle3d|models3d|creature-rig|three\.module/.test(url))).toEqual([]);
});

test('trocar cabelo comprido por curto não abre buracos no uniforme',async({page})=>{
 await page.goto('/?debug=1');await expect(page.locator('#title')).toHaveClass(/active/);
 const failures=await page.evaluate(async()=>{const {Assets}=await import('/src/assets.js'),{DEFAULT_APPEARANCE}=await import('/src/model.js');const a=new Assets();await a.load();const failures=[];
  for(const gender of ['female','male'])for(const dir of ['down','up']){const c=a.frame(gender,dir,0,{...DEFAULT_APPEARANCE,gender,style:1,outfit:2,bag:0}).canvas,d=c.getContext('2d').getImageData(0,0,192,192).data;for(const x of [90,96,102])for(const y of [110,115,120,125])if(d[(y*192+x)*4+3]<220)failures.push(`${gender}/${dir}/${x},${y}`);}return failures;
 });expect(failures).toEqual([]);
});
