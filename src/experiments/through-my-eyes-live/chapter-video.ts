import {createPrototypeVideos} from './prototype-videos';
for(const host of document.querySelectorAll<HTMLElement>('[data-chapter-video]')){
 const root=host.closest<HTMLElement>('[data-tme]')!,abort=new AbortController(),{signal}=abort;
 let visible=false;
 const players=createPrototypeVideos(host,signal,()=>visible&&root.dataset.scene===host.dataset.chapterVideo&&!root.querySelector('dialog[open]'));
 const sync=()=>players.syncAutoplay();
 const view=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0});
 view.observe(host.querySelector('.tme-chapter-video-image')!);
 const scene=new MutationObserver(sync);scene.observe(root,{attributes:true,attributeFilter:['data-scene']});
 const preference=new MutationObserver(()=>{players.resetAll();sync();});preference.observe(root,{attributes:true,attributeFilter:['data-motion']});
 const pause=root.querySelector('[data-pause]');if(pause)preference.observe(pause,{attributes:true,attributeFilter:['aria-pressed']});
 root.addEventListener('tme:reader',sync,{signal});
 const cleanup=()=>{abort.abort();view.disconnect();scene.disconnect();preference.disconnect();};
 window.addEventListener('pagehide',e=>{if(!e.persisted)cleanup();},{signal});import.meta.hot?.dispose(cleanup);
}
