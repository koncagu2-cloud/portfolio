/** Selected opt-in previews autoplay; other recordings remain user-started. */
export function createPrototypeVideos(panel:HTMLElement,signal:AbortSignal,available:()=>boolean=()=>true){
 const root=panel.closest<HTMLElement>('[data-tme]')!,motion=matchMedia('(prefers-reduced-motion: reduce)');
 const reduced=()=>motion.matches||root.dataset.motion==='reduced'||root.querySelector('[data-pause]')?.getAttribute('aria-pressed')==='true';
 const hosts=[...(panel.matches('[data-video-player]')?[panel]:[]),...panel.querySelectorAll<HTMLElement>('[data-video-player]')];
 const players=hosts.map(host=>{
  const video=host.querySelector<HTMLVideoElement>('video')!,button=host.querySelector<HTMLButtonElement>('[data-video-play]')!,status=host.querySelector<HTMLElement>('[data-video-status]')!,image=video.parentElement!;
  const automatic=video.hasAttribute('data-auto-preview'),progress=host.querySelector<HTMLProgressElement>('[data-video-progress]');
  const updateProgress=()=>{if(progress)progress.value=Number.isFinite(video.duration)&&video.duration>0?Math.min(1,video.currentTime/video.duration):0;};
  for(const event of ['timeupdate','loadedmetadata','seeked','emptied'])video.addEventListener(event,updateProgress,{signal});
  let wanted=false,attempt=0,manualPaused=false,autoBlocked=false;
  const label=(text:string)=>{button.textContent=text;button.setAttribute('aria-label',`${text}: ${video.dataset.projectName}`);};
  const pause=()=>{attempt++;wanted=false;video.pause();label('Play prototype preview');button.setAttribute('aria-pressed','false');button.removeAttribute('aria-busy');status.textContent='';};
  const release=()=>{pause();video.removeAttribute('src');video.load();video.hidden=true;image.classList.remove('tme-video-active');delete host.dataset.videoState;};
  // Automatic previews keep their decoded clip and position for selection/close/resume. Other media
  // retains the previous on-demand release behavior; nothing else is preloaded.
  const reset=()=>{manualPaused=false;autoBlocked=false;if(automatic)pause();else release();};
  const fail=(autoplayDenied=false)=>{
   if(autoplayDenied)pause();else release();
   autoBlocked=true;video.hidden=true;image.classList.remove('tme-video-active');host.dataset.videoState='error';
   label(autoplayDenied?'Play prototype preview':'Retry prototype preview');
   status.textContent=autoplayDenied?'Autoplay is unavailable. Press Play prototype preview to watch.':'This recording could not play. You can still open the prototype below.';
  };
  const play=async(auto=false)=>{
   wanted=true;const token=++attempt;host.dataset.videoState='loading';button.setAttribute('aria-busy','true');button.setAttribute('aria-pressed','true');label('Pause prototype preview');status.textContent='Loading recording…';
   if(!video.hasAttribute('src')){video.src=video.dataset.videoSrc!;video.load();}
   video.muted=true;video.hidden=false;
   try{await video.play();if(token!==attempt||signal.aborted){if(!wanted)video.pause();return;}}
   catch(error){if(token===attempt&&wanted)fail(auto&&error instanceof DOMException&&error.name==='NotAllowedError');}
  };
  const sync=()=>{
   if(!automatic)return;
   const disclosure=video.closest<HTMLDetailsElement>('details[data-recording]');
   const active=available()&&!document.hidden&&!panel.hidden&&!panel.inert&&!host.hidden&&(!disclosure||disclosure.open);
   if(!active){reset();return;}
   if(reduced())return;
   if(!wanted&&!manualPaused&&!autoBlocked)void play(true);
  };
  video.closest('details[data-recording]')?.addEventListener('toggle',()=>{if(!(video.closest('details') as HTMLDetailsElement).open)reset();else sync();},{signal});
  button.addEventListener('click',()=>{if(wanted){manualPaused=true;pause();return;}manualPaused=false;autoBlocked=false;void play();},{signal});
  video.addEventListener('playing',()=>{wanted=true;image.classList.add('tme-video-active');host.dataset.videoState='playing';label('Pause prototype preview');button.setAttribute('aria-pressed','true');button.removeAttribute('aria-busy');status.textContent='';},{signal});
  video.addEventListener('pause',()=>{if(!video.hasAttribute('src'))return;wanted=false;host.dataset.videoState='paused';label(video.ended?'Replay prototype preview':'Play prototype preview');button.setAttribute('aria-pressed','false');button.removeAttribute('aria-busy');},{signal});
  video.addEventListener('ended',()=>{host.dataset.videoState='ended';label('Replay prototype preview');},{signal});
  video.addEventListener('waiting',()=>{if(wanted){button.setAttribute('aria-busy','true');status.textContent='Loading recording…';}},{signal});
  video.addEventListener('error',()=>{if(video.hasAttribute('src'))fail();},{signal});
  return {reset,sync,release};
 });
 const resetAll=()=>players.forEach(p=>p.reset()),syncAutoplay=()=>players.forEach(p=>p.sync());
 document.addEventListener('visibilitychange',()=>{if(document.hidden)resetAll();else syncAutoplay();},{signal});
 motion.addEventListener('change',()=>{resetAll();syncAutoplay();},{signal});
 window.addEventListener('pagehide',resetAll,{signal});signal.addEventListener('abort',()=>players.forEach(p=>p.release()),{once:true});
 return{resetAll,syncAutoplay};
}
