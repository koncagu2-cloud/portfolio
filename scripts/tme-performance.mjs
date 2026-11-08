import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const output=process.env.TME_PERF_OUTPUT;
if(!output)throw Error('TME_PERF_OUTPUT required');
await mkdir(output,{recursive:true});
const stats=(values)=>{const a=[...values].sort((a,b)=>a-b),q=p=>a[Math.min(a.length-1,Math.floor(a.length*p))]||0;return {samples:a.length,averageFps:a.length?1000/(a.reduce((s,v)=>s+v,0)/a.length):0,onePercentLowFps:a.length?1000/(a.slice(-Math.max(1,Math.ceil(a.length*.01))).reduce((s,v)=>s+v,0)/Math.max(1,Math.ceil(a.length*.01))):0,frameMs:{p50:q(.5),p90:q(.9),p95:q(.95),p99:q(.99),max:a.at(-1)||0},over50ms:a.filter(v=>v>50).length,over100ms:a.filter(v=>v>100).length};};
const results=[];
for(const mode of (process.env.TME_PERF_MODES||'native,adaptive,recorded').split(',')){
 const recording=mode==='recorded';
 const browser=await chromium.launch({headless:process.env.TME_HEADED!=='1'});const browserCDP=await browser.newBrowserCDPSession();let gpu;
 try{const info=await browserCDP.send('SystemInfo.getInfo');gpu={devices:info.gpu.devices,aux:info.gpu.auxAttributes,features:info.gpu.featureStatus};}catch{gpu='Unavailable';}
 const context=await browser.newContext({viewport:{width:1440,height:1000},...(recording?{recordVideo:{dir:output+'/video',size:{width:1440,height:1000}}}:{})});
 const page=await context.newPage();const cdp=await context.newCDPSession(page);await cdp.send('Performance.enable');
 await page.goto('http://127.0.0.1:4353/experiments/through-my-eyes-live/'+(mode==='native'?'?tme-quality=native':''));await page.locator('[data-tme][data-ready=true]').waitFor();await page.waitForTimeout(1800);
 const env=await page.evaluate(()=>{const canvas=document.querySelector('[data-canvas]'),gl=canvas.getContext('webgl2');const ext=gl.getExtension('WEBGL_debug_renderer_info');return {ua:navigator.userAgent,dpr:devicePixelRatio,drawingBuffer:[gl.drawingBufferWidth,gl.drawingBufferHeight],renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),timerQueryAvailable:!!gl.getExtension('EXT_disjoint_timer_query_webgl2'),visibility:document.visibilityState,memory:performance.memory?{usedJSHeapSize:performance.memory.usedJSHeapSize,totalJSHeapSize:performance.memory.totalJSHeapSize}:null};});
 const phases=[];
 for(const phase of ['idle','pointer','paused']){
  if(phase==='paused')await page.getByRole('button',{name:'Pause motion',exact:true}).click();
  const before=await cdp.send('Performance.getMetrics');
  await page.evaluate(()=>{const root=document.querySelector('[data-tme]');const state={renders:[],raf:[],longTasks:[],lastRender:0,lastRaf:0,stopped:false};window.__tmeProbe=state;state.observer=new MutationObserver(()=>{const n=performance.now();if(state.lastRender)state.renders.push(n-state.lastRender);state.lastRender=n;});state.observer.observe(root,{attributes:true,attributeFilter:['data-render-count']});state.longObserver=new PerformanceObserver(list=>{for(const e of list.getEntries())state.longTasks.push({duration:e.duration,start:e.startTime});});state.longObserver.observe({type:'longtask',buffered:false});function tick(n){if(state.stopped)return;if(state.lastRaf)state.raf.push(n-state.lastRaf);state.lastRaf=n;state.id=requestAnimationFrame(tick);}state.id=requestAnimationFrame(tick);});
  if(phase==='pointer'){for(let i=0;i<24;i++){await page.mouse.move(150+i%12*95,350+Math.sin(i)*150);await page.waitForTimeout(250);}}else await page.waitForTimeout(6000);
  const data=await page.evaluate(()=>{const s=window.__tmeProbe;s.stopped=true;cancelAnimationFrame(s.id);s.observer.disconnect();s.longObserver.disconnect();const root=document.querySelector('[data-tme]');return {renders:s.renders,raf:s.raf,longTasks:s.longTasks,model:{triangles:root.dataset.triangles,drawCalls:root.dataset.drawCalls,quality:root.dataset.quality,effectiveDpr:root.dataset.effectiveDpr,drawingBuffer:[document.querySelector('canvas[data-canvas]').width,document.querySelector('canvas[data-canvas]').height]},memory:performance.memory?performance.memory.usedJSHeapSize:null};});
  const after=await cdp.send('Performance.getMetrics');const m=x=>Object.fromEntries(x.metrics.map(v=>[v.name,v.value]));const a=m(after),b=m(before);phases.push({phase,render:stats(data.renders),browserRAF:stats(data.raf),longTasks:data.longTasks,model:data.model,usedJSHeapBytes:data.memory,cpuSeconds:Object.fromEntries(['TaskDuration','ScriptDuration','LayoutDuration','RecalcStyleDuration'].map(k=>[k,(a[k]||0)-(b[k]||0)]))});
 }
 await page.screenshot({path:output+`/hero-${mode}.png`});results.push({mode,recording,environment:env,gpu,phases});await context.close();await browser.close();await writeFile(output+'/measurements.json',JSON.stringify(results,null,2));
}
console.log(JSON.stringify(results.map(r=>({mode:r.mode,recording:r.recording,renderer:r.environment.renderer,phases:r.phases.map(p=>({phase:p.phase,fps:p.render.averageFps,low:p.render.onePercentLowFps,raf:p.browserRAF.averageFps,p95:p.render.frameMs.p95,cpu:p.cpuSeconds}))})),null,2));
