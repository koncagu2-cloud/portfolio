import {createPrototypeVideos} from './prototype-videos';
const root=document.querySelector<HTMLElement>('[data-tme]');
if(root){
 const abort=new AbortController(),{signal}=abort,panel=root.querySelector<HTMLElement>('#hero-projects')!,toggle=root.querySelector<HTMLButtonElement>('[data-scanner-toggle]')!,status=panel.querySelector<HTMLElement>('[data-scanner-status]')!;
 const siteNav=root.querySelector<HTMLElement>('.tme-nav');
 if(siteNav){
  const syncScannerOffset=()=>root.style.setProperty('--scanner-top-offset',`${Math.ceil(siteNav.getBoundingClientRect().height)}px`);
  const navObserver=new ResizeObserver(syncScannerOffset);navObserver.observe(siteNav);syncScannerOffset();signal.addEventListener('abort',()=>navObserver.disconnect(),{once:true});
 }
 const media=createPrototypeVideos(panel,signal);
 const links=[...panel.querySelectorAll<HTMLButtonElement>('[data-hero-project]')],previews=[...panel.querySelectorAll<HTMLElement>('[data-hero-preview]')];
 let detailAnimations:Animation[]=[],ghost:HTMLElement|undefined;
 const clearDetails=()=>{detailAnimations.forEach(a=>a.cancel());detailAnimations=[];ghost?.remove();ghost=undefined;};
 let heroScroll=0;
 let suppressFocus=false,pinned=false,open=false,selected='d2l-world',closeTimer=0,animation:Animation|undefined,flight:Animation|undefined,version=0,trigger:HTMLElement=toggle,anchor:DOMRect|undefined;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||root.dataset.motion==='reduced'||root.querySelector('[data-pause]')?.getAttribute('aria-pressed')==='true';
 const emit=(mode:string)=>root.dispatchEvent(new CustomEvent('tme:scanner',{detail:{mode,target:selected}}));
 const expanded=()=>{root.querySelector<HTMLElement>('.tme-type')!.inert=open;root.querySelectorAll<HTMLElement>('[data-scanner-toggle],[data-scanner-target]').forEach(e=>e.setAttribute('aria-expanded',String(open)));};
 const show=(pin=false,source:HTMLElement=toggle)=>{if(root.dataset.scene&&root.dataset.scene!=='perspective')return;clearTimeout(closeTimer);trigger=source;pinned=pinned||pin;if(open){root.dataset.scanner=pinned?'pinned':'preview';return;}version++;animation?.cancel();open=true;heroScroll=root.querySelector<HTMLElement>('.tme-journey')!.scrollTop;root.querySelector<HTMLElement>('.tme-journey')!.scrollTop=0;anchor=source.getBoundingClientRect();panel.hidden=false;panel.inert=false;root.dataset.scanner=pinned?'pinned':'preview';expanded();emit('open');media.syncAutoplay();if(!reduced())animation=panel.animate([{transform:'translate3d(38px,0,0)',clipPath:'inset(0 100% 0 0)'},{transform:'none',clipPath:'inset(0)'}],{duration:460,delay:70,easing:'cubic-bezier(.2,.75,.2,1)',fill:'backwards'});};
 const close=(restore=false)=>{media.resetAll();clearTimeout(closeTimer);version++;const stamp=version,animateExit=open&&root.dataset.scene==='perspective'&&root.dataset.scanner!=='entering'&&!reduced();animation?.cancel();flight?.cancel();clearDetails();pinned=false;open=false;panel.inert=true;if(animateExit){animation=panel.animate([{transform:'none',clipPath:'inset(0)'},{transform:'translateX(28px)',clipPath:'inset(0 0 0 100%)'}],{duration:200,easing:'cubic-bezier(.4,0,.7,.3)',fill:'forwards'});void animation.finished.catch(()=>{}).then(()=>{if(!open&&stamp===version){panel.hidden=true;animation?.cancel();}});}else panel.hidden=true;root.dataset.scanner='closed';delete root.dataset.scannerBusy;expanded();status.textContent='';emit('close');if(root.dataset.scene==='perspective')root.querySelector<HTMLElement>('.tme-journey')!.scrollTop=heroScroll;if(restore){suppressFocus=true;(trigger.isConnected&&!trigger.hidden?trigger:toggle).focus({preventScroll:true});suppressFocus=false;requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!open&&stamp===version&&document.activeElement instanceof HTMLElement&&root.querySelector('.tme-type')?.contains(document.activeElement))document.activeElement.scrollIntoView({block:'nearest',behavior:'instant'});}));}};
 const scheduleClose=()=>{clearTimeout(closeTimer);if(!pinned&&!panel.contains(document.activeElement))closeTimer=window.setTimeout(()=>close(),260);};
 const select=(id:string)=>{if(!previews.some(p=>p.dataset.heroPreview===id))return;const changed=id!==selected;if(changed)media.resetAll();const outgoing=changed&&open?previews.find(p=>!p.hidden)?.querySelector<HTMLElement>('.tme-curated-art')?.cloneNode(true) as HTMLElement|undefined:undefined;if(changed&&root.dataset.scannerBusy==='true'){version++;delete root.dataset.scannerBusy;status.textContent='';}selected=id;
  for(const button of links){const active=button.dataset.heroProject===id;button.dataset.selected=String(active);button.setAttribute('aria-pressed',String(active));}
  for(const preview of previews)preview.hidden=preview.dataset.heroPreview!==id;
  root.dataset.heroSelected=id;root.dispatchEvent(new CustomEvent('tme:perspective',{detail:id}));media.syncAutoplay();
  clearDetails();if(changed&&open){emit('select');if(!reduced()){
   const active=previews.find(p=>!p.hidden)!,image=active.querySelector<HTMLElement>('.tme-curated-art')!;
   if(outgoing){outgoing.classList.remove('tme-video-active');outgoing.querySelectorAll('video').forEach(v=>v.remove());outgoing.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));ghost=outgoing;outgoing.classList.add('tme-scan-outgoing');outgoing.setAttribute('aria-hidden','true');outgoing.inert=true;image.append(outgoing);const departure=outgoing.animate([{transform:'translateY(0) scale(1)'},{transform:'translateY(-22px) scale(1.025)',opacity:0}],{duration:250,easing:'cubic-bezier(.3,0,.5,1)'});detailAnimations.push(departure);void departure.finished.catch(()=>{}).then(()=>outgoing.remove());}
   for(const child of [...image.children])if(child!==outgoing)detailAnimations.push(child.animate([{transform:'translateY(26px) scale(1.025)',clipPath:'inset(8% 0 0 0)'},{transform:'none',clipPath:'inset(0)'}],{duration:420,easing:'cubic-bezier(.2,.75,.2,1)'}));
   active.querySelectorAll<HTMLElement>('.tme-scanner-project,.tme-scanner-challenge,.tme-scanner-contribution').forEach((element,i)=>detailAnimations.push(element.animate([{transform:'translateY(12px)',clipPath:'inset(0 0 100% 0)'},{transform:'none',clipPath:'inset(0)'}],{duration:310,delay:i*35,easing:'cubic-bezier(.2,.75,.2,1)',fill:'backwards'})));
  }}
 };
 for(const button of links){button.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')select(button.dataset.heroProject!);},{signal});button.addEventListener('focus',()=>select(button.dataset.heroProject!),{signal});button.addEventListener('click',()=>select(button.dataset.heroProject!),{signal});}
 toggle.addEventListener('click',()=>{if(open&&pinned)close(true);else{show(true,toggle);links.find(b=>b.dataset.heroProject===selected)?.focus({preventScroll:true});panel.scrollIntoView({block:'nearest',behavior:'instant'});}},{signal});
 panel.querySelector('[data-scanner-close]')!.addEventListener('click',()=>close(true),{signal});
 root.addEventListener('pointerover',e=>{const target=(e.target as Element).closest<HTMLElement>('[data-scanner-target]');if(target&&(e as PointerEvent).pointerType==='mouse')show(false,target);},{signal});
 document.addEventListener('pointermove',e=>{if(!open||pinned||e.pointerType!=='mouse'||!anchor)return;const r=panel.getBoundingClientRect(),left=Math.min(r.left,anchor.left)-35,right=Math.max(r.right,anchor.right)+35,top=Math.min(r.top,anchor.top)-35,bottom=Math.max(r.bottom,anchor.bottom)+35;if(e.clientX>=left&&e.clientX<=right&&e.clientY>=top&&e.clientY<=bottom)clearTimeout(closeTimer);else scheduleClose();},{passive:true,signal});
 root.addEventListener('click',e=>{const target=(e.target as Element).closest<HTMLElement>('[data-scanner-target]');if(target){show(true,target);panel.scrollIntoView({block:'nearest',behavior:'instant'});}},{signal});
 root.addEventListener('focusin',e=>{if(suppressFocus)return;const target=(e.target as Element).closest<HTMLElement>('[data-scanner-target]');if(target)show(true,target);},{signal});
 panel.addEventListener('pointerenter',()=>clearTimeout(closeTimer),{signal});panel.addEventListener('pointerdown',()=>{pinned=true;root.dataset.scanner='pinned';clearTimeout(closeTimer);},{signal});panel.addEventListener('focusin',()=>{pinned=true;root.dataset.scanner='pinned';clearTimeout(closeTimer);},{signal});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open&&!root.querySelector('dialog[open]')){e.preventDefault();close(true);}},{signal});
 document.addEventListener('pointerdown',e=>{if(open&&!panel.contains(e.target as Node)&&!(e.target as Element).closest('[data-scanner-target],[data-scanner-toggle]'))close();},{signal});
 // Capture the existing project action before chapter routing. Image readiness precedes the camera.
 root.addEventListener('click',async e=>{const a=(e.target as Element).closest<HTMLAnchorElement>('[data-scan-enter]');if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();e.stopImmediatePropagation();if(root.dataset.scannerBusy==='true')return;
  media.resetAll();const id=a.hash.slice(1),token=++version;root.dataset.scannerBusy='true';status.textContent='Preparing '+previews.find(p=>p.dataset.heroPreview===id)?.querySelector('h3')?.textContent+'…';emit('enter');
  let ready=false;if(root.dataset.ready==='true'&&!reduced())ready=await new Promise<boolean>(resolve=>{const timeout=window.setTimeout(()=>resolve(false),8000);root.dispatchEvent(new CustomEvent('tme:prepare-project',{detail:{target:id,ready:(ok:boolean)=>{clearTimeout(timeout);resolve(ok);}}}));});
  if(token!==version)return;
  if(ready&&!reduced()){
   root.dataset.scanner='entering';const r=panel.getBoundingClientRect(),x=Number(root.dataset.glassesX)||innerWidth*.6,y=Number(root.dataset.glassesY)||innerHeight*.45;
   flight=panel.animate([{transform:'none',clipPath:'inset(0)'},{transform:`translate(${(x-r.x-r.width/2)*.55}px,${(y-r.y-r.height/2)*.55}px) scale(.25)`,clipPath:'inset(40% 0 40% 0)'}],{duration:240,easing:'cubic-bezier(.55,0,.8,.4)',fill:'forwards'});await flight.finished.catch(()=>{});if(token!==version)return;
  }
  close();root.dispatchEvent(new CustomEvent(ready&&!reduced()?'tme:scanner-travel':'tme:scene-request',{detail:id}));
 },{capture:true,signal});
 root.addEventListener('tme:scene',e=>{const id=(e as CustomEvent<string>).detail;if(id!=='perspective')close();if(links.some(a=>a.dataset.heroProject===id))select(id);},{signal});
 root.addEventListener('tme:scanner-dismiss',()=>{if(open&&!pinned)close();},{signal});
 root.addEventListener('tme:reader',e=>{if((e as CustomEvent).detail)close();},{signal});
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>{animation?.cancel();flight?.cancel();clearDetails();},{signal});
 let previousReduced=reduced();const motionWatch=new MutationObserver(()=>{const next=reduced();if(next&&!previousReduced){animation?.cancel();flight?.cancel();clearDetails();media.resetAll();}previousReduced=next;});motionWatch.observe(root,{attributes:true,attributeFilter:['data-motion']});signal.addEventListener('abort',()=>motionWatch.disconnect(),{once:true});
 window.addEventListener('pagehide',e=>{if(!e.persisted)abort.abort();},{signal});import.meta.hot?.dispose(()=>abort.abort());
 root.dataset.scannerReady='true';close();select(selected);
}
