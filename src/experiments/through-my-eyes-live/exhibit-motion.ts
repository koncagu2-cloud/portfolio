/** Reading orientation and one-time artifact reveals. Content is visible without JS. */
const root=document.querySelector<HTMLElement>('[data-tme]');
if(root){
 const abort=new AbortController(),{signal}=abort,media=matchMedia('(prefers-reduced-motion: reduce)');
 const chapters=[...root.querySelectorAll<HTMLElement>('.tme-world,.tme-chapter')],visible=new Set<HTMLElement>(),players=new Set<Animation>();let frame=0,readerOpen=false;
 const allowed=()=>!readerOpen&&!media.matches&&root.dataset.motion!=='reduced'&&root.querySelector('[data-pause]')?.getAttribute('aria-pressed')!=='true';
 const settle=()=>{for(const a of players)a.cancel();players.clear();};
 const reading=()=>{frame=0;let active:HTMLElement|undefined;for(const section of visible){const rect=section.getBoundingClientRect();if(rect.top<innerHeight*.6&&rect.bottom>100){active=section;const progress=Math.max(0,Math.min(1,-rect.top/Math.max(1,rect.height-innerHeight)));section.style.setProperty('--read-progress',String(progress));}}if(active)root.dataset.reading=active.id;};
 const request=()=>{if(!frame)frame=requestAnimationFrame(reading);};
 const chapterObserver=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting&&e.intersectionRatio>0)visible.add(e.target as HTMLElement);else visible.delete(e.target as HTMLElement);}request();});chapters.forEach(c=>chapterObserver.observe(c));
 const revealObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;revealObserver.unobserve(entry.target);if(!allowed()||root.dataset.lensActive==='true')continue;const animation=entry.target.animate([{transform:'translateY(24px)',clipPath:'inset(5% 0 0 0)'},{transform:'translateY(0)',clipPath:'inset(0 0 0 0)'}],{duration:460,easing:'cubic-bezier(.2,.7,.2,1)'});players.add(animation);void animation.finished.catch(()=>{}).then(()=>players.delete(animation));}},{rootMargin:'0px 0px -35px 0px',threshold:.08});
 root.querySelectorAll('.tme-world-intro>.tme-artifact,.tme-ring-opening>figure,.tme-ring-evidence>.tme-state-viewer,.tme-spatial-artifact,.tme-community-story>.tme-state-viewer,.tme-align-opening>figure').forEach(e=>revealObserver.observe(e));
 const motionObserver=new MutationObserver(()=>{if(!allowed())settle();});motionObserver.observe(root,{attributes:true,attributeFilter:['data-motion']});motionObserver.observe(root.querySelector('[data-pause]')!,{attributes:true,attributeFilter:['aria-pressed']});
 window.addEventListener('scroll',request,{passive:true,signal});window.addEventListener('resize',request,{passive:true,signal});media.addEventListener('change',()=>{if(!allowed())settle();},{signal});root.addEventListener('tme:navigate',settle,{signal});root.addEventListener('tme:reader',e=>{readerOpen=Boolean((e as CustomEvent).detail);if(readerOpen)settle();},{signal});
 const cleanup=()=>{abort.abort();cancelAnimationFrame(frame);settle();chapterObserver.disconnect();revealObserver.disconnect();motionObserver.disconnect();};window.addEventListener('pagehide',e=>{if(!e.persisted)cleanup();},{signal});import.meta.hot?.dispose(cleanup);
}
