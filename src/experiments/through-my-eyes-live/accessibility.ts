/** Reserve actual text space without resizing typography to fit a fixed-height scene. */
const root=document.querySelector<HTMLElement>('[data-tme]');
if(root){
 const abort=new AbortController(),{signal}=abort,hero=root.querySelector<HTMLElement>('.tme-journey')!,stage=root.querySelector<HTMLElement>('[data-stage]')!,copy=root.querySelector<HTMLElement>('.tme-type')!,utilities=root.querySelector<HTMLElement>('.tme-utilities')!,siteNav=root.querySelector<HTMLElement>('.tme-nav')!;
 let frame=0;
 const fit=()=>{frame=0;const height=stage.clientHeight;if(!height)return;// Center the actual text block on roomy desktops, leaving room for motion controls.
 // A measured offset avoids translateY competing with scanner/entrance transforms.
 const navClearance=Math.ceil(siteNav.getBoundingClientRect().height)+12;
 if(innerWidth>=1101){
  const offset=Math.max(navClearance,Math.round((hero.clientHeight-copy.scrollHeight-utilities.scrollHeight-64)/2));
  copy.style.setProperty('--hero-copy-top',offset+'px');
 }else if(innerWidth<=700)copy.style.setProperty('--hero-copy-top',navClearance+'px');
 else copy.style.setProperty('--hero-copy-top',Math.max(navClearance,Math.round(hero.clientHeight*.12))+'px');
 if(innerWidth<=700){
  const title=copy.querySelector<HTMLElement>('h1')!,utilityBottom=parseFloat(getComputedStyle(utilities).bottom)||16;
  const portraitTop=copy.offsetTop+title.offsetTop;
  const required=Math.ceil(copy.offsetTop+copy.scrollHeight+utilityBottom+utilities.scrollHeight+16);
  stage.style.setProperty('--mobile-portrait-top',portraitTop+'px');
  stage.style.setProperty('--mobile-portrait-bottom',(portraitTop+240)+'px');
  stage.style.setProperty('--readable-hero-height',Math.max(hero.clientHeight,required)+'px');
  return;
 }
 stage.style.removeProperty('--mobile-portrait-top');
 const top=parseFloat(getComputedStyle(copy).top)||0;const ratio=Math.min(.4,top/height);const required=Math.ceil((copy.scrollHeight+utilities.scrollHeight+32)/(1-ratio-.04));const value=required>hero.clientHeight+24?required:0;if(stage.style.getPropertyValue('--readable-hero-height')!==value+'px')stage.style.setProperty('--readable-hero-height',value+'px');};
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(fit);};
 const observer=new ResizeObserver(schedule);[hero,copy,utilities,siteNav].forEach(el=>observer.observe(el));window.addEventListener('resize',schedule,{signal});void document.fonts.ready.then(schedule);schedule();
 const cleanup=()=>{abort.abort();observer.disconnect();cancelAnimationFrame(frame);};window.addEventListener('pagehide',e=>{if(!e.persisted)cleanup();},{signal});import.meta.hot?.dispose(cleanup);
}
