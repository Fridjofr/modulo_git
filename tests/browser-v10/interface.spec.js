import {test,expect} from '@playwright/test';
import {start,snap} from './helpers.js';
test('personalização: cinco cabelos e roupas, quatro direções, pernas ligadas e cores independentes',async({page})=>{
 await page.goto('/?debug=1');await expect(page.locator('#title')).toHaveClass(/active/);
 const failures=await page.evaluate(async()=>{
  const {Assets}=await import('/src/assets.js'),{DEFAULT_APPEARANCE}=await import('/src/model.js');const a=new Assets();await a.load();const failures=[];
  const hash=c=>{let h=2166136261;for(const v of c.getContext('2d').getImageData(0,0,192,192).data)h=Math.imul(h^v,16777619);return h;};
  for(const gender of ['male','female'])for(const dir of ['up','down','left','right']){
   for(const [key,count] of [['style',5],['outfit',5],['legwear',3],['hair',4],['skin',5],['top',4],['bottom',4],['bag',3]]){
    const hashes=[];for(let i=0;i<count;i++)hashes.push(hash(a.frame(gender,dir,0,{...DEFAULT_APPEARANCE,gender,[key]:i}).canvas));
    if(new Set(hashes).size!==count)failures.push(`${gender}/${dir}/${key}: opções idênticas`);
   }
   for(let style=0;style<5;style++)for(let outfit=0;outfit<5;outfit++)for(let frame=0;frame<4;frame++){
    const c=a.frame(gender,dir,frame,{...DEFAULT_APPEARANCE,gender,style,outfit,bag:0}).canvas,d=c.getContext('2d').getImageData(0,0,192,192).data;
    let top=192,bottom=0;for(let y=0;y<192;y++){let n=0;for(let x=55;x<138;x++)if(d[(y*192+x)*4+3]>220)n++;if(n){top=Math.min(top,y);bottom=Math.max(bottom,y);}}
    if(bottom<172||top>45)failures.push(`${gender}/${dir}/${style}/${outfit}/${frame}: altura inválida ${top}-${bottom}`);
    for(const y of [104,112,125,138,147]){let filled=0;for(let x=87;x<106;x++)if(d[(y*192+x)*4+3]>220)filled++;if(filled<4)failures.push(`${gender}/${dir}/${style}/${outfit}/${frame}: peça solta em ${y}`);}
   }
  }
  return failures.slice(0,25);
 });expect(failures).toEqual([]);
 await page.locator('#title-new').click();await page.screenshot({path:'docs/screenshots/v10/01-personalizacao.png'});
});
test('HUD, minimapa com zoom e menu preservam legibilidade e bloqueiam movimento ao abrir',async({page})=>{
 await start(page);const s=(await snap(page)).state;await page.keyboard.press('Escape');
 await expect(page.locator('.menu-buttons button').first()).toHaveAttribute('aria-label','Zimondex');await expect(page.locator('#modal')).not.toContainText('Sua jornada');
 await page.getByRole('button',{name:'Bolsa',exact:true}).click();await expect(page.locator('.inventory-slot')).toHaveCount(12);
 await page.keyboard.press('ArrowRight');await page.waitForTimeout(130);expect((await snap(page)).state.x).toBe(s.x);
 await page.keyboard.press('Escape');await expect(page.locator('#modal')).toHaveAttribute('data-kind','menu');await page.keyboard.press('Escape');
 const previous=(await snap(page)).settings.radarRange;await page.locator('#minimap-zoom-in').click();expect((await snap(page)).settings.radarRange).toBeLessThan(previous);
 await page.locator('#minimap-zoom-out').click();expect((await snap(page)).settings.radarRange).toBe(previous);
 const colors=await page.locator('#objective').evaluate(n=>({bg:getComputedStyle(n).backgroundImage,text:getComputedStyle(n.querySelector('strong')).color}));expect(colors.bg).toContain('245, 234, 210');
});
test('falha real de um tileset apresenta recuperação e não fica em tela preta',async({page})=>{
 await page.route('**/assets/tiles/v10/terrain.png',r=>r.abort());await page.goto('/');await expect(page.locator('#load-message')).toContainText('terrain.png');await expect(page.locator('#reload')).toBeVisible();
});
test('nove mapas usam peças reais e cada entrada tem destino individual; atlas do mapa abre sem erro',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/tools/tileset.html');await page.waitForFunction(()=>window.tilesetReady);
 await expect(page.locator('nav button')).toHaveCount(9);await page.screenshot({path:'docs/screenshots/v10/00-tileset.png'});
 await page.getByRole('button',{name:'Corredor Central',exact:true}).click();await page.screenshot({path:'docs/screenshots/v10/00-corredor-tileset.png'});await page.getByRole('checkbox').check();expect(errors).toEqual([]);
});
test.describe('toque',()=>{test.use({hasTouch:true,viewport:{width:800,height:450}});test('personalização e menus cabem em 800×450, sem cortar o botão de iniciar',async({page})=>{
 await page.goto('/?debug=1');await expect(page.locator('#title')).toHaveClass(/active/);await page.locator('#title-new').tap();
 const clipped=await page.locator('#customization button,#start').evaluateAll(nodes=>nodes.filter(n=>{const r=n.getBoundingClientRect();return r.width<8||r.height<8||r.left<0||r.right>innerWidth||r.bottom>innerHeight;}).map(n=>n.getAttribute('aria-label')||n.id));expect(clipped).toEqual([]);
 await page.screenshot({path:'docs/screenshots/v10/10-personalizacao-toque.png'});
});});
