import * as THREE from './vendor/three.module.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

export function createRingViewer(host, { onRotation, onFailure } = {}) {
 const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
 renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
 renderer.outputColorSpace = THREE.SRGBColorSpace;
 renderer.toneMapping = THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure = .85;
 renderer.setClearColor(0x101012, 0);
 renderer.domElement.setAttribute('role', 'img');
 renderer.domElement.setAttribute('aria-label', 'Three-dimensional ring shape study. Use the rotation, zoom, and view controls to explore it.');
 host.appendChild(renderer.domElement);
 const scene = new THREE.Scene();
 const camera = new THREE.PerspectiveCamera(38, 1, .1, 30);
 camera.position.set(0, 0, 4.65);
 const pmrem = new THREE.PMREMGenerator(renderer);
 const room = new RoomEnvironment();
 const environment = pmrem.fromScene(room, .05);
 scene.environment = environment.texture;
 room.dispose();
 pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xffffff, 0x33333a, .65));
 const key = new THREE.DirectionalLight(0xffffff, 1.8);
 key.position.set(-3, 4, 5); scene.add(key);
 const edge = new THREE.DirectionalLight(0xe0e6ff, 2);
 edge.position.set(4, -2, -2); scene.add(edge);
 const group = new THREE.Group(); scene.add(group);
 // Separate the satin shell, polished chamfers, and dark inner liner.
 // Normalized proportions are a visual study, not manufacturing dimensions.
 const lathe = points => new THREE.LatheGeometry(points.map(([r,y])=>new THREE.Vector2(r,y)),192);
 const shellProfile = [[.936,-.31],[.967,-.31],[.990,-.302],[1.006,-.282],[1.014,-.25],[1.018,-.17],[1.018,.17],[1.014,.25],[1.006,.282],[.990,.302],[.967,.31],[.936,.31],[.936,-.31]];
 // Deterministic microtexture adds a restrained satin response without another asset request.
 const grainSize=256, grainData=new Uint8Array(grainSize*grainSize*4);
 let seed=73;
 for(let i=0;i<grainSize*grainSize;i++){
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const value=110+(seed>>>27);
  grainData.set([value,value,value,255],i*4);
 }
 const grain=new THREE.DataTexture(grainData,grainSize,grainSize,THREE.RGBAFormat);
 grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(8,2);grain.needsUpdate=true;
 const metal = new THREE.MeshPhysicalMaterial({color:0xb8b0a4,metalness:1,roughness:.34,bumpMap:grain,bumpScale:.003,envMapIntensity:1.25});
 group.add(new THREE.Mesh(lathe(shellProfile),metal));
 const rimMaterial = new THREE.MeshPhysicalMaterial({color:0xb8b0a4,metalness:1,roughness:.14,envMapIntensity:1.15});
 for(const sign of[-1,1]){
  const edgeProfile=[[.930,.307],[.966,.313],[.990,.304],[1.007,.282],[1.010,.266],[1.004,.277],[.986,.295],[.962,.301],[.930,.301],[.930,.307]].map(([r,y])=>[r,y*sign]);
  // Reversing the mirrored profile preserves outward-facing normals.
  if(sign<0)edgeProfile.reverse();
  group.add(new THREE.Mesh(lathe(edgeProfile),rimMaterial));
 }
 const linerMaterial=new THREE.MeshPhysicalMaterial({color:0x101114,metalness:.28,roughness:.25,clearcoat:.55,clearcoatRoughness:.18,envMapIntensity:1});
 const linerProfile=[[.934,-.304],[.934,.304],[.866,.304],[.828,.296],[.806,.276],[.798,.24],[.798,-.24],[.806,-.276],[.828,-.296],[.866,-.304],[.934,-.304]];
 group.add(new THREE.Mesh(lathe(linerProfile),linerMaterial));
 function roundedWindow(width,height,depth,radius){
  const shape=new THREE.Shape(),x=-width/2,y=-height/2;
  shape.moveTo(x+radius,y);shape.lineTo(x+width-radius,y);shape.quadraticCurveTo(x+width,y,x+width,y+radius);
  shape.lineTo(x+width,y+height-radius);shape.quadraticCurveTo(x+width,y+height,x+width-radius,y+height);
  shape.lineTo(x+radius,y+height);shape.quadraticCurveTo(x,y+height,x,y+height-radius);
  shape.lineTo(x,y+radius);shape.quadraticCurveTo(x,y,x+radius,y);
  return new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.003,bevelThickness:.002,curveSegments:6});
 }
 const frameGeometry=roundedWindow(.155,.185,.008,.025);
 const lensGeometry=roundedWindow(.106,.130,.006,.018);
 const frameMaterial=new THREE.MeshStandardMaterial({color:0x353638,metalness:.85,roughness:.21});
 for(const[index,offset]of[-.34,0,.34].entries()){
  const angle=Math.PI/2+offset;
  const normal=new THREE.Vector3(-Math.cos(angle),0,-Math.sin(angle));
  const orientation=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),normal);
  const frame=new THREE.Mesh(frameGeometry,frameMaterial);
  frame.position.set(Math.cos(angle)*.798,0,Math.sin(angle)*.798);frame.quaternion.copy(orientation);group.add(frame);
  const lens=new THREE.Mesh(lensGeometry,new THREE.MeshPhysicalMaterial({color:index===0?0x719583:0xb0aea4,metalness:.35,roughness:.12,clearcoat:1,emissive:index===0?0x203a2b:0x111110,emissiveIntensity:.15}));
  lens.position.set(Math.cos(angle)*.786,0,Math.sin(angle)*.786);lens.quaternion.copy(orientation);group.add(lens);
 }
 const poses = {outside:{x:1.95,y:-.30,z:-.30},inside:{x:1.64,y:.08,z:-.12},profile:{x:.18,y:.20,z:-.23}};
 const colors = [0xb8b0a4,0x34363a,0xe0e1e4,0xc4ac91];
 let pose = poses.outside, degrees = 0, pitch = 0, zoom = 1, frames = 0;
 function render() {
  if (!host.clientWidth || !host.clientHeight) return;
  group.rotation.set(pose.x+pitch,pose.y+degrees*Math.PI/180,pose.z);
  camera.position.z = 4.25/zoom;
  renderer.render(scene,camera);
  renderer.domElement.dataset.rendered='true';
  renderer.domElement.dataset.frame=String(++frames);
 }
 function resize() {
  if (!host.clientWidth || !host.clientHeight) return;
  renderer.setSize(host.clientWidth,host.clientHeight,false);
  camera.aspect=host.clientWidth/host.clientHeight; camera.updateProjectionMatrix(); render();
 }
 let drag = null;
 renderer.domElement.addEventListener('pointerdown',event=>{if(event.button!==0)return;drag={x:event.clientX,y:event.clientY,degrees,pitch};renderer.domElement.setPointerCapture(event.pointerId);});
 renderer.domElement.addEventListener('pointermove',event=>{if(!drag)return;degrees=((drag.degrees+(event.clientX-drag.x)*.55)%360+360)%360;pitch=Math.max(-.7,Math.min(.7,drag.pitch+(event.clientY-drag.y)*.006));onRotation?.(Math.round(degrees));render();});
 const endDrag=()=>{drag=null;};
 renderer.domElement.addEventListener('pointerup',endDrag); renderer.domElement.addEventListener('pointercancel',endDrag);renderer.domElement.addEventListener('lostpointercapture',endDrag);
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();onFailure?.();});
 const observer = new ResizeObserver(resize); observer.observe(host); resize();
 return {
  setFinish(index){metal.color.setHex(colors[index]??colors[0]);rimMaterial.color.copy(metal.color);render();},
  setRotation(value){degrees=value;render();},
  setZoom(value){zoom=value;render();},
  setPose(name){pose=poses[name]||poses.outside;pitch=0;degrees=0;render();},
  reset(){pose=poses.outside;degrees=0;pitch=0;zoom=1;render();},
  resize,
  dispose(){observer.disconnect();environment.dispose();grain.dispose();scene.traverse(object=>{object.geometry?.dispose();if(object.material){for(const material of(Array.isArray(object.material)?object.material:[object.material]))material.dispose();}});renderer.dispose();renderer.domElement.remove();}
 };
}
