import {createGlasses} from '../through-my-lens/glasses';
/** A deliberately non-likeness clay placeholder. Not a reconstruction of the owner. */
export function createCharacter(T:any,resources:any[]) {
 const keep=(x:any)=>{resources.push(x);return x;};
 const body=new T.Group(),head=new T.Group();head.position.y=.72;body.add(head);
 const clay=keep(new T.MeshPhysicalMaterial({color:'#b5b3a6',roughness:.58,metalness:0,clearcoat:.15,clearcoatRoughness:.5}));
 const lip=keep(new T.MeshStandardMaterial({color:'#8a887c',roughness:.65}));
 const hair=keep(new T.MeshStandardMaterial({color:'#24282a',roughness:.56,metalness:.03}));
 const cloth=keep(new T.MeshStandardMaterial({color:'#222a2d',roughness:.85,metalness:0}));
 const collar=keep(new T.MeshStandardMaterial({color:'#30383b',roughness:.75,side:T.DoubleSide}));
 const eyeWhite=keep(new T.MeshPhysicalMaterial({color:'#d3d6cc',roughness:.24,clearcoat:.5}));
 const irisMat=keep(new T.MeshStandardMaterial({color:'#3d4947',roughness:.35}));
 const pupilMat=keep(new T.MeshBasicMaterial({color:'#111619'}));
 const mesh=(geometry:any,material:any,parent:any=head)=>{const m=new T.Mesh(keep(geometry),material);parent.add(m);return m;};
 const ball=(x:number,y:number,z:number,sx:number,sy:number,sz:number,material:any,parent:any=head)=>{const m=mesh(new T.SphereGeometry(1,40,28),material,parent);m.position.set(x,y,z);m.scale.set(sx,sy,sz);return m;};
 const tube=(points:number[][],radius:number,material:any,parent:any=head)=>{const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(new T.TubeGeometry(curve,40,radius,10,false),material,parent);};
 const headGeometry=new T.SphereGeometry(1,96,72);const pos=headGeometry.attributes.position;
 const gaussian=(x:number,y:number,cx:number,cy:number,sx:number,sy:number)=>Math.exp(-Math.pow((x-cx)/sx,2)-Math.pow((y-cy)/sy,2));
 for(let i=0;i<pos.count;i++){
  const nx=pos.getX(i),ny=pos.getY(i),nz=pos.getZ(i),y=ny<-.65?-.65*1.05+(ny+.65)*.65:ny*1.05;
  const width=.79+.04*Math.exp(-Math.pow((ny+.05)/.38,2))-.03*Math.max(0,-ny);
  const x=nx*width;let z=nz*.70;
  if(nz>0){const front=Math.pow(nz,5);z+=front*(.08*gaussian(x,y,0,.12,.14,.40)+.12*gaussian(x,y,0,-.17,.17,.19)+.065*gaussian(x,y,0,-.69,.3,.19)+.06*gaussian(x,y,-.40,-.17,.22,.25)+.06*gaussian(x,y,.40,-.17,.22,.25)-.13*gaussian(x,y,-.32,.17,.21,.15)-.13*gaussian(x,y,.32,.17,.21,.15));}
  pos.setXYZ(i,x,y,z);
 }
 headGeometry.computeVertexNormals();mesh(headGeometry,clay);
 // Neck and a shaped shirt silhouette; no hands or full-body skeleton.
 const neck=mesh(new T.CylinderGeometry(.29,.31,.75,48),clay,body);neck.position.set(0,-.58,-.05);
 const profile=[new T.Vector2(.42,-.60),new T.Vector2(.83,-.74),new T.Vector2(1.17,-.96),new T.Vector2(1.30,-1.27),new T.Vector2(1.15,-2.1)];
 const torso=mesh(new T.LatheGeometry(new T.SplineCurve(profile.reverse()).getPoints(40),64),cloth,body);torso.scale.z=.49;
 for(const sign of [-1,1]){
  const ear=ball(sign*.75,.02,-.035,.115,.22,.10,clay);ear.rotation.z=sign*-.10;
  tube([[sign*.76,-.11,.07],[sign*.82,.02,.09],[sign*.78,.16,.045]],.017,lip);
  const flapGeometry=new T.BufferGeometry();flapGeometry.setAttribute('position',new T.Float32BufferAttribute([sign*.20,-.62,.23,sign*.46,-.75,.36,sign*.35,-1.02,.52,sign*.08,-.83,.36],3));flapGeometry.setIndex([0,1,2,0,2,3]);flapGeometry.computeVertexNormals();mesh(flapGeometry,collar,body);
  tube([[sign*.51,.35,.59],[sign*.34,.40,.64],[sign*.18,.34,.66]],.018,hair);
 }
 tube([[-.17,-.43,.64],[-.07,-.422,.68],[0,-.43,.69],[.07,-.425,.68],[.17,-.44,.64]],.008,lip);
 // Continuous sculpted hair volume with a shallow directional wave.
 const hairGeometry=new T.SphereGeometry(1,96,60,0,Math.PI*2,0,1.45);const hp=hairGeometry.attributes.position;
 for(let i=0;i<hp.count;i++){const x=hp.getX(i),y=hp.getY(i),z=hp.getZ(i),front=Math.max(0,z);hp.setXYZ(i,x*.80+.055*y,y*.80+.45+front*(.055*Math.sin(x*5)+.022*Math.cos(x*12)),z*.74-.02+front*.025*Math.sin(x*8));}
 hairGeometry.computeVertexNormals();mesh(hairGeometry,hair);
 const eyes:{iris:any;ball:any;upper:any;lower:any}[]=[];
 for(const sign of [-1,1]){
  const eyeRoot=new T.Group();eyeRoot.position.set(sign*.32,.17,.56);head.add(eyeRoot);
  const eyeball=ball(0,0,0,.13,.067,.080,eyeWhite,eyeRoot);
  const iris=new T.Group();iris.position.set(0,0,.079);eyeRoot.add(iris);
  const disc=mesh(new T.CircleGeometry(.052,48),irisMat,iris);disc.position.z=.002;
  mesh(new T.CircleGeometry(.027,40),pupilMat,iris).position.z=.004;
  ball(-.018,.022,.010,.009,.009,.005,eyeWhite,iris);
  const upper=tube([[-.135,0,.02],[-.065,.063,.070],[.035,.066,.070],[.135,0,.02]],.017,clay,eyeRoot);
  const lower=tube([[-.135,0,.02],[-.07,-.052,.070],[.06,-.050,.070],[.135,0,.02]],.013,clay,eyeRoot);
  eyes.push({iris,ball:eyeball,upper,lower});
 }
 const eyewear=createGlasses(T,resources);eyewear.pivot.scale.setScalar(.25);eyewear.pivot.position.set(0,.17,.78-1.55*.25);head.add(eyewear.pivot);
 const eyeTarget=new T.Object3D();eyeTarget.position.set(.32,.17,.64);head.add(eyeTarget);
 const lensTarget=new T.Object3D();lensTarget.position.set(.32,.17,.805);head.add(lensTarget);
 const animate=(time:number,lookX:number,lookY:number,contact:number,idle:boolean)=>{
  const breath=idle?Math.sin(time*.95)*.0028:0;torso.scale.y=1+breath;
  const blinkTime=(time+1.8)%5.3;const blink=idle&&contact<.65&&blinkTime<.19?Math.sin(blinkTime/.19*Math.PI):0;
  for(const eye of eyes){eye.iris.position.x=lookX*.022;eye.iris.position.y=lookY*.015;eye.upper.scale.y=1-blink*.96;eye.lower.scale.y=1-blink*.96;eye.ball.scale.y=.067*(1-blink*.96);eye.iris.scale.y=1-blink*.94;}
  return blink;
 };
 return {body,head,eyeTarget,lensTarget,glassesFrame:eyewear.frame,animate};
}
