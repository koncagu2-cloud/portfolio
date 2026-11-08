import {createCharacter} from '../through-my-eyes/character';
import {createGlasses} from '../through-my-lens/glasses';
import {budgets,type RigConfig} from './config';
// Three is the existing vendored runtime. These structural contracts isolate its untyped addon.
export interface FrameInput{yaw:number;gazeX:number;gazeY:number;tracking:boolean;blink:number}
export interface CharacterAsset{
 root:any;head:any;eyeTarget:any;focusTarget:any;kind:'gltf'|'placeholder';label:string;clips:string[];
 morphs:{key:string;label:string}[];materials:any[];report:Record<string,unknown>;
 play:(name:string)=>void;update:(dt:number,time:number,input:FrameInput)=>void;
 setMorph:(key:string,value:number|null)=>void;dispose:()=>void;
}
export function disposeObject(root:any){
 const roots=Array.isArray(root)?root:[root];
 const geometries=new Set<any>(),materials=new Set<any>(),textures=new Set<any>(),skeletons=new Set<any>(),images=new Set<any>();
 roots.forEach(root=>root.traverse((node:any)=>{if(node.geometry)geometries.add(node.geometry);if(node.skeleton)skeletons.add(node.skeleton);for(const m of [].concat(node.material||[]) as any[]){materials.add(m);for(const v of Object.values(m) as any[])if(v?.isTexture)textures.add(v);}}));
 geometries.forEach(g=>g.dispose());skeletons.forEach(s=>s.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>{const image=t.source?.data;if(image)images.add(image);t.dispose();});images.forEach(i=>i.close?.());roots.forEach(root=>root.removeFromParent());
}
export function placeholderAsset(T:any):CharacterAsset{
 const resources:any[]=[];const c=createCharacter(T,resources);let closed=false;
 return {root:c.body,head:c.head,eyeTarget:c.eyeTarget,focusTarget:c.head,kind:'placeholder',label:'Existing non-likeness placeholder',clips:[],morphs:[],materials:[],report:{note:'Fallback only. Original procedural character is unchanged. No imported rig or facial controls.'},play:()=>{},setMorph:()=>{},update:(dt,t,input)=>{c.head.rotation.y=input.yaw*.3;c.animate(t,input.gazeX,input.gazeY,0,dt>0);},dispose:()=>{if(closed)return;closed=true;c.body.removeFromParent();resources.forEach(r=>r.dispose());}};
}
export function adaptGLTF(T:any,gltf:any,config:RigConfig,label:string):CharacterAsset{
 const root=gltf.scene;root.updateMatrixWorld(true);
 const nodes=new Map<string,any[]>();root.traverse((n:any)=>{if(n.name)nodes.set(n.name,[...(nodes.get(n.name)||[]),n]);});
 const unique=(name:string)=>nodes.get(name)?.length===1?nodes.get(name)![0]:null;
 const head=unique(config.head),eyes=config.eyes.map(unique),socket=unique(config.socket);
 const materials=new Set<any>(),skeletons=new Set<any>(),textures=new Set<any>(),morphs:{key:string;label:string;mesh:any;index:number;rest:number}[]=[];
 let triangles=0,skinned=0;root.traverse((n:any)=>{
  if(!n.isMesh)return;triangles+=(n.geometry.index?.count||n.geometry.attributes.position.count)/3;
  if(n.isSkinnedMesh){skinned++;skeletons.add(n.skeleton);}
  for(const material of [].concat(n.material||[]) as any[]){materials.add(material);for(const v of Object.values(material) as any[])if(v?.isTexture)textures.add(v);}
  for(const [name,index] of Object.entries(n.morphTargetDictionary||{}) as [string,number][])morphs.push({key:`${n.uuid}:${index}`,label:`${n.name||'Mesh'} / ${name}`,mesh:n,index,rest:n.morphTargetInfluences[index]||0});
 });
 if(!triangles)throw new Error('No renderable mesh triangles found in the selected scene.');
 const importedGlasses=unique('Glasses');let glassesMode='No glasses attachment',attachmentTriangles=0;
 if(importedGlasses){glassesMode=socket||head?'Authored glasses — verify parent attachment in source':'Authored glasses — no mapped head/socket';}
 else if(config.glasses.enabled&&socket){const resources:any[]=[];const g=createGlasses(T,resources);g.pivot.scale.setScalar(config.glasses.scale);g.pivot.position.set(...config.glasses.position);g.pivot.rotation.set(...config.glasses.rotation);g.pivot.name='SK_AttachedGlasses';socket.add(g.pivot);g.pivot.traverse((n:any)=>{if(n.isMesh)attachmentTriangles+=(n.geometry.index?.count||n.geometry.attributes.position.count)/3;});glassesMode='Existing glasses attached to mapped socket';}
 for(const m of materials){const override=config.materials[m.name];if(!override)continue;if(override.color)m.color?.set(override.color);for(const k of ['roughness','metalness'] as const)if(typeof override[k]==='number'&&k in m)m[k]=T.MathUtils.clamp(override[k],0,1);}
 const basePose=[head,...eyes].filter(Boolean).map(node=>({node,quaternion:node.quaternion.clone()}));
 const blinkTargets=morphs.filter(m=>config.blink.includes(m.label.split(' / ').pop()!));
 const overrides=new Map<string,number>(),mixer=new T.AnimationMixer(root);let current:any=null,closed=false;
 const clips=gltf.animations||[],actions=new Map<string,any>();
 for(const clip of clips)if(!actions.has(clip.name))actions.set(clip.name,mixer.clipAction(clip));
 const play=(name:string)=>{const next=actions.get(name);if(!next){current?.stop();current=null;return;}if(next===current)return;next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).play();if(current)current.crossFadeTo(next,.25,false);current=next;};
 const focusTarget=new T.Object3D();if(head){head.add(focusTarget);const mappedEyes=eyes.filter(Boolean);if(mappedEyes.length){const midpoint=new T.Vector3();mappedEyes.forEach(e=>midpoint.add(e.getWorldPosition(new T.Vector3())));midpoint.divideScalar(mappedEyes.length);focusTarget.position.copy(head.worldToLocal(midpoint));}}else root.add(focusTarget);
 const eyeTarget=new T.Object3D();if(eyes[0])eyes[0].add(eyeTarget);else if(head)head.add(eyeTarget);else root.add(eyeTarget);
 const warnings:string[]=[];if(clips.length!==actions.size)warnings.push('Duplicate animation names: only the first clip per name is exposed. Rename Actions before export.');if(!skinned)warnings.push('No skinned mesh: skeletal deformation is unavailable.');if(!head)warnings.push('Head mapping missing or ambiguous.');if(eyes.some(e=>!e))warnings.push('Eye mapping incomplete or ambiguous.');if(!blinkTargets.length)warnings.push('No mapped blink morph targets.');if(!actions.has(config.clips.idle))warnings.push('Named Idle clip missing; no idle is invented.');if(!importedGlasses&&!socket)warnings.push('No glasses socket; glasses will not be floated in front of the face.');
 const jointCount=[...skeletons].reduce((n,s)=>n+s.bones.length,0);
 if(triangles+attachmentTriangles>budgets.triangles)warnings.push('Triangle count exceeds the provisional 60k budget.');if(jointCount>budgets.joints)warnings.push('Joint count exceeds the provisional 70-joint budget.');
 let textureBytes=0;for(const texture of textures){const image=texture.source?.data,w=image?.width||0,h=image?.height||0;textureBytes+=w*h*4*4/3;if(Math.max(w,h)>budgets.textureEdge)warnings.push(`Texture ${texture.name||'(unnamed)'} exceeds 2048 px.`);}
 play(config.clips.idle);
 return {root,head,eyeTarget,focusTarget,kind:'gltf',label,clips:[...actions.keys()],morphs,materials:[...materials],report:{skinnedMeshes:skinned,joints:jointCount,importedTriangles:Math.round(triangles),attachmentTriangles:Math.round(attachmentTriangles),totalTriangles:Math.round(triangles+attachmentTriangles),clips:[...actions.keys()],head:head?.name||'Unavailable',eyes:eyes.map(e=>e?.name||'Unavailable'),blinkTargets:blinkTargets.length,morphTargets:morphs.length,glasses:glassesMode,materials:materials.size,importedTextures:textures.size,estimatedTextureMiB:Number((textureBytes/1024/1024).toFixed(2)),warnings},
 play,setMorph:(key,value)=>{if(value===null)overrides.delete(key);else overrides.set(key,T.MathUtils.clamp(value,0,1));},
 update:(dt,_time,input)=>{
  // Remove last frame's procedural layer, sample authored animation, then add limited controls.
  basePose.forEach(p=>p.node.quaternion.copy(p.quaternion));morphs.forEach(m=>m.mesh.morphTargetInfluences[m.index]=m.rest);
  mixer.update(dt);basePose.forEach(p=>p.quaternion.copy(p.node.quaternion));morphs.forEach(m=>m.rest=m.mesh.morphTargetInfluences[m.index]);
  const q=new T.Quaternion();if(head){q.setFromEuler(new T.Euler((input.tracking?input.gazeY:0)*T.MathUtils.degToRad(config.headLimit)*.35,T.MathUtils.clamp(input.yaw+(input.tracking?input.gazeX:0),-1,1)*T.MathUtils.degToRad(config.headLimit),0));head.quaternion.multiply(q);}
  if(input.tracking)for(const eye of eyes)if(eye){q.setFromEuler(new T.Euler(input.gazeY*T.MathUtils.degToRad(config.eyeLimit),input.gazeX*T.MathUtils.degToRad(config.eyeLimit),0));eye.quaternion.multiply(q);}
  // Authored blink curves retain their value; the procedural layer can only close further.
  for(const m of blinkTargets)m.mesh.morphTargetInfluences[m.index]=Math.max(m.mesh.morphTargetInfluences[m.index],input.blink);
  for(const m of morphs)if(overrides.has(m.key))m.mesh.morphTargetInfluences[m.index]=overrides.get(m.key);
 },dispose:()=>{if(closed)return;closed=true;mixer.stopAllAction();mixer.uncacheRoot(root);disposeObject(gltf.scenes||[root]);}};
}
