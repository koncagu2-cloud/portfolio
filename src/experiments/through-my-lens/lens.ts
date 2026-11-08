import { createGlasses } from './glasses';
// Isolated enhancement: native scroll and semantic HTML are always the baseline.
const root = document.querySelector<HTMLElement>('[data-lens-experience]');
if (root) void start(root);

async function start(root: HTMLElement) {
  const controller = new AbortController();
  const { signal } = controller;
  const canvas = root.querySelector<HTMLCanvasElement>('[data-glasses-canvas]')!;
  const returnCanvas = root.querySelector<HTMLCanvasElement>('[data-return-canvas]')!;
  const status = root.querySelector<HTMLElement>('[data-scene-status]')!;
  const motionButton = root.querySelector<HTMLButtonElement>('[data-motion]')!;
  const tools = root.querySelector<HTMLElement>('[data-3d-tools]')!;
  const journey = root.querySelector<HTMLElement>('.lens-journey')!;
  const person = root.querySelector<HTMLElement>('.lens-person')!;
  const copy = root.querySelector<HTMLElement>('.lens-hero-copy')!;
  const entry = root.querySelector<HTMLElement>('[data-entry]')!;
  const projects=root.querySelector<HTMLElement>('#projects')!;
  const exitSection=root.querySelector<HTMLElement>('.d2l-exit')!;
  const exitCanvas=root.querySelector<HTMLCanvasElement>('[data-exit-canvas]')!;
  const exitCopy=root.querySelector<HTMLElement>('.d2l-exit-copy')!;
  const recordArtifact=root.querySelector<HTMLElement>('.d2l-record-artifact')!;
  const exitLinks=exitCopy.querySelectorAll<HTMLAnchorElement>('a');
  const stageFoot=root.querySelector<HTMLElement>('.lens-stage-foot')!;
  const portrait=root.querySelector<HTMLElement>('.lens-portrait')!;
  const entryLinks=entry.querySelectorAll<HTMLAnchorElement>('a');
  let redraw=()=>{};
  const personGrid = root.querySelector<HTMLElement>('.lens-person-grid')!;
  const returnObject = root.querySelector<HTMLElement>('.lens-return-object')!;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = media.matches, disposed = false, raf = 0, renderer: any, envTarget: any, pmrem: any;
  let observer: IntersectionObserver | undefined, resizeObserver: ResizeObserver | undefined;
  const resources: any[] = [];
  const cleanup = () => {
    disposed = true; cancelAnimationFrame(raf); controller.abort(); observer?.disconnect(); resizeObserver?.disconnect();
    resources.forEach(resource => resource.dispose()); envTarget?.dispose(); pmrem?.dispose(); renderer?.dispose(); renderer?.forceContextLoss();
    returnCanvas.width=returnCanvas.height=exitCanvas.width=exitCanvas.height=0;
  };
  window.addEventListener('pagehide', event=>{if(event.persisted){cancelAnimationFrame(raf);raf=0;}else cleanup();},{signal});
  import.meta.hot?.dispose(cleanup);
  // A cached page pauses; a restored page resumes its existing resources.
  window.addEventListener('pageshow', event => { if(event.persisted) redraw(); }, { signal });
  function fail(message: string) {
    root.removeAttribute('data-enhanced'); root.dataset.interactive = 'false';
    entry.removeAttribute('data-pinned');entry.removeAttribute('style');entry.inert=false;
    copy.removeAttribute('style');copy.inert=false;personGrid.removeAttribute('style');
    exitSection.removeAttribute('style');exitCopy.removeAttribute('style');recordArtifact.removeAttribute('style');
    root.dataset.phase='static';entryLinks.forEach(a=>a.removeAttribute('tabindex'));exitLinks.forEach(a=>a.removeAttribute('tabindex'));
    root.querySelector<HTMLElement>('.lens-portrait')!.style.removeProperty('opacity');
    const foot=root.querySelector<HTMLElement>('.lens-stage-foot')!;foot.removeAttribute('style');foot.inert=false;
    tools.hidden = true; motionButton.hidden = true; status.textContent = message;
  }
  try {
    // Reuses the already-vendored, licensed Three.js runtime. No CDN or new package.
    const modulePath = `${import.meta.env.BASE_URL}prototypes/apple-ring/vendor/three.module.js`;
    const T = await import(/* @vite-ignore */ modulePath);
    if(disposed) return;
    renderer = new T.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 701 ? 1.35 : 1.6));
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    const scene = new T.Scene();
    const inkBackground=new T.Color('#141719'),greenBackground=new T.Color('#d6dfd1'),forestBackground=new T.Color('#174c3c'),sceneColor=new T.Color();
    const camera = new T.PerspectiveCamera(32, 1, .015, 100);
    camera.position.set(0,0,12);
    // Softboxes in a small generated studio supply real material reflections.
    const studio = new T.Scene(); studio.background = new T.Color('#080a0c');
    const boxGeometry = new T.BoxGeometry(1,1,1); resources.push(boxGeometry);
    const softbox = (color: string, power: number, x: number, y: number, z: number, sx: number, sy: number, sz: number) => {
      const mat = new T.MeshBasicMaterial({color:new T.Color(color).multiplyScalar(power)}); resources.push(mat);
      const box = new T.Mesh(boxGeometry,mat); box.position.set(x,y,z); box.scale.set(sx,sy,sz); studio.add(box);
    };
    softbox('#fff7e8',6,-3,4,3,2,4,.1); softbox('#dee9f2',5,5,1,1,.12,5,2);
    softbox('#ffffff',2,-1,-3,1,6,.15,2); softbox('#ffffff',3,0,3,-5,6,.3,.1);
    pmrem = new T.PMREMGenerator(renderer); envTarget = pmrem.fromScene(studio,.04); scene.environment = envTarget.texture;
    scene.add(new T.HemisphereLight('#e2e7e9','#181c20',1.2));
    const key = new T.DirectionalLight('#fff4df',2.5); key.position.set(-3,5,6);scene.add(key);
    const fill = new T.DirectionalLight('#d8e7f0',1.6);fill.position.set(5,0,3);scene.add(fill);
    const {pivot:model,frame,setMaterial,setAtmosphere} = createGlasses(T,resources);scene.add(model);
    root.dataset.enhanced='true';root.dataset.interactive='true';tools.hidden=false;motionButton.hidden=false;
    status.textContent='';
    let width=0,height=0, introVisible=true,personVisible=false,exitVisible=false;
    let yaw=0,pitch=0,targetYaw=0,targetPitch=0,hoverX=0,hoverY=0,pointer: {id:number;x:number;y:number;lastX:number;lastY:number;intent:boolean}|null=null;
    let frameCount=0;
    const clamp=(v:number,a=0,b=1)=>Math.min(b,Math.max(a,v));
    const smooth=(v:number)=>{v=clamp(v);return v*v*(3-2*v);};
    const request = () => {if(!raf&&!disposed&&!document.hidden)raf=requestAnimationFrame(draw);};
    redraw=request;
    const setMotion=()=> {if(media.matches)reduced=true;motionButton.disabled=media.matches;motionButton.title=media.matches?'Reduced motion follows your system preference':'';root.dataset.motion=reduced?'reduced':'full';motionButton.setAttribute('aria-pressed',String(reduced));motionButton.textContent=reduced?'Motion reduced':'Reduce motion';if(reduced){hoverX=hoverY=0;}request();};
    setMotion();
    motionButton.addEventListener('click',()=>{reduced=!reduced;setMotion();},{signal});
    media.addEventListener('change',()=>{reduced=media.matches;setMotion();},{signal});
    const reset=()=>{targetYaw=targetPitch=hoverX=hoverY=0;if(reduced){yaw=pitch=0;}request();};
    root.querySelector('[data-reset]')!.addEventListener('click',reset,{signal});
    root.querySelectorAll<HTMLButtonElement>('[data-turn]').forEach(button=>button.addEventListener('click',()=>{targetYaw+=Number(button.dataset.turn)*Math.PI/6;if(reduced)yaw=targetYaw;request();},{signal}));
    root.querySelectorAll<HTMLButtonElement>('[data-material]').forEach(button=>button.addEventListener('click',()=>{
      const sun=button.dataset.material==='sun';setMaterial(sun);
      root.querySelectorAll('[data-material]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));root.dataset.material=sun?'sun':'optical';request();
    },{signal}));
    canvas.addEventListener('pointerdown',event=>{if(!root.matches('[data-interactive=true]'))return;pointer={id:event.pointerId,x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY,intent:false};},{signal});
    canvas.addEventListener('pointermove',event=>{
      if(pointer&&event.pointerId===pointer.id){
        const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
        if(!pointer.intent&&Math.abs(dx)>7&&Math.abs(dx)>Math.abs(dy)*1.2){pointer.intent=true;canvas.setPointerCapture(event.pointerId);}
        if(!pointer.intent&&Math.abs(dy)>10){pointer=null;return;}
        if(pointer.intent){targetYaw+=(event.clientX-pointer.lastX)*.009;targetPitch=clamp(targetPitch+(event.clientY-pointer.lastY)*.005,-.5,.5);if(reduced){yaw=targetYaw;pitch=targetPitch;}pointer.lastX=event.clientX;pointer.lastY=event.clientY;request();}
      } else if(event.pointerType==='mouse'&&!reduced){hoverX=(event.clientX/width-.5)*.055;hoverY=(event.clientY/height-.5)*.035;request();}
    },{signal});
    const endPointer=()=>{pointer=null;};canvas.addEventListener('pointerup',endPointer,{signal});canvas.addEventListener('pointercancel',endPointer,{signal});canvas.addEventListener('lostpointercapture',endPointer,{signal});
    canvas.addEventListener('pointerleave',()=>{hoverX=hoverY=0;request();},{signal});
    root.addEventListener('keydown',event=>{if(event.key==='Escape'){reset();endPointer();}},{signal});
    let fitScale=1,fitX=0,fitY=0;
    const resize=()=>{const r=canvas.parentElement!.getBoundingClientRect();width=r.width;height=r.height;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();
      const stacked=width<=1100;model.rotation.set(.10,-.28,-.09);model.scale.setScalar(1);model.position.set(0,0,0);
      const box=new T.Box3().setFromObject(model),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3());
      const worldH=2*Math.tan(T.MathUtils.degToRad(camera.fov/2))*12,worldW=worldH*camera.aspect;
      fitScale=Math.min(worldW*(stacked?.94:.47)/size.x,worldH*(stacked?.24:.44)/size.y)*.91;
      fitX=worldW*(stacked?0:.225)-center.x*fitScale;fitY=worldH*(stacked?(width<=700?-.08:-.14):0)-center.y*fitScale;
      request();};
    resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas.parentElement!);resize();
    observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.target===journey)introVisible=entry.isIntersecting;if(entry.target===person)personVisible=entry.isIntersecting;if(entry.target===exitSection)exitVisible=entry.isIntersecting;}request();});observer.observe(journey);observer.observe(person);observer.observe(exitSection);
    window.addEventListener('scroll',request,{passive:true,signal});document.addEventListener('visibilitychange',request,{signal});
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cleanup();fail('The 3D view is unavailable. All project content and links remain available.');},{signal});
    const lensCenter=new T.Vector3();
    const writeFrame=(target:HTMLCanvasElement)=>{if(target.width!==canvas.width||target.height!==canvas.height){target.width=canvas.width;target.height=canvas.height;}const ctx=target.getContext('2d');ctx?.clearRect(0,0,target.width,target.height);ctx?.drawImage(canvas,0,0);};
    function draw(){
      raf=0;if(disposed||document.hidden)return;
      const rect=journey.getBoundingClientRect(),projectTop=projects.getBoundingClientRect().top;
      const p=reduced?0:clamp(-rect.top/Math.max(1,projectTop-rect.top));
      const pinned=!reduced&&projectTop>1;
      const exitRect=exitSection.getBoundingClientRect();
      const q=reduced?1:clamp((height-exitRect.top)/(height+(exitRect.height-height)*.7));
      const exiting=exitVisible&&!introVisible&&!reduced;
      const ending=personVisible&&!introVisible&&!exiting;
      entry.dataset.pinned=String(pinned);entry.dataset.open=String(p>.85);entry.inert=false;
      entryLinks.forEach(link=>{if(pinned&&p<.85)link.tabIndex=-1;else link.removeAttribute('tabindex');});
      entry.style.setProperty('--world-reveal',String(pinned?smooth((p-.49)/.20):1));
      entry.style.setProperty('--heading-reveal',String(pinned?smooth((p-.70)/.13):1));
      entry.style.setProperty('--artifact-reveal',String(pinned?smooth((p-.83)/.15):1));
      exitLinks.forEach(link=>{if(!reduced&&q<.38)link.tabIndex=-1;else link.removeAttribute('tabindex');});
      if(!introVisible&&!personVisible&&!exitVisible&&!pinned)return;
      const turn=smooth(p/.34),focus=smooth((p-.14)/.44),approach=smooth((p-.22)/.53),wash=smooth((p-.42)/.29);
      const backRect=person.getBoundingClientRect();const back=reduced?1:clamp(-backRect.top/Math.max(1,backRect.height-height));
      yaw+=(targetYaw-yaw)*(reduced?1:.2);pitch+=(targetPitch-pitch)*(reduced?1:.2);
      root.dataset.interactive=String(!ending&&!exiting&&p<.13);
      tools.style.opacity=String(1-smooth(p/.18));tools.inert=p>.14;tools.style.visibility=p>.20?'hidden':'visible';
      copy.style.opacity=String(1-smooth((p-.03)/.25));copy.style.transform=`translateY(${-18*turn}px)`;copy.inert=p>.28;
      stageFoot.style.opacity=String(1-smooth((p-.12)/.2));stageFoot.inert=p>.32;
      camera.position.set(0,0,12);camera.rotation.set(0,0,0);
      if(ending){
        scene.background=null;setAtmosphere(0);
        const pull=smooth(back/.65);model.scale.setScalar(fitScale*.65*(1-.4*pull));
        model.rotation.set(.10,-.28*(1-pull),-.09);model.position.set(width<=700?1.0:2.3,width<=700?2.1:1.8,-pull);
        returnObject.style.opacity=String(1-smooth(back/.65));portrait.style.opacity=String(.6+.4*smooth(back/.55));personGrid.style.removeProperty('transform');
        root.dataset.phase='person';
      }else if(exiting){
        const pull=smooth(q/.78);model.scale.setScalar(fitScale);model.position.set(fitX,fitY,0);model.rotation.set(.10*pull,-.28*pull,-.09*pull);model.updateMatrixWorld(true);
        lensCenter.set(1.32,0,.10).applyMatrix4(frame.matrixWorld);
        camera.position.set(lensCenter.x*(1-pull),lensCenter.y*(1-pull),T.MathUtils.lerp(lensCenter.z+.045,12,pull));
        const dark=smooth(q/.55);if(q<.25)sceneColor.copy(greenBackground).lerp(forestBackground,smooth(q/.25));else sceneColor.copy(forestBackground).lerp(inkBackground,smooth((q-.25)/.30));scene.background=sceneColor;setAtmosphere(1-dark);
        exitSection.style.setProperty('--exit-background',sceneColor.getStyle());exitSection.style.setProperty('--exit-copy',String(smooth((q-.43)/.28)));
        exitCanvas.style.opacity=String(smooth(q/.24));recordArtifact.style.setProperty('--record-depth',`${-90*smooth(q/.35)}px`);
        root.dataset.phase='return';
      }else{
        // The object's scale stays constant. The camera travels through its right lens.
        const inspectionYaw=T.MathUtils.euclideanModulo(-.28+yaw+hoverX+Math.PI,Math.PI*2)-Math.PI;
        model.scale.setScalar(fitScale);model.rotation.set((.10+pitch+hoverY)*(1-turn),inspectionYaw*(1-turn),-.09*(1-turn));model.position.set(fitX,fitY,0);model.updateMatrixWorld(true);
        lensCenter.set(1.32,0,.10).applyMatrix4(frame.matrixWorld);
        camera.position.set(lensCenter.x*focus,lensCenter.y*focus,T.MathUtils.lerp(12,lensCenter.z-.12,approach));
        if(p<.61)sceneColor.copy(inkBackground).lerp(forestBackground,smooth((p-.32)/.28));else sceneColor.copy(forestBackground).lerp(greenBackground,smooth((p-.61)/.16));scene.background=sceneColor;setAtmosphere(wash);
        canvas.style.opacity=String(1-smooth((p-.63)/.20));
        root.dataset.phase=p<.22?'inspect':p<.60?'approach':p<.83?'enter':'clarity';
      }
      renderer.render(scene,camera);frameCount++;root.dataset.renderCount=String(frameCount);root.dataset.triangles=String(renderer.info.render.triangles);root.dataset.drawCalls=String(renderer.info.render.calls);
      root.dataset.progress=p.toFixed(3);root.dataset.yaw=yaw.toFixed(3);root.dataset.exitProgress=q.toFixed(3);root.dataset.cameraZ=camera.position.z.toFixed(3);root.dataset.lensSurfaceZ=lensCenter.z.toFixed(3);root.dataset.modelScale=fitScale.toFixed(3);
      if(ending)writeFrame(returnCanvas);if(exiting)writeFrame(exitCanvas);
      if(Math.abs(targetYaw-yaw)>.001||Math.abs(targetPitch-pitch)>.001)request();
    }
    request();
  }catch(error){
    console.warn('Through My Lens: static fallback enabled.',error instanceof Error?error.message:'3D unavailable');
    fail('Static perspective. The 3D view could not load; all projects and links remain available.');
    resources.forEach(r=>r.dispose());envTarget?.dispose();pmrem?.dispose();renderer?.dispose();
  }
}
