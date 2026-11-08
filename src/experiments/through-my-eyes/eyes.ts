import {createCharacter} from './character';
const root=document.querySelector<HTMLElement>('[data-eyes-experience]');
if(root)void start(root);
async function start(root:HTMLElement){
 const abort=new AbortController(),{signal}=abort;
 const canvas=root.querySelector<HTMLCanvasElement>('[data-character-canvas]')!;
 const journey=root.querySelector<HTMLElement>('.eyes-journey')!;
 const stage=root.querySelector<HTMLElement>('.eyes-stage')!;
 const world=root.querySelector<HTMLElement>('[data-eyes-world]')!;
 const project=root.querySelector<HTMLElement>('#eyes-project')!;
 const identity=root.querySelector<HTMLElement>('.eyes-identity')!;
 const assetLabel=root.querySelector<HTMLElement>('.eyes-asset-label')!;
 const controls=root.querySelector<HTMLElement>('.eyes-controls')!;
 const foot=root.querySelector<HTMLElement>('.eyes-stage-foot')!;
 const status=root.querySelector<HTMLElement>('[data-character-status]')!;
 const pause=root.querySelector<HTMLButtonElement>('[data-character-pause]')!;
 const motion=root.querySelector<HTMLButtonElement>('[data-eyes-motion]')!;
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 const resources:any[]=[];let renderer:any,pmrem:any,environment:any,observer:IntersectionObserver|undefined,resizeObserver:ResizeObserver|undefined;
 let disposed=false,raf=0,visible=true,reduced=media.matches,paused=false,width=0,height=0,pointerX=0,pointerY=0,lastFrame=0,frames=0,activeTime=0,lastTime=0;
 const cleanup=()=>{disposed=true;cancelAnimationFrame(raf);abort.abort();observer?.disconnect();resizeObserver?.disconnect();resources.forEach(r=>r.dispose());environment?.dispose();pmrem?.dispose();renderer?.dispose();renderer?.forceContextLoss();};
 const fallback=()=>{root.removeAttribute('data-enhanced');root.dataset.phase='reference';world.removeAttribute('style');world.removeAttribute('data-pinned');world.inert=false;world.querySelectorAll('a').forEach(a=>a.removeAttribute('tabindex'));identity.removeAttribute('style');identity.inert=false;controls.hidden=true;status.textContent='3D unavailable. Original reference portrait shown; all project links remain available.';};
 window.addEventListener('pagehide',event=>{if(event.persisted){cancelAnimationFrame(raf);raf=0;}else cleanup();},{signal});import.meta.hot?.dispose(cleanup);
 try{
  const modulePath=`${import.meta.env.BASE_URL}prototypes/apple-ring/vendor/three.module.js`;
  const T=await import(/* @vite-ignore */ modulePath);if(disposed)return;
  renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<701?1.25:1.5));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(31,1,.015,100);camera.position.set(0,0,8.7);
  const ink=new T.Color('#14191d'),forest=new T.Color('#174c3c'),green=new T.Color('#d6dfd1'),background=new T.Color();scene.background=ink;
  const studio=new T.Scene();studio.background=new T.Color('#1b2025');const boxGeometry=new T.BoxGeometry(1,1,1);resources.push(boxGeometry);
  const softbox=(color:string,power:number,x:number,y:number,z:number,sx:number,sy:number,sz:number)=>{const material=new T.MeshBasicMaterial({color:new T.Color(color).multiplyScalar(power)});resources.push(material);const m=new T.Mesh(boxGeometry,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);studio.add(m);};
  softbox('#fff2dc',5,-3,4,4,3,4,.1);softbox('#d8e5f3',3.5,5,2,0,.1,5,3);softbox('#ffffff',2,0,5,-4,6,.1,1);
  pmrem=new T.PMREMGenerator(renderer);environment=pmrem.fromScene(studio,.08);scene.environment=environment.texture;
  scene.add(new T.HemisphereLight('#e7e8e0','#141b20',.75));const key=new T.DirectionalLight('#fff0d9',2.6);key.position.set(-3,4,6);key.castShadow=true;key.shadow.mapSize.set(innerWidth<701?512:1024,innerWidth<701?512:1024);Object.assign(key.shadow.camera,{left:-3,right:4,top:4,bottom:-3,near:.1,far:15});key.shadow.bias=-.0004;key.shadow.normalBias=.015;key.shadow.camera.updateProjectionMatrix();resources.push({dispose:()=>key.shadow.map?.dispose()});scene.add(key);const rim=new T.DirectionalLight('#d3e2ee',2);rim.position.set(4,2,-2);scene.add(rim);
  const character=createCharacter(T,resources);character.body.traverse((node:any)=>{if(node.isMesh){node.castShadow=!node.material.transparent;node.receiveShadow=true;}});scene.add(character.body);
  root.dataset.enhanced='true';controls.hidden=false;status.textContent='';
  let scale=1,baseX=0,baseY=0;
  const clamp=(n:number,a=0,b=1)=>Math.min(b,Math.max(a,n));const ease=(n:number)=>{n=clamp(n);return n*n*(3-2*n);};
  const request=()=>{if(!raf&&!disposed&&!document.hidden)raf=requestAnimationFrame(draw);};
  const sync=()=>{if(media.matches)reduced=true;root.dataset.motion=reduced?'reduced':'full';motion.setAttribute('aria-pressed',String(reduced));motion.textContent=reduced?'Motion reduced':'Reduce motion';motion.disabled=media.matches;motion.title=media.matches?'Reduced motion follows your system setting':'';pause.setAttribute('aria-pressed',String(paused||reduced));pause.textContent=paused||reduced?'Character paused':'Pause character';pause.disabled=reduced;lastTime=0;request();};
  pause.addEventListener('click',()=>{paused=!paused;sync();},{signal});motion.addEventListener('click',()=>{reduced=!reduced;sync();},{signal});media.addEventListener('change',()=>{reduced=media.matches;sync();},{signal});
  root.addEventListener('pointermove',event=>{if(event.pointerType==='mouse'){pointerX=clamp(event.clientX/width-.5,-.5,.5);pointerY=clamp(event.clientY/height-.5,-.5,.5);request();}},{passive:true,signal});root.addEventListener('pointerleave',()=>{pointerX=pointerY=0;request();},{signal});
  const resize=()=>{const r=stage.getBoundingClientRect();width=r.width;height=r.height;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();character.body.scale.setScalar(1);character.body.position.set(0,0,0);character.head.rotation.set(0,0,0);const box=new T.Box3().setFromObject(character.body),size=box.getSize(new T.Vector3());const worldH=2*Math.tan(T.MathUtils.degToRad(31/2))*8.7,worldW=worldH*camera.aspect;const stacked=width<=700;scale=Math.min(worldW*(stacked?.84:.44)/size.x,worldH*(stacked?.40:.81)/size.y)*.92;baseX=stacked?0:worldW*.245;baseY=stacked?worldH*(width<=700?(height<800?-.20:-.17):-.22):0;request();};
  resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);resize();observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;lastTime=0;request();});observer.observe(journey);
  window.addEventListener('scroll',request,{passive:true,signal});document.addEventListener('visibilitychange',()=>{lastTime=0;request();},{signal});window.addEventListener('pageshow',event=>{if(event.persisted){lastTime=0;request();}},{signal});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cleanup();fallback();},{signal});
  const faceTarget=new T.Vector3(),eyeTarget=new T.Vector3(),glassesPoint=new T.Vector3();sync();
  function draw(now:number){
   raf=0;if(disposed||document.hidden)return;
   const r=journey.getBoundingClientRect(),projectTop=project.getBoundingClientRect().top;const p=reduced?0:clamp(-r.top/Math.max(1,projectTop-r.top)),pinned=!reduced&&projectTop>1;
   world.dataset.pinned=String(pinned);world.inert=pinned&&p<.88;world.style.setProperty('--world',String(pinned?ease((p-.66)/.19):1));world.style.setProperty('--title',String(pinned?ease((p-.79)/.13):1));world.style.setProperty('--artifact',String(pinned?ease((p-.88)/.11):1));world.querySelectorAll<HTMLAnchorElement>('a').forEach(a=>{if(pinned&&p<.88)a.tabIndex=-1;else a.removeAttribute('tabindex');});
   if(!visible&&!pinned)return;
   const idle=!paused&&!reduced&&p<.30;
   if(idle&&now-lastFrame<(width<701?50:33.3)){request();return;}lastFrame=now;
   if(lastTime&&idle)activeTime+=Math.min((now-lastTime)/1000,.08);lastTime=now;
   const contact=ease(p/.30),faceApproach=ease((p-.16)/.34),eyeApproach=ease((p-.48)/.28);
   const micro=idle?Math.sin(activeTime*.53)*.009:0;const lookX=idle?pointerX*(1-contact):0,lookY=idle?-pointerY*(1-contact):0;
   character.body.scale.setScalar(scale);character.body.position.set(baseX,baseY,0);character.head.rotation.set((idle?lookY*.035:0)+micro,-.18*(1-contact)+(idle?lookX*.055:0),.018*(1-contact));const blink=character.animate(activeTime,lookX,lookY,contact,idle);character.body.updateMatrixWorld(true);
   faceTarget.set(0,.13,.72).applyMatrix4(character.head.matrixWorld);character.eyeTarget.getWorldPosition(eyeTarget);glassesPoint.set(1.32,0,.10).applyMatrix4(character.glassesFrame.matrixWorld);
   camera.position.set(T.MathUtils.lerp(faceTarget.x*faceApproach,eyeTarget.x,eyeApproach),T.MathUtils.lerp(faceTarget.y*faceApproach,eyeTarget.y,eyeApproach),T.MathUtils.lerp(T.MathUtils.lerp(8.7,faceTarget.z+2.4,faceApproach),eyeTarget.z+.20,eyeApproach));
   if(p<.72)background.copy(ink).lerp(forest,ease((p-.60)/.12));else background.copy(forest).lerp(green,ease((p-.72)/.14));scene.background=background;
   canvas.style.opacity=String(1-ease((p-.71)/.15));identity.style.opacity=String(1-ease((p-.04)/.24));identity.inert=p>.28;assetLabel.style.opacity=String(1-ease((p-.71)/.15));controls.style.opacity=String(1-ease(p/.20));controls.inert=p>.22;foot.style.opacity=String(1-ease(p/.23));foot.inert=p>.25;
   renderer.render(scene,camera);frames++;root.dataset.renderCount=String(frames);root.dataset.phase=p<.18?'introduction':p<.46?'eye-contact':p<.66?'close-up':p<.86?'eye-match':'clarity';root.dataset.progress=p.toFixed(3);root.dataset.cameraZ=camera.position.z.toFixed(3);root.dataset.eyeZ=eyeTarget.z.toFixed(3);root.dataset.triangles=String(renderer.info.render.triangles);root.dataset.drawCalls=String(renderer.info.render.calls);root.dataset.character='non-likeness-placeholder';root.dataset.headYaw=character.head.rotation.y.toFixed(4);root.dataset.blink=blink.toFixed(3);root.dataset.lensEyeSeparation=glassesPoint.distanceTo(eyeTarget).toFixed(4);
   if(idle)request();
  }
 }catch(error){console.warn('Through My Eyes: reference fallback.',error instanceof Error?error.message:'3D unavailable');resources.forEach(r=>r.dispose());environment?.dispose();pmrem?.dispose();renderer?.dispose();fallback();}
}
