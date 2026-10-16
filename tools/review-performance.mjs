// Optional measurement for the review harness, never installed in normal play.
export async function startMetrics(page, canvasVideo = true) {
  await page.evaluate(async (video) => {
    const {Renderer}=await import('/src/render.js');
    const original=Renderer.prototype.drawBattle;
    const data=window.reviewPerformance={intervals:[],draw:[],longTasks:[],active:true,last:null};
    Renderer.prototype.drawBattle=function(...args){const t=performance.now();const result=original.apply(this,args);if(data.active)data.draw.push(performance.now()-t);return result;};
    const observe=new PerformanceObserver(list=>{if(data.active)for(const e of list.getEntries())data.longTasks.push({start:e.startTime,duration:e.duration});});
    observe.observe({entryTypes:['longtask']});
    const tick=t=>{if(!data.active){observe.disconnect();Renderer.prototype.drawBattle=original;return;}if(data.last!==null)data.intervals.push(t-data.last);data.last=t;requestAnimationFrame(tick);};
    requestAnimationFrame(tick);
    if(video){
      const stream=document.querySelector('#battle-canvas').captureStream(60);
      const mime=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm';
      data.chunks=[];data.stream=stream;data.recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:6000000});
      data.recorder.ondataavailable=e=>{if(e.data.size)data.chunks.push(e.data);};data.recorder.start();
    }
  }, canvasVideo);
}
export async function stopMetrics(page) {
  return page.evaluate(async()=>{
    const d=window.reviewPerformance;d.active=false;
    const stats=v=>{const s=[...v].sort((a,b)=>a-b);return {samples:s.length,mean:s.reduce((a,b)=>a+b,0)/s.length,p50:s[Math.floor(s.length*.5)],p95:s[Math.floor(s.length*.95)],p99:s[Math.floor(s.length*.99)],max:s.at(-1),over33:v.filter(x=>x>33.4).length,over50:v.filter(x=>x>50).length};};
    let video=null;
    if(d.recorder){await new Promise(resolve=>{d.recorder.onstop=resolve;d.recorder.stop();});d.stream.getTracks().forEach(t=>t.stop());video=await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.readAsDataURL(new Blob(d.chunks,{type:d.recorder.mimeType}));});}
    const interval=stats(d.intervals);return {metrics:{realSpeed:1,raf:interval,fps:1000/interval.mean,drawMilliseconds:stats(d.draw),longTasks:d.longTasks,userAgent:navigator.userAgent,viewport:[innerWidth,innerHeight],recordingCanvasHz:d.recorder?60:0,intervals:d.intervals},video};
  });
}
