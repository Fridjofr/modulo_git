import { readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run = promisify(execFile);
const root = new URL('../docs/review/lote01/marco-a-r4/', import.meta.url).pathname;
const door = JSON.parse(await readFile(root + 'videos/porta-percurso.json', 'utf8'));
if (door.errors.length) throw Error('A captura da porta contém erros.');
// Locate a real, fully closed video frame by comparing only the door leaves
// with the existing closed gameplay screenshot. No pixels are repainted.
const closing = door.events.findLast(e => e.name === 'moving').time - .2;
const raw = async args => (await run('ffmpeg', ['-v','error',...args,'-pix_fmt','rgb24','-f','rawvideo','-'], {encoding:'buffer',maxBuffer:8*1024*1024})).stdout;
const region = 'crop=132:84:192:141';
const reference = await raw(['-i',root+'images/salao-portas-fechadas.png','-vf',region,'-frames:v','1']);
const tail = await raw(['-ss',String(closing),'-i',door.source,'-t','1.5','-vf',region]);
let best=Infinity, bestIndex=0;
for(let n=0;n<Math.floor(tail.length/reference.length);n++){
 let error=0;
 for(let k=0;k<reference.length;k++)error+=Math.abs(tail[n*reference.length+k]-reference[k]);
 error/=reference.length;
 if(error<best){best=error;bestIndex=n;}
}
door.closedFrame={time:closing+bestIndex/25,meanPixelDifferenceFromClosedReference:best,note:'Localização de um quadro real fechado, sem edição de pixels.'};
await writeFile(root+'videos/porta-percurso.json',JSON.stringify(door,null,2));
const start=door.events.find(e=>e.name==='moving').time-1.5;
const end=door.closedFrame.time+.12;
await run('ffmpeg',['-y','-loglevel','error','-ss',String(start),'-i',door.source,'-t',String(end-start),'-an','-c:v','libx264','-threads','2','-preset','fast','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',root+'videos/porta-salao-1x.mp4']);
await run('ffmpeg',['-y','-loglevel','error','-i',root+'videos/porta-salao-1x.mp4','-vf','crop=380:360:100:40,fps=12,split[a][b];[a]palettegen[p];[b][p]paletteuse','-loop','0',root+'videos/porta-salao.gif']);
const moments=[0,.14,.25,.38,.5,.65,.8,.93,1].map(t=>start+t*(end-start-.06));
const selected=moments.map(t=>'eq(n,'+Math.round(t*25)+')').join('+');
await run('ffmpeg',['-y','-loglevel','error','-i',door.source,'-vf',`select='${selected}',crop=380:360:100:40,tile=3x3`,'-frames:v','1',root+'images/sequencia-porta.png']);
const manifest=JSON.parse(await readFile(root+'videos/ORIGEM.json','utf8'));
manifest.records[0]={name:'porta-salao-1x',source:door.source,start,end,speed:1,viewport:'1366×1028',note:'Salão inteiro visível durante a aproximação, abertura, travessia e fechamento. Sem interpolação ou aceleração.'};
manifest.recording='Playwright a 25 quadros/s, sem áudio. Porta: viewport 1366×1028. Laboratório e enfermaria: 1366×768.';
await writeFile(root+'videos/ORIGEM.json',JSON.stringify(manifest,null,2));
console.log('Porta:',end-start,'s reais;',door.alignment.length,'amostras de alinhamento, desvio máximo',Math.max(...door.alignment.map(a=>Math.abs(a.x-242))));
