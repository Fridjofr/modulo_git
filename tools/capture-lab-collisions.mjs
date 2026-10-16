import {chromium} from 'playwright-core';import {mkdir,writeFile} from 'node:fs/promises';
import {start,toLab,navigate,move,snap} from '../tests/browser-v11/helpers.js';
const root=new URL('../docs/review/lote01/marco-a-r4/',import.meta.url).pathname;
await mkdir('/tmp/zimons-review-a4/lab-collisions',{recursive:true});
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({baseURL:"http://127.0.0.1:4317",viewport:{width:1366,height:768},recordVideo:{dir:'/tmp/zimons-review-a4/lab-collisions',size:{width:1366,height:768}}});
const p=await ctx.newPage(),errors=[],checks=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});const origin=Date.now();
try{
 // Preparatory conversations/escorts may use the game's own skip-stage input.
 // Only the subsequent normal-speed laboratory input is delivered as the clip.
 await start(p,{brief:false});await toLab(p);
 await p.locator('#quest-toggle').click();await p.waitForTimeout(350);
 checks.push({name:'inicio',time:(Date.now()-origin)/1000});
 await p.screenshot({path:root+'images/laboratorio-sem-painel.png'});
 async function check(name,x,startY,bottom){
  await navigate(p,x,startY);await move(p,'x',x);await move(p,'y',startY);
  await p.keyboard.down('ArrowUp');await p.waitForTimeout(1000);await p.keyboard.up('ArrowUp');
  const s=await snap(p);if(s.state.y<bottom+8||s.state.y>bottom+13)throw Error(name+' não bloqueou os pés: '+s.state.y);
  checks.push({name,time:(Date.now()-origin)/1000,position:[s.state.x,s.state.y],solidBottom:bottom,blocked:true});
  await p.screenshot({path:root+'images/colisao-'+name+'.png'});await move(p,'y',400);
 }
 await check('bancada-central',500,390,299);
 await check('cilindros',190,350,239);
 await check('cadeira-central',640,400,317);
 await check('cadeira-direita',1070,400,317);
 await navigate(p,580,390);await move(p,'y',390);await move(p,'x',700);
 checks.push({name:'scanner-transitavel',time:(Date.now()-origin)/1000,position:(await snap(p)).state});
 await move(p,'x',640);await p.keyboard.press('e');await p.waitForTimeout(200);
 if(!(await snap(p)).dialogue)throw Error('Scanner não iniciou a interação.');
 checks.push({name:'scanner-interacao',time:(Date.now()-origin)/1000});
}catch(e){errors.push(e.stack);process.exitCode=1;await p.screenshot({path:'/tmp/zimons-review-a4/lab-collisions-failure.png'});}
const video=p.video();await ctx.close();const source=await video.path();await b.close();
await writeFile(root+'videos/laboratorio-colisoes.json',JSON.stringify({checks,errors,source,speed:1,origin:origin,preparation:'Somente diálogos/escoltas anteriores ao trecho foram avançados pela tecla R do jogo. O clipe contém exclusivamente caminhada e colisões normais.'},null,2));console.log(JSON.stringify({checks:checks.map(c=>({...c,position:c.name==='scanner-transitavel'?'travessia do scanner':c.position})),errors,source},null,2));
