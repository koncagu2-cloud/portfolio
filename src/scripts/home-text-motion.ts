/** Once-only text entrances. HTML stays visible without JS, observers or motion support. */
const root=document.querySelector<HTMLElement>('.homepage');
if(root&&'IntersectionObserver' in window){
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),abort=new AbortController(),{signal}=abort;
 const seen=new WeakSet<HTMLElement>(),active=new Map<HTMLElement,Animation>();
 const targets=[...root.querySelectorAll<HTMLElement>('main :is(h1,h2,h3,h4,p,dt,dd,figcaption,summary)')].filter(el=>{
  if(el.closest('[aria-hidden="true"],.sr-only')||el.parentElement?.closest('[data-home-reveal]'))return false;
  el.dataset.homeReveal='';return true;
 });
 const finish=()=>{for(const animation of active.values())animation.cancel();active.clear();};
 const observer=new IntersectionObserver(entries=>{
  let order=0;
  for(const entry of entries){
   const el=entry.target as HTMLElement;if(!entry.isIntersecting)continue;observer.unobserve(el);
   if(seen.has(el))continue;seen.add(el);
   if(motion.matches||document.hidden||el.contains(document.activeElement))continue;
   const heading=/^H[1-4]$/.test(el.tagName);
   const animation=el.animate([{opacity:.96,transform:`translateY(${heading?12:6}px)`},{opacity:1,transform:'translateY(0)'}],{duration:heading?420:300,delay:Math.min(order++,2)*35,easing:'cubic-bezier(.2,.7,.3,1)'});
   active.set(el,animation);void animation.finished.catch(()=>{}).finally(()=>{if(active.get(el)===animation)active.delete(el);});
  }
 },{threshold:0,rootMargin:'0px 0px -16px 0px'});
 const sync=()=>{finish();observer.disconnect();root.dataset.textMotion=motion.matches?'reduced':'enabled';if(!motion.matches)for(const el of targets)if(!seen.has(el))observer.observe(el);};
 motion.addEventListener('change',sync,{signal});
 root.addEventListener('focusin',e=>{const el=(e.target as HTMLElement).closest<HTMLElement>('[data-home-reveal]');if(el){active.get(el)?.cancel();active.delete(el);seen.add(el);observer.unobserve(el);}},{signal});
 window.addEventListener('beforeprint',finish,{signal});
 const cleanup=()=>{finish();observer.disconnect();abort.abort();};window.addEventListener('pagehide',e=>{if(e.persisted)finish();else cleanup();},{signal});import.meta.hot?.dispose(cleanup);sync();
}
