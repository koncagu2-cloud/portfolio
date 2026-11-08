import {createSignatureEntrance} from './signature-entrance';
import {createAvatarSurfaces} from './avatar-surface';
import {captureOpening} from './opening-texture';
import {createCharacterBehavior} from './behavior';
import {loadEmbedded} from '../sk-character-studio/loader';
import {disposeObject} from '../sk-character-studio/asset';
import {createNeckHeadphones} from './headphones';
const root=document.querySelector<HTMLElement>('[data-tme]');
if(root){setupDemo(root);void mount(root);if(import.meta.env.DEV)void import('./performance-mode').then(({mountPerformanceMode})=>mountPerformanceMode(root));}
const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(v:number)=>{v=clamp(v);return v*v*(3-2*v);};
function setupDemo(root:HTMLElement){
 const form=root.querySelector<HTMLFormElement>('[data-demo]')!,choose=form.querySelector<HTMLElement>('[data-choose]')!,review=form.querySelector<HTMLElement>('[data-review]')!,success=form.querySelector<HTMLElement>('[data-success]')!,feedback=form.querySelector<HTMLElement>('[data-feedback]')!,step=root.querySelector<HTMLElement>('[data-step]')!;
 let selected='';
 const show=(state:'choose'|'review'|'success')=>{choose.hidden=state!=='choose';review.hidden=state!=='review';success.hidden=state!=='success';step.textContent=state==='choose'?'01 / Choose':state==='review'?'02 / Review':'03 / Recorded';root.dataset.demoState=state;};
 form.addEventListener('submit',e=>{e.preventDefault();const radio=form.querySelector<HTMLInputElement>('input[name=sample]:checked');if(!radio){feedback.textContent='Choose a sample file before reviewing.';form.querySelector<HTMLInputElement>('input')!.focus();return;}selected=radio.value;form.querySelector<HTMLElement>('[data-filename]')!.textContent=selected;show('review');feedback.textContent=`Selected: ${selected}. Review it before submitting the demo.`;form.querySelector<HTMLButtonElement>('[data-submit]')!.focus();});
 const change=()=>{show('choose');feedback.textContent='Choose the file you want to review.';form.querySelector<HTMLInputElement>('input:checked,input')!.focus();};
 form.querySelector('[data-change]')!.addEventListener('click',change);
 form.querySelector('[data-remove]')!.addEventListener('click',()=>{form.reset();selected='';change();feedback.textContent='File removed. Choose another sample.';});
 form.querySelector('[data-submit]')!.addEventListener('click',()=>{if(!selected){change();return;}form.querySelector<HTMLElement>('[data-record-file]')!.textContent=selected;show('success');feedback.textContent='Demo submission recorded. No real file was uploaded.';form.querySelector<HTMLButtonElement>('[data-reset]')!.focus();});
 form.querySelector('[data-reset]')!.addEventListener('click',()=>{form.reset();selected='';change();feedback.textContent='Walkthrough reset.';});show('choose');
}
async function mount(root:HTMLElement){
 const abort=new AbortController(),{signal}=abort,media=matchMedia('(prefers-reduced-motion: reduce)');
 const stage=root.querySelector<HTMLElement>('[data-stage]')!,journey=root.querySelector<HTMLElement>('.tme-journey')!,world=root.querySelector<HTMLElement>('.tme-world')!,canvas=root.querySelector<HTMLCanvasElement>('[data-canvas]')!,copy=root.querySelector<HTMLElement>('.tme-type')!,utilities=root.querySelector<HTMLElement>('.tme-utilities')!,caption=root.querySelector<HTMLElement>('.tme-lens-caption')!,status=root.querySelector<HTMLElement>('[data-status]')!;
 const pause=root.querySelector<HTMLButtonElement>('[data-pause]')!,reduce=root.querySelector<HTMLButtonElement>('[data-reduce]')!;
 const soundtrack=root.querySelector<HTMLAudioElement>('[data-soundtrack]')!,soundtrackButton=root.querySelector<HTMLButtonElement>('[data-soundtrack-toggle]')!,soundtrackStatus=root.querySelector<HTMLElement>('[data-soundtrack-status]')!;
 let headphoneAccessory:any,headphoneRaycaster:any,headphonePointer:any,pressedHeadphonePointer:number|null=null;
 const syncSoundtrack=(playing:boolean)=>{soundtrackButton.setAttribute('aria-pressed',String(playing));soundtrackButton.setAttribute('aria-label',`${playing?'Pause':'Play'} portfolio soundtrack`);soundtrackButton.textContent=playing?'Pause soundtrack':'Play soundtrack';root.dataset.soundtrackPlaying=String(playing);headphoneAccessory?.setPlaying(playing);headphoneAccessory?.pulse();request();};
 const toggleSoundtrack=async()=>{if(soundtrack.paused){try{await soundtrack.play();}catch{soundtrackStatus.textContent='Audio could not start. Please try again.';}}else soundtrack.pause();};
 soundtrackButton.addEventListener('click',()=>void toggleSoundtrack(),{signal});
 soundtrack.addEventListener('play',()=>{syncSoundtrack(true);soundtrackStatus.textContent='Portfolio soundtrack playing.';},{signal});
 soundtrack.addEventListener('pause',()=>{syncSoundtrack(false);soundtrackStatus.textContent='Portfolio soundtrack paused.';},{signal});
 soundtrack.addEventListener('error',()=>{syncSoundtrack(false);soundtrackStatus.textContent='The soundtrack could not be loaded.';},{signal});
 let reduced=media.matches,paused=false,disposed=false,readerOpen=false,raf=0,scrollRaf=0,last=0,lastDraw=0,visible=true,width=0,height=0,frames=0,interactionUntil=0;
 let renderer:any,model:any,scene:any,camera:any,T:any,environment:any,pmrem:any,resizeObserver:ResizeObserver|undefined,observer:IntersectionObserver|undefined;const resources:any[]=[];
 const portal=root.querySelector<HTMLElement>('[data-portal]')!;
 const portalContent=root.querySelector<HTMLElement>('[data-portal-content]')!;portalContent.replaceChildren();
 // The lens texture captures the existing D2L scene; no duplicate HTML presentation is mounted.
 const behavior=createCharacterBehavior();let prepareDestination=(_id:string)=>{};
 const signature=createSignatureEntrance(root,signal);
 let selectedPerspective=0;
 let sequence:'entrance'|'interactive'|'lens'|'project'|'return'='interactive',sequenceStart=0;const typeAnimations:Animation[]=[];
 const setSequence=(state:typeof sequence)=>{sequence=state;sequenceStart=performance.now();root.dataset.sequence=state;};
 root.addEventListener('tme:opening-finished',()=>{if(sequence==='entrance')setSequence('interactive');request();},{signal});
 root.addEventListener('tme:opening-landed',()=>{behavior.greet();setSequence('interactive');request();},{signal});
 const clearType=()=>{typeAnimations.forEach(a=>a.cancel());typeAnimations.length=0;};
 const acknowledge=()=>{if(reduced||paused)return;behavior.attend();interactionUntil=performance.now()+1400;request();};
 root.querySelectorAll('[data-enter],.tme-enter').forEach(el=>{el.addEventListener('pointerenter',acknowledge,{signal});el.addEventListener('focus',acknowledge,{signal});el.addEventListener('pointerdown',acknowledge,{signal});});
 root.addEventListener('tme:scanner',e=>{sceneDirty=true;request();acknowledge();if(!reduced&&!paused&&(e as CustomEvent).detail.mode==='select')behavior.lookAtPerspective();},{signal});
 root.addEventListener('tme:perspective',e=>{const id=(e as CustomEvent<string>).detail;selectedPerspective=Math.max(0,['d2l-world','chapter-ring','chapter-community','chapter-align'].indexOf(id));root.dataset.perspective=id;},{signal});
 let draw=(_now:number)=>{raf=0;};
 let sceneDirty=true,cachedProgress=0,lastProgress=-1,heroOnscreen=true;
 const request=()=>{if(!raf&&!disposed&&!document.hidden&&!readerOpen)raf=requestAnimationFrame(draw);};
 const invalidate=()=>{sceneDirty=true;request();};
 const motionState=()=>{if(reduced||paused){clearType();if(sequence==='entrance')setSequence('interactive');}lastProgress=-1;root.dataset.motion=reduced?'reduced':'full';reduce.setAttribute('aria-pressed',String(reduced));reduce.disabled=media.matches;reduce.textContent=reduced?'Motion reduced':'Reduce motion';pause.disabled=reduced;pause.setAttribute('aria-pressed',String(paused||reduced));pause.textContent=paused||reduced?'Motion paused':'Pause motion';if(reduced)behavior.neutral();last=0;invalidate();};
 const lensControls=root.querySelector<HTMLElement>('[data-lens-controls]')!;
 let activeLensTarget='d2l-world';let lensActive=false,lensProgress=0,returnThroughLens=true;let glasses:HTMLButtonElement|undefined;
 const resetLens=()=>{lensActive=false;lensProgress=0;cachedProgress=0;lastProgress=-1;root.dataset.progress='0';portal.style.opacity='0';canvas.style.opacity='1';glasses?.removeAttribute('data-active');stage.style.setProperty('--scene-fade','0');lensControls.hidden=true;delete root.dataset.lensActive;copy.inert=['preview','pinned','entering'].includes(root.dataset.scanner||'');utilities.inert=false;copy.style.setProperty('--intro-opacity','1');utilities.style.opacity='1';world.inert=false;world.style.setProperty('--reveal','1');sceneDirty=true;request();};
 const stopScroll=()=>{cancelAnimationFrame(scrollRaf);scrollRaf=0;clearType();if(lensActive){resetLens();setSequence(heroOnscreen?'interactive':'project');}if(sequence==='entrance')setSequence('interactive');};
 root.addEventListener('tme:navigate',stopScroll,{signal});
 root.addEventListener('tme:camera',e=>{const {progress,active,target}=(e as CustomEvent).detail;if(active&&target){activeLensTarget=target;prepareDestination(target);}cancelAnimationFrame(scrollRaf);scrollRaf=0;if(!active){resetLens();setSequence('interactive');return;}if(!lensActive)behavior.attend();lensActive=true;lensProgress=progress;cachedProgress=progress;root.dataset.lensActive='true';setSequence('lens');visible=true;heroOnscreen=true;sceneDirty=true;request();},{signal});
 root.addEventListener('tme:scene',e=>{const id=(e as CustomEvent).detail;heroOnscreen=id==='perspective'||id==='through-lens';visible=heroOnscreen;last=0;sceneDirty=true;if(heroOnscreen)request();else{cancelAnimationFrame(raf);raf=0;}},{signal});
 root.addEventListener('tme:reader',e=>{readerOpen=Boolean((e as CustomEvent).detail);if(readerOpen){cancelAnimationFrame(raf);raf=0;stopScroll();}else{last=0;invalidate();}},{signal});
 const go=(target:HTMLElement,returning=false,immediate=false,returnOrigin?:Element)=>{
  if(root.dataset.cinematic==='true'){root.dispatchEvent(new CustomEvent('tme:scene-request',{detail:returning?'perspective':'through-lens'}));return;}
  const returnFromD2L=returnOrigin?world.contains(returnOrigin):document.getElementById(location.hash.slice(1))?.closest('.tme-world')===world;
  stopScroll();
  const finish=()=>{
   const moving=lensActive;
   const land=()=>{resetLens();setSequence(returning?'interactive':'project');if(returning){visible=true;heroOnscreen=true;behavior.returnFromProject(selectedPerspective);last=lastDraw=0;root.querySelector<HTMLAnchorElement>('.tme-enter')!.focus({preventScroll:true});}else{target.inert=false;target.focus({preventScroll:true});}};
   target.inert=false;target.scrollIntoView({behavior:'instant',block:'start'});history.replaceState(null,'',`#${target.id}`);
   if(moving){scrollRaf=requestAnimationFrame(()=>{scrollRaf=requestAnimationFrame(()=>{scrollRaf=0;land();});});}else land();
  };
  if(reduced||paused||immediate||!root.dataset.ready){finish();return;}
  clearType();behavior.attend();returnThroughLens=!returning||returnFromD2L;root.dataset.returnMode=returnThroughLens?'lens':'portrait';root.querySelector('[data-lens-skip]')!.textContent=returning?'Return now ↑':'Skip to D2L ↓';lensControls.hidden=false;lensActive=true;lensProgress=returning?(returnThroughLens?1:.25):0;root.dataset.lensActive='true';setSequence(returning?'return':'lens');sceneDirty=true;visible=true;heroOnscreen=true;
  if(returning){target.scrollIntoView({behavior:'instant',block:'start'});history.replaceState(null,'','#perspective');}else{window.scrollTo({top:journey.offsetTop,behavior:'instant'});root.querySelector<HTMLAnchorElement>('[data-lens-skip]')!.focus({preventScroll:true});}
  const start=performance.now(),duration=returning?800:1750;
  const tick=(now:number)=>{const elapsed=clamp((now-start)/duration);lensProgress=returning?(1-elapsed)*(returnThroughLens?1:.25):elapsed;sceneDirty=true;request();if(elapsed<1)scrollRaf=requestAnimationFrame(tick);else{scrollRaf=0;finish();}};scrollRaf=requestAnimationFrame(tick);
 };
 root.querySelectorAll<HTMLAnchorElement>('[data-enter]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();go(world);},{signal}));
 root.querySelectorAll<HTMLAnchorElement>('[data-return]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();go(journey,true,false,a);},{signal}));
 root.querySelector('[data-skip]')!.addEventListener('click',e=>{e.preventDefault();go(world,false,true);},{signal});
 root.querySelector('[data-lens-skip]')!.addEventListener('click',e=>{e.preventDefault();sequence==='return'?go(journey,true,true):go(world,false,true);},{signal});
 root.querySelector('[data-lens-cancel]')!.addEventListener('click',()=>{stopScroll();root.querySelector<HTMLAnchorElement>('[data-enter]')!.focus({preventScroll:true});},{signal});
 window.addEventListener('wheel',()=>{if(root.dataset.cinematic!=='true')stopScroll();},{passive:true,signal});window.addEventListener('touchstart',e=>{if(root.dataset.cinematic!=='true'&&!(e.target instanceof Element&&e.target.closest('[data-lens-controls]')))stopScroll();},{passive:true,signal});window.addEventListener('keydown',e=>{if(root.dataset.cinematic!=='true'&&['Escape','Tab','PageDown','PageUp','Home','End','ArrowDown','ArrowUp'].includes(e.key)){const wasActive=lensActive;stopScroll();if((e.key==='Tab'||e.key==='Escape')&&wasActive)root.querySelector<HTMLAnchorElement>('[data-enter]')!.focus({preventScroll:true});}},{signal});
 pause.addEventListener('click',()=>{paused=!paused;motionState();},{signal});reduce.addEventListener('click',()=>{reduced=!reduced;motionState();},{signal});media.addEventListener('change',()=>{const returning=sequence==='return';reduced=media.matches;motionState();if(reduced&&lensActive)go(returning?journey:world,returning,true);},{signal});motionState();
 const cleanup=()=>{if(disposed)return;clearType();glasses?.remove();disposed=true;soundtrack.pause();cancelAnimationFrame(raf);stopScroll();abort.abort();observer?.disconnect();resizeObserver?.disconnect();if(model)disposeObject(model);resources.forEach(r=>r.dispose());environment?.dispose();pmrem?.dispose();renderer?.dispose();};
 const fallback=()=>{signature.skip();clearType();setSequence('interactive');root.removeAttribute('data-ready');root.removeAttribute('data-presented');world.inert=false;world.style.opacity='1';copy.inert=false;copy.style.opacity='1';copy.style.setProperty('--intro-opacity','1');copy.style.transform='';utilities.inert=false;utilities.style.opacity='1';portal.style.opacity='0';canvas.style.opacity='0';stage.style.setProperty('--scene-fade','0');pause.disabled=true;status.textContent='3D is unavailable. The portrait and every project remain available.';};
 window.addEventListener('pagehide',e=>{if(e.persisted){cancelAnimationFrame(raf);raf=0;stopScroll();}else cleanup();},{signal});window.addEventListener('pageshow',()=>{last=0;request();},{signal});import.meta.hot?.dispose(cleanup);
 try{
  const runtime=new URL('/prototypes/apple-ring/vendor/three.module.js',location.origin).href,addon=new URL('/experiments/sk-character-studio/vendor/GLTFLoader.js',location.origin).href;const [three,{GLTFLoader}]=await Promise.all([import(/* @vite-ignore */runtime),import(/* @vite-ignore */addon)]);T=three;if(disposed)return;
  if(root.dataset.cinematic==='true'&&!['perspective','through-lens'].includes(root.dataset.scene||''))await new Promise<void>(resolve=>{const resume=(e:Event)=>{if(['perspective','through-lens'].includes((e as CustomEvent).detail)){root.removeEventListener('tme:scene',resume);resolve();}};root.addEventListener('tme:scene',resume,{signal});signal.addEventListener('abort',()=>resolve(),{once:true});});if(disposed)return;
  renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});let nativeDpr=Math.min(devicePixelRatio,innerWidth<=700?1.25:1.5);let quality=1,diagnosticFull=false;let fixedQuality=new URLSearchParams(location.search).get('tme-quality')==='native';renderer.setPixelRatio(nativeDpr);root.dataset.quality='1';renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.78;
  scene=new T.Scene();scene.background=null;camera=new T.PerspectiveCamera(32,1,.015,50);
  const lighting=new T.Scene();lighting.background=new T.Color('#33303b');const box=new T.BoxGeometry(1,1,1);resources.push(box);
  for(const [color,power,position,scale] of [['#fff0de',4,[-3,4,4],[3,5,.1]],['#cbb3ed',2,[3,2,0],[.1,4,3]],['#ffffff',2,[0,4,-2],[4,.1,2]]] as [string,number,number[],number[]][]){const m=new T.MeshBasicMaterial({color:new T.Color(color).multiplyScalar(power)});resources.push(m);const mesh=new T.Mesh(box,m);mesh.position.set(...position);mesh.scale.set(...scale);lighting.add(mesh);}
  pmrem=new T.PMREMGenerator(renderer);environment=pmrem.fromScene(lighting,.04);scene.environment=environment.texture;
  // Soft studio fill avoids cached self-shadow projections on the shader-deformed head.
  // Surface normals and the existing environment supply volume at every angle.
  scene.add(new T.HemisphereLight('#d0c6df','#17151d',.9));const key=new T.DirectionalLight('#f1e6dc',1.8);key.position.set(-3,4,5);scene.add(key,key.target);
  const fill=new T.DirectionalLight('#d9d1e7',.85);fill.position.set(1,1,4);scene.add(fill);
  const rim=new T.DirectionalLight('#b8a2dc',1.45);rim.position.set(3,2.5,-2);scene.add(rim);renderer.shadowMap.enabled=false;root.dataset.lighting='soft-studio';
  const gltf=await loadEmbedded(GLTFLoader,T,'/experiments/through-my-eyes-live/temporary-head.glb',signal);if(disposed){disposeObject(gltf.scene);return;}model=gltf.scene;scene.add(model);
  let capLoaded=false;try{const accessory=await loadEmbedded(GLTFLoader,T,'/experiments/through-my-eyes-live/studio-cap-fit.glb',signal);if(disposed){disposeObject(accessory.scene);return;}accessory.scene.position.set(-.0005934238,-.1087330282,-.1387039870);model.add(accessory.scene);capLoaded=true;root.dataset.headwear='sk-cap';root.dataset.hair='fitted-short-hair';}catch(error){if(disposed)return;root.dataset.headwear='unavailable';console.warn('Cap accessory unavailable; retaining the existing hair.',error);}
  headphoneAccessory=createNeckHeadphones(T,resources);headphoneAccessory.group.scale.setScalar(.8);headphoneAccessory.group.position.set(-.0005934238,-.1087330282+.42,-.1387039870);model.add(headphoneAccessory.group);headphoneRaycaster=new T.Raycaster();headphonePointer=new T.Vector2();headphoneAccessory.setPlaying(!soundtrack.paused);root.dataset.neckwear='premium-3d-headphones';root.dataset.headphoneControl='ready';
  // Small paired gunmetal hoops, attached to the existing head coordinates.
  for(const side of [-1,1]){const geometry=new T.TorusGeometry(.039,.008,8,40);geometry.rotateY(side*.28);geometry.translate(side*.447,1.108,.127);const material=new T.MeshStandardMaterial({color:'#27232c',metalness:.82,roughness:.29,envMapIntensity:1.1});const hoop=new T.Mesh(geometry,material);hoop.name=side<0?'Earring left':'Earring right';hoop.position.set(-.0005934238,-.1087330282,-.1387039870);model.add(hoop);}root.dataset.earrings='paired-gunmetal-hoops';
  const surfaces=createAvatarSurfaces(T);resources.push(surfaces.cloth,surfaces.flow);if(capLoaded)model.traverse((node:any)=>{if(node.isMesh&&/^Hair/i.test(node.name))node.visible=false;});
  // Presentation-only vertex gestures on a STATIC imported asset. No authored skeleton or morph rig is implied.
  const headMatrix=new T.Matrix4(),eyeMatrix=new T.Matrix4(),rotationX=new T.Matrix4();
  const u={head:{value:new T.Matrix3()},eyes:{value:new T.Matrix3()},blink:{value:0},smile:{value:0}};
  // Static spatial weights are evaluated once, not with pow/exp for every vertex of every frame.
  const prepareGeometry=(geometry:any,blinkSurface=false)=>{
   if(geometry.getAttribute('tmeNeckWeight'))return;
   const pos=geometry.getAttribute('position'),neck=new Float32Array(pos.count),lid=new Float32Array(pos.count),smile=new Float32Array(pos.count*2);
   for(let i=0;i<pos.count;i++){
    const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);neck[i]=smooth((y-.4)/.72);
    if(blinkSurface){const front=smooth((z-.43)/.15),corner=smooth(Math.abs(x)/.20)*(1-smooth((Math.abs(x)-.24)/.12))*Math.exp(-Math.pow((y-1.035)/.10,2))*front;smile[i*2]=Math.sign(x)*.006*corner;smile[i*2+1]=.025*corner;}
    lid[i]=blinkSurface&&z>=.42?Math.exp(-Math.pow((Math.abs(x)-.18)/.12,4)-Math.pow((y-1.365)/.09,4)):0;
   }
   geometry.setAttribute('tmeNeckWeight',new T.BufferAttribute(neck,1));geometry.setAttribute('tmeLidWeight',new T.BufferAttribute(lid,1));geometry.setAttribute('tmeSmileOffset',new T.BufferAttribute(smile,2));
  };
  const gesture=(material:any,eyeCenter?:any)=>{material.onBeforeCompile=(shader:any)=>{
   Object.assign(shader.uniforms,{tmeHead:u.head,tmeEyes:u.eyes,tmeBlink:u.blink,tmeSmile:u.smile,tmeEye:{value:eyeCenter||new T.Vector3()},tmeIsEye:{value:eyeCenter?1:0}});
   shader.vertexShader=`uniform mat3 tmeHead; uniform mat3 tmeEyes; uniform float tmeBlink; uniform float tmeSmile; uniform vec3 tmeEye; uniform float tmeIsEye; attribute float tmeNeckWeight; attribute float tmeLidWeight; attribute vec2 tmeSmileOffset;
`+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
if(tmeIsEye>.5){transformed=tmeEye+tmeEyes*(transformed-tmeEye);transformed.y=mix(transformed.y,tmeEye.y,tmeBlink*.98);}
else {transformed.y=mix(transformed.y,1.365,tmeLidWeight*tmeBlink*.98);transformed.xy+=tmeSmileOffset*tmeSmile;}
vec3 pivot=vec3(0.,.95,.05);transformed=mix(transformed,pivot+tmeHead*(transformed-pivot),tmeNeckWeight);`);
   shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
if(tmeIsEye>.5)objectNormal=tmeEyes*objectNormal;
objectNormal=normalize(mix(objectNormal,tmeHead*objectNormal,tmeNeckWeight));`);
  };material.customProgramCacheKey=()=>`tme-weighted-gesture-${eyeCenter?'eye':'surface'}`;};
  const replacedMaterials=new Set<any>();
  model.traverse((node:any)=>{if(!node.isMesh)return;node.frustumCulled=false;prepareGeometry(node.geometry,([].concat(node.material) as any[]).some(m=>/^Skin/.test(m.name)));if(/^Earring/.test(node.name))node.geometry.getAttribute('tmeNeckWeight').array.fill(1);const isEye=/sclera|\.iris\./i.test(node.name);node.geometry.computeBoundingBox();const center=isEye?node.geometry.boundingBox.getCenter(new T.Vector3()):undefined;
   node.material=(Array.isArray(node.material)?node.material:[node.material]).map((old:any)=>{replacedMaterials.add(old);let m=old.clone();if(/^Skin/.test(old.name)){m.color.set('#bfa393');m.roughness=.94;m.metalness=0;m.envMapIntensity=.75;}if(/^Hair/.test(old.name)){m.color.set('#251f20');m.roughness=.90;m.metalness=0;if(/^Hair|^Under-cap/i.test(node.name)){m.bumpMap=surfaces.flow;m.bumpScale=/^Under-cap/i.test(node.name)?.0012:.009;}}if(/^Cap/.test(old.name)){m.roughness=.92;m.metalness=0;m.envMapIntensity=.6;if(/woven|underside/i.test(old.name)){m.bumpMap=surfaces.cloth;m.bumpScale=.003;}}if(/^Frame/.test(old.name)){m.color.set('#b9abc7');m.roughness=.35;m.metalness=.65;}if(/^Lens/i.test(node.name)){m=new T.MeshPhysicalMaterial({color:'#c4b2df',transparent:true,opacity:.07,roughness:.12,metalness:0,depthWrite:false,side:T.DoubleSide,forceSinglePass:true});}gesture(m,center);return m;});if(node.material.length===1)node.material=node.material[0];node.castShadow=false;node.receiveShadow=false;
  });
  replacedMaterials.forEach(material=>material.dispose());
  const artifact=root.querySelector<HTMLImageElement>('[data-reflection-image]')!;let texture=await new T.TextureLoader().loadAsync(artifact.src);if(disposed){texture.dispose();return;}
  // This authentic artifact is the view THROUGH the lens, not a CSS-expanded DOM layer.
  // Retain source resolution because the actual camera travels to the lens plane.
  resources.push(texture);texture.colorSpace=T.SRGBColorSpace;root.dataset.reflectionTexture=`${texture.image.width}×${texture.image.height}`;
  const shape=new T.Shape();for(let i=0;i<=64;i++){const a=i/64*Math.PI*2,x=.18+.17*Math.sign(Math.cos(a))*Math.pow(Math.abs(Math.cos(a)),.8),y=1.36+.108*Math.sin(a);if(i===0)shape.moveTo(x,y);else shape.lineTo(x,y);}
  const g=new T.ShapeGeometry(shape),uv=g.attributes.uv,pos=g.attributes.position;for(let i=0;i<pos.count;i++){pos.setZ(i,.704);uv.setXY(i,(pos.getX(i)-.01)/.34,(pos.getY(i)-1.252)/.216);}g.computeVertexNormals();prepareGeometry(g);
  const m=new T.MeshBasicMaterial({map:texture,transparent:true,opacity:0,toneMapped:false,side:T.DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});gesture(m);const reflection=new T.Mesh(g,m);reflection.position.set(-.0005934,-.108733,-.138704);reflection.renderOrder=10;model.add(reflection);
  const screenUniform={opening:{value:texture},mix:{value:0},size:{value:new T.Vector2(1,1)}};
  let openingGeneration=0,openingWidth=0,openingHeight=0,openingTarget=world;
  root.addEventListener('tme:prepare-project',async e=>{const detail=(e as CustomEvent).detail;const target=document.getElementById(detail.target);if(!target){detail.ready(false);return;}openingTarget=target;detail.ready(await refreshOpening());},{signal});
  const refreshOpening=async()=>{
   const generation=++openingGeneration;openingWidth=stage.clientWidth;openingHeight=stage.clientHeight;
   try{const opening=await captureOpening(openingTarget,openingWidth,openingHeight);if(disposed||generation!==openingGeneration)return;const previous=screenUniform.opening.value;const openingMap=new T.CanvasTexture(opening);openingMap.colorSpace=T.SRGBColorSpace;resources.push(openingMap);screenUniform.opening.value=openingMap;if(previous!==texture){previous.dispose();const index=resources.indexOf(previous);if(index>=0)resources.splice(index,1);}root.dataset.openingTexture=openingTarget===world?'captured-existing-D2L':'captured-existing-project';root.dataset.lensProject=openingTarget.id;root.dataset.openingSize=`${openingWidth}×${openingHeight}`;invalidate();return true;}catch(error){root.dataset.openingTexture='artifact-only';console.warn('Project opening texture unavailable:',error);return false;}
  };
  prepareDestination=(id:string)=>{if(openingTarget.id===id)return;const target=document.getElementById(id);if(target){openingTarget=target;void refreshOpening();}};
  await refreshOpening();if(disposed)return;

  const gestureCompile=m.onBeforeCompile;
  m.onBeforeCompile=(shader:any)=>{gestureCompile(shader);Object.assign(shader.uniforms,{tmeOpening:screenUniform.opening,tmeScreenMix:screenUniform.mix,tmeBufferSize:screenUniform.size});shader.fragmentShader='uniform sampler2D tmeOpening; uniform float tmeScreenMix; uniform vec2 tmeBufferSize;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb=mix(diffuseColor.rgb,texture2D(tmeOpening,gl_FragCoord.xy/tmeBufferSize).rgb,tmeScreenMix);');};
  m.customProgramCacheKey=()=> 'tme-lens-camera-opening';

  let scannerX=0,scannerBlend=0;let scale=1,baseX=0,baseY=0,worldW=0,worldH=0,cropX=0,cropY=0,cropWidth=0,cropHeight=0,lastCrop='';
  const frameRegion=(p:number)=>{
   const key=`${width}:${height}:${p>.06||Math.abs(scannerX)>.001||root.dataset.scanner!=='closed'?'journey':'portrait'}`;if(key===lastCrop)return;lastCrop=key;
   cropX=p>.06||width<=700||Math.abs(scannerX)>.001||root.dataset.scanner!=='closed'?0:Math.floor(width*.38);cropY=p>.06||width>700?0:Math.max(0,Math.floor(parseFloat(stage.style.getPropertyValue('--mobile-portrait-top'))||height*.44));cropWidth=width-cropX;cropHeight=height-cropY;
   // Render only the character region at rest. View offsets preserve the original projection exactly.
   camera.setViewOffset(width,height,cropX,cropY,cropWidth,cropHeight);renderer.setSize(cropWidth,cropHeight,false);
   Object.assign(canvas.style,{left:`${cropX}px`,top:`${cropY}px`,width:`${cropWidth}px`,height:`${cropHeight}px`});
  };
  const resize=()=>{width=stage.clientWidth;height=stage.clientHeight;if(!width||!height)return;if(width!==openingWidth||height!==openingHeight)void refreshOpening();nativeDpr=diagnosticFull?devicePixelRatio:Math.min(devicePixelRatio,width<=700?1.25:1.5);renderer.setPixelRatio(nativeDpr*quality);root.dataset.effectiveDpr=renderer.getPixelRatio().toFixed(2);portalContent.style.width=`${width}px`;portalContent.style.height=`${height}px`;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();worldH=2*Math.tan(T.MathUtils.degToRad(16))*4.8;worldW=worldH*camera.aspect;const mobile=width<=700;scale=mobile?Math.min(.47,worldW*.42/1.4):Math.min(width<=1050?.86:.98,worldH*(width<=1050?.66:.76)/2.1);baseX=worldW*.24;
   const portraitTop=parseFloat(stage.style.getPropertyValue('--mobile-portrait-top'))||height*.55;
   baseY=mobile?1+(height/2-(portraitTop+110))*worldH/height-1.35*scale:width<=1050?-.03:-.08;key.target.position.set(baseX,baseY+1.2*scale,0);lastCrop='';frameRegion(cachedProgress);lastProgress=-1;sceneDirty=true;request();};
  if(import.meta.env.DEV)root.addEventListener('tme:quality',e=>{diagnosticFull=(e as CustomEvent).detail==='full';fixedQuality=diagnosticFull;quality=1;renderer.shadowMap.enabled=false;root.dataset.quality='1';qualityLast=qualityFrames=qualityElapsed=0;warmUntil=performance.now()+2500;resize();},{signal});
  await Promise.all([renderer.compileAsync(scene,camera),document.fonts.ready,signature.prepare(T,model,lighting,scene)]);if(disposed)return;
  root.dataset.ready='true';setSequence(reduced||paused||!signature.active?'interactive':'entrance');if(!reduced&&!paused&&signature.active)behavior.arrive();
  glasses=document.createElement('button');glasses.type='button';glasses.className='tme-glasses-target';glasses.setAttribute('aria-label','Open Perspective Scanner');glasses.setAttribute('aria-controls','hero-projects');glasses.setAttribute('aria-expanded','false');glasses.dataset.scannerTarget='true';glasses.innerHTML='<span>Scan perspectives ↗</span>';stage.append(glasses);glasses.addEventListener('pointerenter',acknowledge,{signal});glasses.addEventListener('focus',acknowledge,{signal});
  const lensNodes:any[]=[];model.traverse((n:any)=>{if(n.isMesh&&/^Lens/i.test(n.name))lensNodes.push(n);});
  const lensButtons=[glasses];if(lensNodes.length>1){const second=glasses.cloneNode(true) as HTMLButtonElement;second.tabIndex=-1;second.setAttribute('aria-label','Open Perspective Scanner from the other lens');stage.append(second);lensButtons.push(second);signal.addEventListener('abort',()=>second.remove(),{once:true});}
  const hitSamples=lensNodes.slice(0,2).map((n:any)=>{const a=n.geometry.attributes.position,points:any[]=[];for(let i=0;i<a.count;i+=Math.max(1,Math.floor(a.count/48)))points.push(new T.Vector3().fromBufferAttribute(a,i));return{node:n,points};});
  const projectedHit=new T.Vector3(),hitPivot=new T.Vector3(0,.95,.05);
  const hull=(pts:number[][])=>{pts.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cross=(o:number[],a:number[],b:number[])=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lower:number[][]=[],upper:number[][]=[];for(const p of pts){while(lower.length>=2&&cross(lower[lower.length-2],lower[lower.length-1],p)<=0)lower.pop();lower.push(p);}for(const p of [...pts].reverse()){while(upper.length>=2&&cross(upper[upper.length-2],upper[upper.length-1],p)<=0)upper.pop();upper.push(p);}return lower.slice(0,-1).concat(upper.slice(0,-1));};
  root.dataset.asset='temporary-phase-11-static-study';status.textContent='';resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);resize();motionState();
  observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>0&&(root.dataset.cinematic!=='true'||['perspective','through-lens'].includes(root.dataset.scene||''));last=0;sceneDirty=true;request();});observer.observe(journey);
  const hitsHeadphoneControl=(event:PointerEvent)=>{
   if(!headphoneAccessory||!headphoneRaycaster||!headphonePointer||lensActive||!heroOnscreen)return false;
   const target=event.target as Element;
   if(target.closest('a,button,input,textarea,select,summary'))return false;
   const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height||event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)return false;
   headphonePointer.set((event.clientX-rect.left)/rect.width*2-1,-((event.clientY-rect.top)/rect.height*2-1));
   headphoneRaycaster.setFromCamera(headphonePointer,camera);
   return headphoneRaycaster.intersectObject(headphoneAccessory.control,true).length>0;
  };
  stage.addEventListener('focusin',()=>{if(sequence==='entrance'){clearType();setSequence('interactive');invalidate();}},{signal});
  stage.addEventListener('pointermove',e=>{
   if(e.pointerType==='mouse'){
    const hovering=hitsHeadphoneControl(e);headphoneAccessory?.setHovered(hovering);root.dataset.headphoneHovered=String(hovering);stage.style.cursor=hovering?'pointer':'';if(hovering)request();
    if(!reduced&&!paused){const rect=stage.getBoundingClientRect();interactionUntil=performance.now()+2600;behavior.pointer((e.clientX-rect.left)/rect.width*2-1,(e.clientY-rect.top)/rect.height*2-1);request();}
   }
  },{passive:true,signal});
  stage.addEventListener('pointerdown',e=>{if(e.button!==0||!hitsHeadphoneControl(e))return;pressedHeadphonePointer=e.pointerId;e.preventDefault();try{stage.setPointerCapture(e.pointerId);}catch{}},{signal});
  stage.addEventListener('pointerup',e=>{if(pressedHeadphonePointer!==e.pointerId)return;pressedHeadphonePointer=null;if(hitsHeadphoneControl(e)){e.preventDefault();e.stopPropagation();headphoneAccessory?.pulse();void toggleSoundtrack();}},{signal});
  stage.addEventListener('pointercancel',()=>{pressedHeadphonePointer=null;},{signal});
  stage.addEventListener('pointerleave',()=>{behavior.leave();headphoneAccessory?.setHovered(false);root.dataset.headphoneHovered='false';stage.style.cursor='';if(!reduced&&!paused)request();},{signal});
  window.addEventListener('scroll',invalidate,{passive:true,signal});document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(raf);raf=0;}else request();},{signal});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cleanup();fallback();},{signal});
  let fadeStart=-1,fadeEnd=-1;const fadePoint=new T.Vector3();
  const lensNormal=new T.Vector3(),alignPoint=new T.Vector3(),endPoint=new T.Vector3(),lensSide=new T.Vector3(),lensPoint=new T.Vector3(),facePoint=new T.Vector3(),target=new T.Vector3(),from=new T.Vector3(),to=new T.Vector3(),projected=new T.Vector3(),dollyOffset=new T.Vector3();let phase='';
  let qualityFrames=0,qualityElapsed=0,qualityLast=0,warmUntil=performance.now()+2500;
  root.dataset.triangles='0';root.dataset.drawCalls='0';
  function drawFrame(now:number){
   raf=0;if(disposed||document.hidden||readerOpen)return;
   if(sceneDirty){const rect=journey.getBoundingClientRect();heroOnscreen=root.dataset.cinematic==='true'?['perspective','through-lens'].includes(root.dataset.scene||''):rect.bottom>1;if(!lensActive&&!reduced){phase=heroOnscreen?'intro':'project';root.dataset.phase=phase;}cachedProgress=reduced||!lensActive?0:lensProgress;sceneDirty=false;}
   const p=cachedProgress,compositionChanged=p!==lastProgress;
   if(compositionChanged){const reveal=reduced||!lensActive?1:smooth((p-.975)/.025);world.style.setProperty('--reveal',String(reveal));world.inert=lensActive&&!reduced&&p<.99;const nextPhase=reduced?'reduced':!lensActive?(heroOnscreen?'intro':'project'):p<.12?'intro':p<.36?'eye-contact':p<.65?'face':p<.95?'lens':'project';if(phase!==nextPhase){phase=nextPhase;root.dataset.phase=phase;}}
   if((!visible||!heroOnscreen)&&!lensActive)return;
   frameRegion(p);
   const entranceProgress=sequence==='entrance'?(frames===0?0:clamp((now-sequenceStart)/signature.duration)):1;if(sequence==='entrance'&&entranceProgress===1)setSequence('interactive');
   const animated=visible&&!paused&&!reduced,bodyWeight=1-smooth((p-.12)/.34),idle=animated&&!lensActive&&sequence!=='entrance';
   const responsive=now<interactionUntil||behavior.pose.blink>.01||behavior.pose.mode==='attention'||behavior.pose.mode==='return';
   if(idle&&!responsive&&now-lastDraw<(width<701?50:1000/30)-1){request();return;}const dt=last?Math.min((now-last)/1000,.08):0;last=now;lastDraw=now;
   const pose=behavior.step(dt,animated,lensActive?p:null);
   if(reduced)behavior.neutral();
   const {yaw,pitch,gazeX,gazeY,blink}=pose;
   headMatrix.makeRotationY(yaw).multiply(rotationX.makeRotationX(pitch));u.head.value.setFromMatrix4(headMatrix);eyeMatrix.makeRotationY(gazeX*.20).multiply(rotationX.makeRotationX(gazeY*.14));u.eyes.value.setFromMatrix4(eyeMatrix);u.blink.value=blink;u.smile.value=pose.smile;
   const scanOpen=['preview','pinned','entering'].includes(root.dataset.scanner||'');const scanBlendTarget=lensActive?scannerBlend:scanOpen&&width>700?1:0;scannerBlend=reduced?scanBlendTarget:scannerBlend+(scanBlendTarget-scannerBlend)*(1-Math.exp(-dt*7));const scanTarget=-worldW*(width>1100?.47:.49)*scanBlendTarget;scannerX=-worldW*(width>1100?.47:.49)*scannerBlend;root.dataset.scannerReframed=String(scannerBlend>.001);model.scale.setScalar(scale*(1-scannerBlend*.01));model.position.set(baseX+scannerX,baseY+pose.breathe-scannerBlend*.10,0);model.rotation.z=pose.lean;model.rotation.y=-.26*bodyWeight;model.updateMatrixWorld(true);
   facePoint.set(0,1.25,.43).applyMatrix4(model.matrixWorld);lensPoint.set(.18,.41,.654).applyMatrix3(u.head.value).add(dollyOffset.set(-.0005934,.841267,-.088704)).applyMatrix4(model.matrixWorld);
   // Actual Three.js camera path: acknowledge, align on the selected lens normal,
   // then dolly to the lens surface. No DOM enlargement or CSS zoom carries this journey.
   const align=smooth((p-.14)/.30),dolly=smooth((p-.44)/.56);
   from.set(-.04*scannerBlend,1+.035*scannerBlend,4.8-.12*scannerBlend);
   lensNormal.set(0,0,1).applyMatrix3(u.head.value).transformDirection(model.matrixWorld);
   alignPoint.copy(lensPoint).addScaledVector(lensNormal,1.35*scale);
   endPoint.copy(lensPoint).addScaledVector(lensNormal,.025*scale);
   camera.position.copy(from).lerp(alignPoint,align).lerp(endPoint,dolly);
   target.set(0,1,0).lerp(lensPoint,align);camera.lookAt(target);
   if(sequence==='entrance'){const e=1-smooth(entranceProgress);camera.position.x+=e*.24;camera.position.y+=e*.10;camera.position.z+=e*.8;camera.lookAt(target);}
   camera.near=.003;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
   if(headphoneAccessory){headphoneAccessory.controlPoint.getWorldPosition(projected).project(camera);root.dataset.headphoneControlX=String(Math.round(cropX+(projected.x+1)*cropWidth/2));root.dataset.headphoneControlY=String(Math.round(cropY+(1-projected.y)*cropHeight/2));if(headphoneAccessory.update(now))request();}
   m.opacity=lensActive&&root.dataset.lensProject===activeLensTarget&&(sequence!=='return'||returnThroughLens)?smooth((p-.18)/.22):0;screenUniform.mix.value=lensActive&&root.dataset.lensProject===activeLensTarget&&root.dataset.openingTexture?.startsWith('captured-existing')?(root.dataset.cinematic==='true'?1:smooth((p-.70)/.18)):0;renderer.getDrawingBufferSize(screenUniform.size.value);
   key.intensity=2.12+pose.highlight*.32;fill.intensity=.65+pose.highlight*.25;rim.intensity=1.45+pose.highlight*.45;
   portal.style.opacity='0';caption.style.opacity='0';
   projected.copy(lensPoint).project(camera);const left=cropX+(projected.x+1)*cropWidth/2,top=cropY+(1-projected.y)*cropHeight/2;
   lensSide.copy(lensPoint).addScaledVector(lensNormal,0); // Reused vectors; no frame allocations.
   lensSide.set(.35,.41,.654).applyMatrix3(u.head.value).add(dollyOffset.set(-.0005934,.841267,-.088704)).applyMatrix4(model.matrixWorld).project(camera);
   const lensRadius=Math.abs((lensSide.x-projected.x)*cropWidth/2);
   root.dataset.glassesX=String(stage.getBoundingClientRect().left+left);root.dataset.glassesY=String(stage.getBoundingClientRect().top+top);
   hitSamples.forEach(({node,points}:any,i:number)=>{const button=lensButtons[i];if(!button)return;button.hidden=lensActive||!heroOnscreen;const pts=points.map((point:any)=>{projectedHit.copy(point).sub(hitPivot).applyMatrix3(u.head.value).add(hitPivot).applyMatrix4(node.matrixWorld).project(camera);return[cropX+(projectedHit.x+1)*cropWidth/2,cropY+(1-projectedHit.y)*cropHeight/2];});const contour=hull(pts),xs=contour.map(p=>p[0]),ys=contour.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;if(w<1||h<1){button.hidden=true;return;}Object.assign(button.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px',clipPath:`polygon(${contour.map(p=>`${(p[0]-x)/w*100}% ${(p[1]-y)/h*100}%`).join(',')})`});button.dataset.hitGeometry='projected-lens-mesh';});
   if(!lensActive){
    fadePoint.set(-.0005934,.65-.108733,.15-.138704).applyMatrix4(model.matrixWorld).project(camera);const startFade=Math.round(cropY+(1-fadePoint.y)*cropHeight/2);
    fadePoint.set(-.0005934,.20-.108733,.15-.138704).applyMatrix4(model.matrixWorld).project(camera);const endFade=Math.round(cropY+(1-fadePoint.y)*cropHeight/2);
    if(Math.abs(startFade-fadeStart)>1||Math.abs(endFade-fadeEnd)>1){fadeStart=startFade;fadeEnd=endFade;stage.style.setProperty('--portrait-fade-start',startFade+'px');stage.style.setProperty('--portrait-fade-end',endFade+'px');}
   }
   if(compositionChanged||sequence==='entrance'){
    projected.set(0,.77,.43).applyMatrix4(model.matrixWorld).project(camera);stage.style.setProperty('--portrait-cutoff',`${clamp(cropY+(1-projected.y)*cropHeight/2,0,height)}px`);
    const textOpacity=1-smooth((p-.06)/.18);copy.style.setProperty('--intro-opacity',String(textOpacity));copy.inert=lensActive&&p>.25||scanOpen;
    utilities.style.opacity=String(1-smooth((p-.06)/.14));utilities.inert=lensActive&&p>.20;
    canvas.style.opacity='1';stage.style.setProperty('--scene-fade','0');root.dataset.cameraStage=p>.62?'through-lens':p>.14?'align':'portrait';lastProgress=p;
   }
   const submitStart=import.meta.env.DEV?performance.now():0;
   root.dataset.shadows='off';root.dataset.cadence=responsive?'responsive':'idle';
   if(frames===0&&signature.active)signature.start(now);
   renderer.render(scene,camera);signature.render(now,camera,model,u.head.value);frames++;if(frames===1){root.dataset.presented='true';if(sequence==='entrance')sequenceStart=now;}root.dataset.renderCount=String(frames);root.dataset.progress=p.toFixed(3);root.dataset.blink=blink.toFixed(3);root.dataset.smile=pose.smile.toFixed(3);root.dataset.headYaw=yaw.toFixed(4);if(frames===1||compositionChanged||root.dataset.drawCalls!==String(renderer.info.render.calls)){root.dataset.triangles=String(renderer.info.render.triangles);root.dataset.drawCalls=String(renderer.info.render.calls);root.dataset.geometries=String(renderer.info.memory.geometries);root.dataset.textures=String(renderer.info.memory.textures);}root.dataset.cameraDistance=camera.position.distanceTo(lensPoint).toFixed(3);root.dataset.cameraX=camera.position.x.toFixed(3);root.dataset.cameraZ=camera.position.z.toFixed(3);root.dataset.lensRadius=lensRadius.toFixed(1);root.dataset.attention=pose.mode==='attention'||pose.mode==='transition'||pose.mode==='return'?'visitor':pose.mode;root.dataset.behavior=pose.mode;root.dataset.headPitch=pitch.toFixed(4);root.dataset.gazeY=gazeY.toFixed(4);root.dataset.gazeX=gazeX.toFixed(4);root.dataset.frameMs=(performance.now()-now).toFixed(2);
   if(import.meta.env.DEV&&root.dataset.perfActive==='true')root.dispatchEvent(new CustomEvent('tme:frame',{detail:{timestamp:performance.now(),rendered:true,submissionMs:performance.now()-submitStart}}));
   // Cadence-based resolution adaptation: two conservative steps, no geometry or material substitution.
   // Ignore warmup, inactive periods and the scroll-driven camera journey.
   if(idle&&!fixedQuality&&now>warmUntil){
    if(qualityLast){qualityElapsed+=now-qualityLast;qualityFrames++;}
    qualityLast=now;
    if(qualityFrames>=30){
     const mean=qualityElapsed/qualityFrames;
     if(mean>48&&quality>.71){quality=Math.max(.7,quality-.15);renderer.setPixelRatio(nativeDpr*quality);renderer.setSize(cropWidth,cropHeight,false);root.dataset.quality=quality.toFixed(2);root.dataset.effectiveDpr=(nativeDpr*quality).toFixed(2);warmUntil=now+2000;}
     qualityFrames=qualityElapsed=0;
    }
   }else{qualityLast=0;qualityFrames=qualityElapsed=0;}
   root.dataset.effectiveDpr=renderer.getPixelRatio().toFixed(2);
   const settling=!paused&&(Math.abs(yaw)+Math.abs(pitch)>.001);
   if(idle||sequence==='entrance'||lensActive||Math.abs(scannerX-scanTarget)>.001||(visible&&!reduced&&settling))request();
  }
  draw=drawFrame;request();
 }catch(error){if(!disposed){console.warn('Through My Eyes reference fallback:',error instanceof Error?error.message:'Renderer unavailable');fallback();}}
 // Assigned only after the runtime and asset have loaded; initial controls can safely request a frame.

}
