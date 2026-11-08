/** One viewport, one active scene. Native dialogs own scrolling while work is explored.
 * Lens progress is sent to the existing Three.js camera, never a CSS enlargement.
 */
const root=document.querySelector<HTMLElement>('[data-tme]');
if(root){
 const abort=new AbortController(),{signal}=abort,media=matchMedia('(prefers-reduced-motion: reduce)');
 const main=root.querySelector('main')!,hero=root.querySelector<HTMLElement>('.tme-journey')!,selection=root.querySelector<HTMLElement>('#project-selection')!;
 const ids=['perspective','through-lens','d2l-world','chapter-ring','chapter-community','chapter-align','beyond-the-screen'];
 const titles=['The Observer','Through the Lens','Clarity','Possibility','Connection','Judgment','Beyond the Screen'];
 const projectNames=['Introduction','Camera journey','D2L Redesign','Apple Ring','Community Spaces','ALIGN','About & Contact'];
 let lensDestination=2,wheelConsumed=false,lastMagnitude=0,decayCount=0,momentumTail=false;
 const wheelQuietMs=240;
 let current=0,lens=0,travelBusy=false,queuedWheel=0,wheelDistance=0,lastWheelAt=0,lastWheelDirection=0,touchY=0,touchStartTop=0,touchStartBottom=false,transition=0,lensFrame=0,lensTarget=0,lensDrive:'idle'|'wheel'|'auto'='idle',readerOpen=false,players:Animation[]=[];
 let scrubFrame=0,settleTimer=0;
 let edge:{from:number;to:number;progress:number;target:number;input:number;tracks:Animation[];settling:boolean}|null=null;
 let reduced=()=>media.matches||root.dataset.motion==='reduced'||root.querySelector('[data-pause]')?.getAttribute('aria-pressed')==='true';
 const emit=(name:string,detail:any)=>root.dispatchEvent(new CustomEvent(name,{detail}));
 const closing=root.querySelector<HTMLElement>('.tme-journey-close')!;
 const ending=document.createElement('section');ending.id=ids[6];ending.className='tme-ending-scene';ending.tabIndex=-1;ending.setAttribute('aria-label',titles[6]);
 const bio=closing.querySelector<HTMLElement>('[data-closing-bio]')!;
 ending.append(bio,closing);main.append(ending);
 const panels=[hero,hero,...ids.slice(2,6).map(id=>document.getElementById(id)!),ending];
 const unique=[...new Set(panels)];
 // Retain the original content once. Deeper evidence belongs in an explorable native reader.
 const evidence=new Map<HTMLElement,HTMLDialogElement>();
 for(const index of[2,3,4,5]){
  const panel=panels[index],opening=panel.querySelector<HTMLElement>(index===2?'.tme-world-intro':index===3?'.tme-ring-opening':index===4?'.tme-community-story':'.tme-align-opening')!;
  panel.querySelector(':scope>.tme-world-nav,:scope>.tme-chapter-bar')?.remove();
  const dialog=document.createElement('dialog');dialog.className='tme-scene-evidence';dialog.setAttribute('aria-label',projectNames[index]+' project evidence');
  const bar=document.createElement('header');bar.innerHTML=`<h2>${projectNames[index]} / Explore the work</h2><button type="button" data-evidence-close>Return to scene ×</button>`;dialog.append(bar);
  const body=document.createElement('div');body.className='tme-evidence-body';dialog.append(body);
  for(const child of[...panel.children])if(child!==opening)body.append(child);
  if(index===4){const context=opening.querySelector('.tme-spatial-context');if(context)body.prepend(context);}
  panel.append(dialog);evidence.set(panel,dialog);
  const button=document.createElement('button');button.type='button';button.className='tme-scene-explore';button.textContent='How this was designed ↗';
  const detail=panel.querySelector<HTMLElement>('.tme-opening-detail');(detail||opening).append(button);
  let evidenceTrigger:HTMLElement=button;const open=(trigger:HTMLElement=button)=>{if(dialog.open)return;evidenceTrigger=trigger;dialog.showModal();emit('tme:reader',true);};button.addEventListener('click',()=>open(button),{signal});
  dialog.querySelector('[data-evidence-close]')!.addEventListener('click',()=>dialog.close(),{signal});
  dialog.addEventListener('close',()=>{emit('tme:reader',Boolean(root.querySelector('dialog[open]')));evidenceTrigger.focus({preventScroll:true});},{signal});
  // Existing anchor links into local demonstrations keep their original targets and controls.
  panel.addEventListener('click',event=>{const a=(event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');if(!a||event.defaultPrevented||!a.hash)return;const target=document.getElementById(a.hash.slice(1));if(target&&body.contains(target)){event.preventDefault();open(a);requestAnimationFrame(()=>{if(!dialog.open)return;target.scrollIntoView({block:'start'});if(!target.contains(document.activeElement)){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}});}},{signal});
 }
 // One persistent chapter system. The existing project exhibition becomes its index.
 const indexDialog=document.createElement('dialog');indexDialog.className='tme-scene-index';indexDialog.setAttribute('aria-label','Journey chapter index');
 const indexTop=document.createElement('header');indexTop.innerHTML='<strong>Chapter index</strong><a href="/">Standard portfolio ↗</a><button type="button">Close index ×</button>';indexDialog.append(indexTop);
 const shortcuts=document.createElement('nav');shortcuts.setAttribute('aria-label','All seven chapters');shortcuts.className='tme-scene-shortcuts';
 ids.forEach((id,i)=>{const a=document.createElement('a');a.href='#'+id;a.textContent=`0${i} / ${titles[i]}`;shortcuts.append(a);});indexDialog.append(shortcuts,selection);root.append(indexDialog);
 indexTop.querySelector('button')!.addEventListener('click',()=>indexDialog.close(),{signal});
 const nav=document.createElement('nav');nav.className='tme-scene-nav';nav.setAttribute('aria-label','Journey chapters');nav.innerHTML='<a class="tme-scene-brand" href="#perspective" aria-label="Through My Eyes introduction">SK</a><div class="tme-scene-position"><span data-scene-number>00 / 06</span><strong data-scene-title>The Observer</strong><progress max="6" value="0" aria-label="Journey chapter progress"></progress></div><button type="button" data-scene-prev aria-label="Previous chapter">←</button><button type="button" data-scene-index aria-label="Chapter index">Chapters</button><button type="button" data-scene-next aria-label="Next chapter">→</button>';
 root.append(nav);
 const prev=nav.querySelector<HTMLButtonElement>('[data-scene-prev]')!,next=nav.querySelector<HTMLButtonElement>('[data-scene-next]')!;
 let indexTrigger:HTMLElement|null=null,indexNavigation=false;
 const openIndex=()=>{indexTrigger=document.activeElement as HTMLElement;indexDialog.showModal();emit('tme:reader',true);selection.focus({preventScroll:true});};
 nav.querySelector('[data-scene-index]')!.addEventListener('click',openIndex,{signal});indexDialog.addEventListener('close',()=>{emit('tme:reader',Boolean(root.querySelector('dialog[open]')));if(current===1&&!root.querySelector('dialog[open]'))camera(lens);if(!indexNavigation&&indexTrigger?.isConnected)(indexTrigger.closest('[data-signature-opening]')?root.querySelector<HTMLElement>('.tme-enter'):indexTrigger)?.focus({preventScroll:true});indexNavigation=false;},{signal});
 const lensControl=document.createElement('div');lensControl.className='tme-scene-lens-control';lensControl.innerHTML='<label for="scene-camera-progress">Through the lens <span>Scroll or adjust the camera</span></label><input id="scene-camera-progress" type="range" min="0" max="100" value="0" aria-label="Lens camera progress"/><button type="button">Continue to Clarity ↗</button>';
 hero.append(lensControl);const range=lensControl.querySelector<HTMLInputElement>('input')!;
 const status=document.createElement('p');status.className='sr-only';status.setAttribute('role','status');status.setAttribute('aria-live','polite');root.append(status);
 const cancel=()=>{cancelAnimationFrame(scrubFrame);scrubFrame=0;clearTimeout(settleTimer);edge?.tracks.forEach(a=>a.cancel());edge=null;delete root.dataset.transitionProgress;delete root.dataset.transitionPair;cancelAnimationFrame(lensFrame);lensFrame=0;lensDrive='idle';players.forEach(a=>a.cancel());players=[];unique.forEach(p=>{p.style.visibility='';p.style.zIndex='';});travelBusy=false;queuedWheel=0;wheelDistance=0;root.dataset.sceneTravel='idle';root.dataset.scrollPending='false';nav.querySelector('progress')!.value=current===1?1+lens:current;transition++;};
 const camera=(p:number)=>{root.dataset.lensDestination=ids[lensDestination];lensControl.querySelector('button')!.textContent=`Continue to ${projectNames[lensDestination]} ↗`;lens=Math.max(0,Math.min(1,p));range.value=String(Math.round(lens*100));if(current===1)nav.querySelector('progress')!.value=1+lens;root.style.setProperty('--scene-lens',String(lens));emit('tme:camera',{active:current===1&&!reduced()&&root.dataset.ready==='true',progress:lens,target:ids[lensDestination]});};
 const update=()=>{root.dataset.scene=ids[current];root.dataset.sceneIndex=String(current);nav.querySelector('[data-scene-number]')!.textContent=`0${current} / 06`;nav.querySelector('[data-scene-title]')!.textContent=titles[current];nav.querySelector('progress')!.value=current;prev.disabled=current===0;next.disabled=current===6;lensControl.hidden=current!==1;status.textContent=`0${current}. ${titles[current]}. ${projectNames[current]}.`;shortcuts.querySelectorAll('a').forEach((a,i)=>{if(i===current)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});};
 const setScene=(index:number,options:{instant?:boolean;history?:boolean;focus?:boolean;lens?:number;destination?:number}={})=>{
  index=Math.max(0,Math.min(6,index));
  // Every entry method derives a journey target here, rather than inheriting the last scanner choice.
  const destination=options.destination??(index>=2&&index<=5?index:index===1&&current>=2&&current<=5?current:index===1&&current===1?lensDestination:2);
  lensDestination=Math.max(2,Math.min(5,destination));
  if(index===1&&reduced())index=options.lens===1?0:lensDestination;
  cancel();const old=panels[current],oldIndex=current;if(index!==current)wheelConsumed=true;current=index;const incoming=panels[index];
  root.querySelectorAll<HTMLDialogElement>('.tme-scene-evidence[open]').forEach(d=>d.close());
  if(indexDialog.open){indexNavigation=true;indexDialog.close();}
  emit('tme:navigate',null);
  unique.forEach(p=>{const active=p===incoming;p.dataset.sceneActive=String(active);p.inert=!active;p.setAttribute('aria-hidden',String(!active));});
  if(index!==oldIndex){
   if(options.history!==false)history.replaceState({...history.state,tmeScene:ids[oldIndex],tmeTop:old.scrollTop,tmeLensDestination:oldIndex>=2&&oldIndex<=5?oldIndex:lensDestination,tmeLensProgress:lens},'');
   // Chapter controls enter at the opening; browser history still restores its saved position.
   incoming.scrollTop=options.history===false?(history.state?.tmeScene===ids[index]?history.state.tmeTop:incoming.scrollTop):0;
  }
  update();emit('tme:scene',ids[index]);camera(index===1?(options.lens??(oldIndex>1?1:0)):0);lensTarget=lens;
  if(options.history!==false)history.pushState({tmeScene:ids[index],tmeTop:incoming.scrollTop,tmeLensDestination:lensDestination,tmeLensProgress:lens},'','#'+ids[index]);
  const direction=index>=oldIndex?1:-1;
  if(old!==incoming&&!options.instant&&!reduced()){
   const duration=innerWidth<=700?300:500,id=transition;
   travelBusy=true;root.dataset.sceneTravel='moving';
   old.style.visibility='visible';old.style.zIndex='1';old.inert=true;incoming.style.zIndex='2';
   // A shared vertical/depth direction replaces the former full-width sideways spin.
   const out=old.animate([{transform:'translate3d(0,0,0) scale(1)'},{transform:`translate3d(0,${-direction*4}vh,-80px) scale(.985)`}],{duration,easing:'cubic-bezier(.3,0,.2,1)'});
   const enter=incoming.animate([{transform:`translate3d(0,${direction*3.5}vh,35px) scale(1.012)`,clipPath:direction>0?'inset(100% 0 0 0)':'inset(0 0 100% 0)'},{transform:'translate3d(0,0,0) scale(1)',clipPath:'inset(0 0 0 0)'}],{duration,easing:'cubic-bezier(.22,.68,.18,1)'});players=[out,enter];
   const art=incoming.querySelector<HTMLElement>('.tme-world-intro>.tme-artifact,.tme-ring-opening>figure,.tme-community-story>.tme-state-viewer,.tme-align-opening>figure');
   if(art)players.push(art.animate([{transform:`translate3d(0,${direction*18}px,18px) scale(1.008)`},{transform:'none'}],{duration:duration+60,easing:'cubic-bezier(.22,.68,.18,1)'}));
   const story=incoming.querySelector<HTMLElement>('.tme-world-intro>div:first-child,.tme-ring-opening>div:first-child,.tme-community-opening,.tme-align-opening>div:first-child');
   if(story){const cues=[story.querySelector('.tme-eyebrow'),story.querySelector('h2'),story.querySelector('h2+p')];cues.forEach((element,i)=>{if(element)players.push(element.animate([{transform:`translateY(${direction*(i===1?16:10)}px)`,clipPath:'inset(0 0 100% 0)'},{transform:'none',clipPath:'inset(0)'}],{duration:duration-90,delay:60+i*35,easing:'cubic-bezier(.2,.75,.2,1)',fill:'backwards'}));});}
   void Promise.allSettled(players.map(a=>a.finished)).then(()=>{if(id!==transition)return;old.style.visibility='';old.style.zIndex='';incoming.style.zIndex='';players=[];travelBusy=false;root.dataset.sceneTravel='idle';flushWheel();});
  }

  // Remove inline travel overrides even when a direct jump cancels an animation.
  unique.filter(p=>!travelBusy||p!==old&&p!==incoming).forEach(p=>{p.style.visibility='';p.style.zIndex='';});
  if(options.focus!==false||old!==incoming&&old.contains(document.activeElement)){const target=index===1?range:index===0?root.querySelector<HTMLElement>('.tme-enter')!:incoming;target.setAttribute('tabindex',target.tabIndex<0?'-1':String(target.tabIndex));target.focus({preventScroll:true});}
 };
 const glide=(destination:number)=>{if(reduced()||root.dataset.ready!=='true'){setScene(destination);return;}cancel();lensDrive='auto';const token=transition,from=lens,to=destination===0?0:1,start=performance.now(),duration=innerWidth<=700?550:900;const tick=(now:number)=>{if(token!==transition)return;const t=Math.min(1,(now-start)/duration),e=t*t*(3-2*t);camera(from+(to-from)*e);if(t<1)lensFrame=requestAnimationFrame(tick);else{lensFrame=0;lensDrive='idle';setScene(destination,{instant:true});}};lensFrame=requestAnimationFrame(tick);};
 const stepNow=(direction:number)=>{if(current===0&&direction>0)lensDestination=2;if(current===0&&direction<0||current===6&&direction>0)return;if(current===1){glide(direction>0?lensDestination:0);return;}setScene(current+direction,{lens:direction<0?1:0});if(current===1&&innerWidth<=700)glide(direction>0?lensDestination:0);};
 const queueStep=(direction:number)=>{if(queuedWheel===direction)return;queuedWheel=direction;root.dataset.scrollPending='true';const target=Math.max(0,Math.min(6,current+direction));status.textContent=`${direction>0?'Continuing to':'Returning to'} ${titles[target]}.`;};
 const step=(direction:number)=>{if(travelBusy){queueStep(direction);return;}stepNow(direction);};
 prev.addEventListener('click',()=>step(-1),{signal});next.addEventListener('click',()=>step(1),{signal});lensControl.querySelector('button')!.addEventListener('click',()=>glide(lensDestination),{signal});range.addEventListener('input',()=>{cancelAnimationFrame(lensFrame);lensFrame=0;lensDrive='idle';camera(Number(range.value)/100);lensTarget=lens;},{signal});
 const resolve=(id:string)=>{if(id==='project-selection'){openIndex();return;}let i=ids.indexOf(id);if(i<0){const target=document.getElementById(id);if(!target)return;const parent=unique.find(p=>p.contains(target));if(!parent)return;i=panels.indexOf(parent);setScene(i,{instant:true});const dialog=target.closest<HTMLDialogElement>('dialog.tme-scene-evidence');if(dialog&&!dialog.open){dialog.showModal();emit('tme:reader',true);}target.scrollIntoView({block:'start'});return;}setScene(i,{lens:0,destination:i===1?2:undefined});};
 root.addEventListener('tme:scanner-travel',e=>{const target=ids.indexOf((e as CustomEvent<string>).detail);if(target<2||target>5)return;lensDestination=target;setScene(1,{destination:target});if(current===1)glide(target);},{signal});
 root.addEventListener('tme:scene-request',e=>{const id=(e as CustomEvent<string>).detail;if(id==='through-lens'){lensDestination=2;setScene(1);if(current===1)glide(2);}else resolve(id);},{signal});
 root.addEventListener('tme:reader',e=>{readerOpen=Boolean((e as CustomEvent).detail);if(readerOpen){cancel();unique.forEach(p=>{p.style.visibility='';p.style.zIndex='';});}},{signal});
 // Capture only navigation anchors; form fields, prototype readers and external links remain native.
 root.addEventListener('click',event=>{const a=(event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');if(!a||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;if(a.hasAttribute('data-scan-enter'))return;const id=a.hasAttribute('data-enter')?'through-lens':a.hash.slice(1);if(ids.includes(id)||id==='project-selection'){event.preventDefault();event.stopImmediatePropagation();if(a.hasAttribute('data-enter')){lensDestination=2;setScene(1);if(current===1)glide(2);}else if(a.hasAttribute('data-return')&&panels[2].contains(a)){setScene(1,{instant:true,lens:1});if(current===1)glide(0);}else resolve(id);}},{capture:true,signal});
 // Wheel ownership belongs to real interactive/scrolling surfaces, not decorative previews or buttons.
 const blocked=(target:EventTarget|null)=>['pinned','entering'].includes(root.dataset.scanner||'')||readerOpen||Boolean(root.querySelector('dialog[open]'))||target instanceof Element&&Boolean(target.closest('input:not([type=range]),textarea,select,[contenteditable],iframe'));
 const flushWheel=()=>{
  if(!queuedWheel||travelBusy||readerOpen||root.querySelector('dialog[open]'))return;
  const direction=queuedWheel;queuedWheel=0;wheelDistance=0;root.dataset.scrollPending='false';step(direction);
 };
 const scrollLens=(delta:number)=>{
  if(lensDrive!=='wheel'){cancelAnimationFrame(lensFrame);lensFrame=0;lensTarget=lens;lensDrive='wheel';}
  lensTarget=Math.max(0,Math.min(1,lensTarget+delta/950));
  if(lensFrame)return;
  let last=performance.now();
  const tick=(now:number)=>{
   const dt=Math.min((now-last)/1000,.05);last=now;
   const nextLens=lens+(lensTarget-lens)*(1-Math.exp(-dt*18));
   const settled=Math.abs(lensTarget-nextLens)<.002;camera(settled?lensTarget:nextLens);
   if(!settled){lensFrame=requestAnimationFrame(tick);return;}
   lensFrame=0;lensDrive='idle';if(lens===0||lens===1)setScene(lens===1?lensDestination:0,{instant:true,focus:false});
  };lensFrame=requestAnimationFrame(tick);
 };
 const canScroll=(element:HTMLElement,direction:number)=>direction>0?element.scrollTop+element.clientHeight<element.scrollHeight-2:element.scrollTop>2;
 // A single reversible edge owns both scenes. Paused WAAPI tracks are scrubbed by
 // elapsed-time interpolation; no second wheel controller or accumulating timers.
 const createEdge=(direction:number)=>{
  const to=current+direction;if(to<0||to>6)return;
  if(current===0&&direction>0){lensDestination=2;setScene(1,{instant:true,focus:false,lens:0});scrollLens(90);return;}
  if(current===2&&direction<0){lensDestination=2;setScene(1,{instant:true,focus:false,lens:1});scrollLens(-90);return;}
  const from=panels[current],into=panels[to];if(from===into)return;
  cancel();edge={from:current,to,progress:0,target:0,input:0,tracks:[],settling:false};
  root.dataset.sceneTravel='scrubbing';root.dataset.transitionPair=`${ids[Math.min(current,to)]}:${ids[Math.max(current,to)]}`;
  into.style.visibility='visible';into.style.zIndex='2';into.inert=true;from.style.zIndex='1';
  const backwards=direction<0,pair=Math.min(current,to),ease='linear';
  into.scrollTop=0;
  // Canonical forward choreography is played backward on the same edge.
  const track=(element:Element,frames:Keyframe[])=>{const a=element.animate(backwards?[...frames].reverse():frames,{duration:1000,fill:'both',easing:ease});a.pause();a.currentTime=0;edge!.tracks.push(a);};
  const outgoing=backwards?into:from,incoming=backwards?from:into;
  const circle=pair===3;
  track(outgoing,[{transform:'translate3d(0,0,0) scale(1)',clipPath:'inset(0)'},{transform:`translate3d(${pair===4?'-7%':'0'},-7vh,0) scale(${pair===2?'.86':'.94'})`,clipPath:'inset(0)'}]);
  track(incoming,[{transform:`translate3d(${pair===4?'8%':'0'},${pair===5?'16':'7'}vh,0) scale(${pair===2?'1.08':'1.025'})`,clipPath:circle?'circle(0% at 68% 48%)':pair===2?'inset(0 0 0 100%)':'inset(100% 0 0 0)'},{transform:'translate3d(0,0,0) scale(1)',clipPath:circle?'circle(150% at 68% 48%)':'inset(0)'}]);
  // Reverse transitions must reveal the previous layer above the current layer.
  outgoing.style.zIndex='1';incoming.style.zIndex='2';
  const art=incoming.querySelector('.tme-ring-opening>figure,.tme-community-story>.tme-state-viewer,.tme-align-opening>figure');
  if(art)track(art,[{transform:`translateY(${pair===4?'32':'18'}px) scale(1.025)`},{transform:'none'}]);
  const heading=incoming.querySelector('h2');if(heading)track(heading,[{transform:'translateY(28px)',clipPath:'inset(0 0 100% 0)'},{transform:'none',clipPath:'inset(0)'}]);
 };
 const driveEdge=()=>{
  if(scrubFrame||!edge)return;let last=performance.now();
  const tick=(now:number)=>{
   scrubFrame=0;const active=edge;if(!active)return;
   const dt=Math.min(.05,(now-last)/1000);last=now;
   active.progress+=(active.target-active.progress)*(1-Math.exp(-dt*22));
   if(Math.abs(active.target-active.progress)<.002)active.progress=active.target;
   active.tracks.forEach(a=>a.currentTime=active.progress*1000);
   root.dataset.transitionProgress=active.progress.toFixed(3);
   nav.querySelector('progress')!.value=active.from+(active.to-active.from)*active.progress;
   if(active.progress===1||active.settling&&active.progress===active.target){
    const destination=active.target===1?active.to:active.from;
    setScene(destination,{instant:true,focus:false,history:destination!==current});wheelConsumed=true;return;
   }
   if(active.progress!==active.target)scrubFrame=requestAnimationFrame(tick);
  };scrubFrame=requestAnimationFrame(tick);
 };
 const scrub=(delta:number)=>{
  if(!edge)createEdge(Math.sign(delta));if(!edge)return;
  // Settling promotes the visual target, never the gesture's position. Reversal must
  // undo the actual input even if the completion animation has already moved farther.
  edge.settling=false;
  edge.input=Math.max(0,Math.min(1,edge.input+Math.sign(delta)*Math.min(Math.abs(delta),180)*Math.sign(edge.to-edge.from)/620));
  edge.target=edge.input;
  driveEdge();clearTimeout(settleTimer);
  settleTimer=window.setTimeout(()=>{if(!edge)return;edge.settling=true;edge.target=edge.input>.12?1:0;driveEdge();},240);
 };
 const wheel=(e:WheelEvent)=>{
  if(e.defaultPrevented||e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)||blocked(e.target))return;
  if(root.dataset.scanner==='preview'){
   if(e.target instanceof Element&&e.target.closest('#hero-projects'))return;
   emit('tme:scanner-dismiss',null);
  }
  const panel=panels[current],direction=Math.sign(e.deltaY);if(!direction)return;
  const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?panel.clientHeight:1),now=performance.now();
  const freshGesture=direction!==lastWheelDirection||now-lastWheelAt>wheelQuietMs;
  const magnitude=Math.abs(delta);
  if(freshGesture){wheelConsumed=false;wheelDistance=0;decayCount=0;momentumTail=false;}
  else if(magnitude>lastMagnitude*1.2&&magnitude>10){decayCount=0;momentumTail=false;}
  else if(magnitude<lastMagnitude*.98){decayCount++;if(decayCount>=3||wheelConsumed&&magnitude<lastMagnitude*.5)momentumTail=true;}
  lastMagnitude=magnitude;
  lastWheelAt=now;lastWheelDirection=direction;
  // An in-flight edge reverses immediately instead of first scrolling the source panel.
  if(edge){e.preventDefault();scrub(delta);return;}
  let node=e.target instanceof HTMLElement?e.target:null;
  while(node&&node!==root){
   if(node!==panel&&node.scrollHeight>node.clientHeight+3&&/auto|scroll/.test(getComputedStyle(node).overflowY)){
    // Nested interactive surfaces retain wheel ownership even at their boundaries.
    wheelConsumed=true;root.dataset.wheelGesture='reading';return;
   }
   node=node.parentElement;
  }
  if(panel.scrollHeight>panel.clientHeight+3&&canScroll(panel,direction)){
   wheelConsumed=true;wheelDistance=0;root.dataset.wheelGesture='reading';
   if(!(e.target instanceof Node&&panel.contains(e.target))){e.preventDefault();panel.scrollBy({top:delta,behavior:'instant'});}return;
  }
  e.preventDefault();
  if(current===1&&!reduced()&&root.dataset.ready==='true'){scrollLens(delta);return;}
  // Deliberate input can continue without a pause or click. Only a decaying
  // momentum tail is held at an arrival/reading boundary. A new burst or reversal re-arms immediately.
  if(wheelConsumed&&momentumTail){root.dataset.wheelGesture='momentum-tail';return;}
  if(travelBusy)cancel();
  if(!reduced()){scrub(delta);return;}
  wheelDistance+=Math.min(Math.abs(delta),160)*direction;if(Math.abs(wheelDistance)<55)return;
  wheelDistance=0;wheelConsumed=true;step(direction);
 };
 // Chromium can retarget a stationary trackpad gesture to body when its old
 // hit-tested scene becomes inert. Own input at the page, independent of focus.
 window.addEventListener('wheel',wheel,{capture:true,passive:false,signal});
 let touchOwned=false,touchLast=0;
 main.addEventListener('touchstart',e=>{
  touchOwned=false;if(blocked(e.target))return;
  const target=e.target instanceof Element?e.target:null;
  if(target?.closest('button,a,input,video,[data-state-viewer]'))return;
  touchY=touchLast=e.touches[0]?.clientY??0;touchStartTop=panels[current].scrollTop;touchStartBottom=panels[current].scrollTop+panels[current].clientHeight>=panels[current].scrollHeight-3;touchOwned=true;wheelConsumed=false;
 },{passive:true,signal});
 main.addEventListener('touchmove',e=>{
  if(!touchOwned||blocked(e.target)||reduced())return;
  const y=e.touches[0]?.clientY??touchLast,delta=touchLast-y;touchLast=y;
  if(!edge&&(canScroll(panels[current],Math.sign(delta))||delta>0&&!touchStartBottom||delta<0&&touchStartTop>0))return;
  e.preventDefault();if(current===1){scrollLens(delta*2);return;}scrub(delta*2);
 },{passive:false,signal});
 main.addEventListener('touchend',e=>{
  if(!touchOwned||blocked(e.target))return;touchOwned=false;
  if(edge)return;const dy=touchY-(e.changedTouches[0]?.clientY??touchY),p=panels[current];
  if(!reduced()||Math.abs(dy)<70)return;
  const bottom=p.scrollTop+p.clientHeight>=p.scrollHeight-3,top=touchStartTop<=0&&p.scrollTop<=0;
  if(dy>0&&bottom&&touchStartBottom)step(1);else if(dy<0&&top)step(-1);
 },{passive:true,signal});
 // Restrained depth on the product still; its linked prototype remains the interactive hardware concept.
 const product=panels[3].querySelector<HTMLElement>('.tme-ring-opening>figure')!;
 product.addEventListener('pointermove',e=>{if(reduced()||e.pointerType!=='mouse')return;const r=product.getBoundingClientRect();product.style.setProperty('--product-x',`${-(e.clientY-r.top-r.height/2)/r.height*6}deg`);product.style.setProperty('--product-y',`${(e.clientX-r.left-r.width/2)/r.width*7}deg`);},{passive:true,signal});
 product.addEventListener('pointerleave',()=>{product.style.setProperty('--product-x','0deg');product.style.setProperty('--product-y','0deg');},{signal});
 const historyScene=()=>{const id=decodeURIComponent(location.hash.slice(1)),i=ids.indexOf(id);if(i>=0)setScene(i,{instant:true,history:false,lens:history.state?.tmeLensProgress,destination:history.state?.tmeLensDestination});else if(id)resolve(id);};
 window.addEventListener('popstate',historyScene,{signal});
 media.addEventListener('change',()=>{cancel();if(current===1)setScene(2,{instant:true});},{signal});
 let wasReduced=reduced();
 const motion=new MutationObserver(()=>{const nowReduced=reduced();if(nowReduced&&!wasReduced){cancel();if(current===1)setScene(2,{instant:true});}wasReduced=nowReduced;if(current===1&&root.dataset.ready==='true')camera(lens);});motion.observe(root,{attributes:true,attributeFilter:['data-motion','data-ready']});
 unique.forEach(p=>p.classList.add('tme-scene-panel'));root.dataset.cinematic='true';
 unique.forEach(panel=>panel.addEventListener('scroll',()=>{if(panel===panels[current]&&!edge)history.replaceState({...history.state,tmeScene:ids[current],tmeTop:panel.scrollTop,tmeLensDestination:lensDestination,tmeLensProgress:lens},'');},{passive:true,signal}));
 const initial=ids.indexOf(decodeURIComponent(location.hash.slice(1)));setScene(initial>=0?initial:0,{instant:true,history:false,focus:false});if(initial<0&&location.hash)queueMicrotask(()=>resolve(decodeURIComponent(location.hash.slice(1))));
 const cleanup=()=>{abort.abort();motion.disconnect();cancel();};window.addEventListener('pagehide',e=>{if(!e.persisted)cleanup();},{signal});import.meta.hot?.dispose(cleanup);
}
