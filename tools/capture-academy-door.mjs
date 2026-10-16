import {chromium} from 'playwright-core';
import {mkdir,writeFile} from 'node:fs/promises';
import {start,navigate,drive,snap} from '../tests/browser-v11/helpers.js';
const root=new URL('../docs/review/lote01/marco-a-r4/',import.meta.url).pathname;
await mkdir('/tmp/zimons-review-a4/door-visible',{recursive:true});
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({baseURL:"http://127.0.0.1:4317",viewport:{width:1366,height:768},recordVideo:{dir:'/tmp/zimons-review-a4/door-visible',size:{width:1366,height:1028}}});
const p=await ctx.newPage(),errors=[],events=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
const origin=Date.now();
try{
 await p.goto('http://127.0.0.1:4317/?debug=1');
 // All movement and story progress use the public UI; brief animations stay off.
 await start(p,{brief:false});await navigate(p,1420,480);await drive(p,s=>s.state.quest==='entrance');
 await p.setViewportSize({width:1366,height:1028});await navigate(p,768,270);
 let previous='';
 for(let n=0;n<2000;n++){
  const s=await snap(p);
  if(s.state.world==='clinic'){events.push({name:'clinic',time:(Date.now()-origin)/1000});break;}
  if(s.state.world==='corridor'){
   const value=await p.evaluate(async()=>{const {doorProgress}=await import('/src/doors.js');return doorProgress('corridor','corridor-clinic');});
   const stage=value===0?'closed':value===1?'open':'moving';
   if(stage!==previous){events.push({name:stage,time:(Date.now()-origin)/1000,player:[s.state.x,s.state.y],lira:[s.lira.x,s.lira.y],progress:value});previous=stage;}
  }
  if(s.dialogue)await p.keyboard.press('r');else await p.waitForTimeout(35);
 }
 if(!events.some(e=>e.name==='clinic'))throw Error('A passagem não terminou.');
 await p.waitForTimeout(200);
}catch(e){errors.push(e.stack);process.exitCode=1;}
const video=p.video();await ctx.close();const source=await video.path();await b.close();
await writeFile(root+'videos/porta-percurso.json',JSON.stringify({events,errors,source,viewport:'1366×1028, salão inteiro visível',speed:1},null,2));
console.log(JSON.stringify({events,errors,source},null,2));
