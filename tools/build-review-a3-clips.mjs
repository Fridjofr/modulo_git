import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFile} from 'node:child_process';import {promisify} from 'node:util';
const run=promisify(execFile),root=new URL('../docs/review/lote01/marco-a-r3/',import.meta.url).pathname;
await mkdir(root+'videos',{recursive:true});
const tag=process.argv[2],log=(await readFile('/tmp/zimons-review-a3/'+tag+'-complete.log','utf8')).replaceAll('\0',''),source=[...log.matchAll(/^VIDEO (.+)$/gm)].at(-1)?.[1];
if(!source||!log.includes('DONE []'))throw Error('Percurso incompleto '+tag);
const t=JSON.parse(await readFile(root+'runs/'+tag+'/timeline.json','utf8'));
if(t.errors.length)throw Error('Percurso com erros');
const at=name=>t.timeline.find(x=>x.name===name)?.time;
const encode=async(name,start,end)=>{await run('ffmpeg',['-y','-loglevel','error','-threads','2','-ss',String(start),'-i',source,'-t',String(end-start),'-an','-c:v','libx264','-threads','2','-preset','fast','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart',root+'videos/'+name+'.mp4']);return {name,start,end,speed:1,source,viewport:'1366×768',audio:false};};
const record=[];
if(tag.endsWith('-walk'))record.push(await encode(tag==='male-walk'?'protagonista-masculino-1x':'protagonista-feminina-personalizada-1x',at('inicio-caminhada-humana')-.2,at('fim-caminhada-humana')+.2));
else{
 record.push(await encode('combate-'+tag+'-1x',at('inicio-ataques')-.1,at('fim-ataques')+.2));
 record.push(await encode('zimon-'+tag+'-1x',at('inicio-caminhada-zimon')-.2,at('fim-caminhada-zimon')+.2));
 if(tag==='female-fire')record.push(await encode('protagonista-feminina-1x',at('inicio-caminhada-humana')-.2,at('fim-caminhada-humana')+.2));
 if(tag==='female-fire'){
   const a=await encode('cadeira-aproximacao',at('08a-corredor')+4,at('10-enfermaria-sentada')-.05);
   const b=await encode('cadeira-levantar',at('11c-lira-levantando')-2.1,at('11c-lira-levantando')+3);
   await writeFile('/tmp/zimons-review-a3/cadeira-list.txt',`file '${root}videos/cadeira-aproximacao.mp4'\nfile '${root}videos/cadeira-levantar.mp4'\n`);
   await run('ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i','/tmp/zimons-review-a3/cadeira-list.txt','-c','copy','-movflags','+faststart',root+'videos/lira-cadeira-1x.mp4']);record.push({name:'lira-cadeira-1x',cuts:[a,b],speed:1,note:'Dois trechos reais; só a conversa intermediária foi retirada. Sem interpolação ou aceleração.'});
 }
 await run('ffmpeg',['-y','-loglevel','error','-i',root+'runs/'+tag+'/combate-canvas-60.webm','-an','-c:v','libx264','-threads','2','-preset','fast','-crf','23','-fps_mode','vfr','-pix_fmt','yuv420p','-movflags','+faststart',root+'videos/combate-canvas-'+tag+'-1x.mp4']);
}
await writeFile(root+'videos/origem-'+tag+'.json',JSON.stringify(record,null,2));
console.log(tag,record.map(x=>x.name));
