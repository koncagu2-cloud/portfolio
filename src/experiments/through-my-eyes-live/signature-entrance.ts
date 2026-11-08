/** A short, readiness-driven accessory handoff. The temporary renderer reuses the
 * imported glasses geometry and is disposed as soon as it meets the real frames.
 * It never owns project navigation or the existing lens camera.
 */
export function createSignatureEntrance(root:HTMLElement,signal:AbortSignal){
 const media=matchMedia('(prefers-reduced-motion: reduce)'),opening=root.querySelector<HTMLElement>('[data-signature-opening]')!;
 const started=performance.now(),duration=innerWidth<=700?1050:1200;
 const eligible=(!location.hash||location.hash==='#perspective')&&!media.matches;
 let active=eligible,landed=false,playing=false,revealed=false,finished=false,start=0,version=0;
 let T:any,renderer:any,environment:any,pmrem:any,group:any,scene:any,view:any,canvas:HTMLCanvasElement|undefined;
 const materials:any[]=[],originals:any[]=[],pieces:{mesh:any;position:any;direction:number}[]=[],lights:{source:any;copy:any}[]=[];
 let players:Animation[]=[];
 let sourceWidth=.8,anchor:any,anchorInverse:any,initialQ:any,pivot:any,backPivot:any,startM:any,endM:any,rotationM:any,startP:any,endP:any,startQ:any,endQ:any,startS:any,endS:any,q:any,up:any,forward:any,sweep:any;
 const clamp=(x:number)=>Math.max(0,Math.min(1,x)),ease=(x:number)=>{x=clamp(x);return x*x*(3-2*x);};
 const emit=(name:string,detail?:unknown)=>root.dispatchEvent(new CustomEvent(name,{detail}));
 const state=(value:string)=>{root.dataset.opening=value;document.documentElement.dataset.tmeEntrance=value==='complete'?'off':'pending';};
 const release=()=>{originals.forEach(n=>n.visible=true);canvas?.remove();canvas=undefined;materials.forEach(m=>m.dispose());materials.length=0;environment?.dispose();environment=undefined;pmrem?.dispose();pmrem=undefined;renderer?.dispose();renderer?.forceContextLoss();renderer=undefined;scene?.clear();};
 const finish=(skipped=false)=>{
  if(finished)return;finished=true;active=false;version++;players.forEach(p=>p.cancel());players=[];release();state('complete');opening.hidden=true;
  const focused=opening.contains(document.activeElement);emit('tme:opening-finished',{skipped});if(focused)root.querySelector<HTMLElement>('.tme-enter')?.focus({preventScroll:true});
 };
 opening.querySelector('[data-opening-skip]')!.addEventListener('click',()=>finish(true),{signal});
 root.addEventListener('tme:scene',e=>{if((e as CustomEvent).detail!=='perspective')finish(true);},{signal});
 root.addEventListener('tme:reader',e=>{if((e as CustomEvent).detail)finish(true);},{signal});
 root.addEventListener('tme:camera',e=>{if((e as CustomEvent).detail.active)finish(true);},{signal});
 window.addEventListener('keydown',e=>{if(e.key==='Escape'&&active){e.preventDefault();finish(true);}},{signal});
 media.addEventListener('change',()=>{if(media.matches)finish(true);},{signal});
 signal.addEventListener('abort',()=>finish(true),{once:true});
 if(eligible){opening.hidden=false;state('loading');}else finish(true);
 const reveal=()=>{
  if(revealed||!active)return;revealed=true;state('entering');const token=version;
  const cue=(selector:string,delay:number,duration:number,headline=false)=>{
   root.querySelectorAll<HTMLElement>(selector).forEach((element,i)=>{
    players.push(element.animate(headline?[
     {transform:'translate3d(0,75%,0) rotateX(-14deg)',clipPath:'inset(0 0 100% 0)'},
     {transform:'translate3d(0,0,0) rotateX(0)',clipPath:'inset(0 0 0 0)'}
    ]:[{transform:'translate3d(0,22px,0)',clipPath:'inset(0 0 100% 0)'},{transform:'translate3d(0,0,0)',clipPath:'inset(0 0 0 0)'}],{delay:delay+i*35,duration,easing:'cubic-bezier(.18,.78,.2,1)',fill:'backwards'}));
   });
  };
  cue('.tme-scene-brand',0,400);cue('.tme-scene-position',40,420);cue('.tme-scene-nav>button',100,420);
  cue('.tme-type>.tme-eyebrow',0,420);cue('.tme-through-word',55,590,true);cue('.tme-eyes-line',135,620,true);
  cue('.tme-intro',225,460);cue('.tme-scanner-launch',285,430);cue('.tme-d2l-entry',345,400);cue('.tme-lens-guidance',345,400);cue('.tme-utilities',370,400);
  void Promise.allSettled(players.map(p=>p.finished)).then(()=>{if(token===version&&active)finish();});
 };
 return{
  duration,
  get active(){return active;},
  skip:()=>finish(true),
  async prepare(three:any,model:any,lighting:any,sourceScene:any){
   if(!active)return;T=three;
   try{
    canvas=document.createElement('canvas');canvas.className='tme-signature-canvas';canvas.setAttribute('aria-hidden','true');opening.prepend(canvas);
    renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.78;
    scene=new T.Scene();group=new T.Group();group.matrixAutoUpdate=false;scene.add(group);view=new T.PerspectiveCamera();
    pmrem=new T.PMREMGenerator(renderer);environment=pmrem.fromScene(lighting,.04);scene.environment=environment.texture;
    sourceScene.children.filter((n:any)=>n.isLight).forEach((source:any)=>{const copy=source.clone();copy.castShadow=false;scene.add(copy);if(copy.target)scene.add(copy.target);lights.push({source,copy});});
    sweep={value:-.6};
    model.traverse((node:any)=>{
     if(!node.isMesh||!/^Glasses|^Lens/i.test(node.name))return;
     originals.push(node);
     const original=Array.isArray(node.material)?node.material:[node.material];
     const cloned=original.map((source:any)=>{
      const material=source.clone();material.onBeforeCompile=()=>{};material.customProgramCacheKey=()=> 'signature-optical';materials.push(material);
      if(/^Lens/i.test(node.name)){
       material.onBeforeCompile=(shader:any)=>{
        shader.uniforms.signatureSweep=sweep;shader.vertexShader='varying vec2 signaturePosition;\n'+shader.vertexShader;
        shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nsignaturePosition=position.xy;');
        shader.fragmentShader='varying vec2 signaturePosition; uniform float signatureSweep;\n'+shader.fragmentShader;
        shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat signatureLight=exp(-pow((signaturePosition.x-signatureSweep-(signaturePosition.y-1.36)*.4)/.032,2.)); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.88,.78,1.),signatureLight*.65); diffuseColor.a+=signatureLight*.16;');
       };material.customProgramCacheKey=()=> 'signature-reflection';
      }
      return material;
     });
     const mesh=new T.Mesh(node.geometry,cloned.length===1?cloned[0]:cloned);mesh.position.copy(node.position);mesh.quaternion.copy(node.quaternion);mesh.scale.copy(node.scale);mesh.frustumCulled=false;
     group.add(mesh);pieces.push({mesh,position:node.position.clone(),direction:/bridge/i.test(node.name)?0:node.geometry.boundingBox?.getCenter(new T.Vector3()).x<0?-1:1});
    });
    if(!pieces.length)throw new Error('Imported frames are unavailable.');
    const bounds=new T.Box3().setFromObject(group);sourceWidth=bounds.max.x-bounds.min.x;
    anchor=new T.Vector3(-.0005934,1.251267,.561296);anchorInverse=new T.Matrix4().makeTranslation(-anchor.x,-anchor.y,-anchor.z);initialQ=new T.Quaternion().setFromEuler(new T.Euler(.045,-.12,-.025));pivot=new T.Matrix4().makeTranslation(-.0005934,.841267,-.088704);backPivot=pivot.clone().invert();
    startM=new T.Matrix4();endM=new T.Matrix4();rotationM=new T.Matrix4();startP=new T.Vector3();endP=new T.Vector3();startQ=new T.Quaternion();endQ=new T.Quaternion();startS=new T.Vector3();endS=new T.Vector3();q=new T.Quaternion();up=new T.Vector3();forward=new T.Vector3();
    await renderer.compileAsync(scene,view);if(!active)release();
   }catch(error){console.warn('Signature entrance unavailable; continuing to the portfolio.',error);finish(true);}
  },
  start(now:number){
   if(!active||!renderer)return;start=now;playing=true;originals.forEach(n=>n.visible=false);state('handoff');root.dataset.openingGeometry='imported-glasses';
  },
  render(now:number,camera:any,model:any,head:any){
   if(!active||!playing||!renderer)return;
   if(landed){release();playing=false;return;}
   const stage=root.querySelector<HTMLElement>('[data-stage]')!,width=stage.clientWidth,height=width<=700?Math.min(stage.clientHeight,innerHeight-84):stage.clientHeight;
   if(!width||!height){finish(true);return;}
   if(canvas!.width!==Math.round(width*renderer.getPixelRatio())||canvas!.height!==Math.round(height*renderer.getPixelRatio()))renderer.setSize(width,height,false);
   canvas!.style.width=width+'px';canvas!.style.height=height+'px';view.copy(camera);view.clearViewOffset();view.updateMatrixWorld(true);
   const p=clamp((now-start)/duration),flight=1-Math.pow(1-clamp((p-.04)/.96),3),assembly=1-ease((now-started)/550);
   const worldHeight=2*Math.tan(T.MathUtils.degToRad(view.fov/2))*4.5,desiredWidth=Math.min(width*(width<=700?.76:.28),380);
   camera.getWorldDirection(forward);startP.copy(camera.position).addScaledVector(forward,4.5);up.set(0,1,0).applyQuaternion(camera.quaternion);
   startP.addScaledVector(up,(.5-innerHeight/2/height)*worldHeight);
   startQ.copy(initialQ);startS.setScalar(desiredWidth/height*worldHeight/sourceWidth);
   startM.compose(startP,startQ,startS).multiply(anchorInverse);startM.decompose(startP,startQ,startS);
   rotationM.identity().setFromMatrix3(head);endM.copy(model.matrixWorld).multiply(pivot).multiply(rotationM).multiply(backPivot);endM.decompose(endP,endQ,endS);
   startP.lerp(endP,flight);startS.lerp(endS,flight);q.copy(startQ).slerp(endQ,flight);group.matrix.compose(startP,q,startS);
   pieces.forEach(({mesh,position,direction})=>{mesh.position.copy(position);mesh.position.x+=direction*.10*assembly;mesh.position.y+=.035*assembly;mesh.position.z+=.06*assembly;});
   lights.forEach(({source,copy})=>{copy.intensity=source.intensity;copy.position.copy(source.position);if(copy.target)copy.target.position.copy(source.target.position);});
   sweep.value=-.6+p*1.2;
   root.style.setProperty('--opening-cover',String(1-ease((p-.05)/.85)));
   renderer.render(scene,view);
   if(p>.48)reveal();
   if(p===1){landed=true;originals.forEach(n=>n.visible=true);root.dataset.openingLanded='true';emit('tme:opening-landed');}
  }
 };
}
