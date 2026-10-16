import {chromium} from 'playwright-core';
import {writeFile} from 'node:fs/promises';
import {start,toLab,select} from '../tests/browser-v11/helpers.js';
import {startMetrics,stopMetrics} from './review-performance.mjs';
const root=new URL('../docs/review/lote01/marco-a-r3/',import.meta.url);
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
const p=await b.newPage({baseURL:process.env.ZIMONS_REVIEW_URL||'http://127.0.0.1:4173',viewport:{width:1366,height:768}});
try{
 p.fastStory=true;await start(p,{gender:'male',brief:false});await toLab(p);await select(p,'water');
 await p.waitForTimeout(1200);await startMetrics(p,false);await p.waitForTimeout(3000);
 for(const action of ['attack','skill']){
  if(!await p.locator('#fight-panel').isVisible())await p.locator('[data-battle-tab="fight"]').click();
  await p.locator('[data-action="'+action+'"]').click();
  await p.waitForFunction(()=>{const s=window.zimonsDebug.snapshot();return s.battle.result||s.battle.phase==='player';});
 }
 await p.waitForTimeout(1500);const {metrics}=await stopMetrics(p);
 await writeFile(new URL('performance-sem-gravacao.json',root),JSON.stringify(metrics,null,2));
 console.log(JSON.stringify({...metrics,intervals:undefined}));
 await p.screenshot({path:new URL('batalha-medida-sem-gravacao.png',root).pathname});
}finally{await b.close();}
