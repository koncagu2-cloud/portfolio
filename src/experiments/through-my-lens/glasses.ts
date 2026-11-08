/** Authored procedural geometry; no third-party model or image asset. */
export function createGlasses(T: any, resources: any[]) {
  const pivot = new T.Group();
  const frame = new T.Group();
  frame.position.z = 1.55; // Rotate around the physical body, rather than its front surface.
  pivot.add(frame);
  const keep = (value: any) => { resources.push(value); return value; };
  const silver = keep(new T.MeshStandardMaterial({color:'#c8c7c0',metalness:.98,roughness:.17,envMapIntensity:1.4}));
  const inner = keep(new T.MeshStandardMaterial({color:'#5f666b',metalness:.96,roughness:.25,envMapIntensity:1.15}));
  const acetate = keep(new T.MeshStandardMaterial({color:'#22292b',metalness:.12,roughness:.3}));
  // Thin optical surfaces use restrained transparency, avoiding a gray solid slab.
  const glass = keep(new T.MeshPhysicalMaterial({color:'#c9e0df',transparent:true,opacity:.055,roughness:.045,metalness:0,clearcoat:1,clearcoatRoughness:.07,ior:1.46,specularIntensity:.7,envMapIntensity:.5,side:T.DoubleSide,depthWrite:false}));
  const silicone = keep(new T.MeshPhysicalMaterial({color:'#cad3cf',transparent:true,opacity:.32,roughness:.22,clearcoat:.6}));
  const tube = (points:number[][],radius:number,material:any=silver,closed=false) => {
    const curve = new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),closed,'centripetal');
    const mesh = new T.Mesh(keep(new T.TubeGeometry(curve,closed?224:64,radius,closed?16:12,closed)),material);
    frame.add(mesh); return mesh;
  };
  const outline=(cx:number)=>Array.from({length:144},(_,i)=>{
    const a=i/144*Math.PI*2,c=Math.cos(a),s=Math.sin(a);
    return [cx+1.10*Math.sign(c)*Math.pow(Math.abs(c),.73),.77*Math.sign(s)*Math.pow(Math.abs(s),.79)+.025*c,.018*c];
  });
  for(const cx of [-1.32,1.32]) {
    const edge=outline(cx), count=edge.length;
    tube(edge,.028,silver,true);
    tube(edge.map(p=>[p[0],p[1],p[2]-.035]),.014,inner,true);
    // Concentric rings give the lens a shallow convex surface and continuous normals.
    const positions=[cx,0,.10], indices:number[]=[];
    const rings=10;
    for(let r=1;r<=rings;r++)for(const p of edge){const t=r/rings;positions.push(cx+(p[0]-cx)*t,p[1]*t,.10*(1-t*t)+p[2]*t);}
    for(let i=0;i<count;i++)indices.push(0,1+i,1+(i+1)%count);
    for(let r=1;r<rings;r++)for(let i=0;i<count;i++){
      const a=1+(r-1)*count+i,b=1+(r-1)*count+(i+1)%count,c=1+r*count+i,d=1+r*count+(i+1)%count;
      indices.push(a,c,b,b,c,d);
    }
    const surface=keep(new T.BufferGeometry());surface.setAttribute('position',new T.Float32BufferAttribute(positions,3));surface.setIndex(indices);surface.computeVertexNormals();
    const lens=new T.Mesh(surface,glass);lens.renderOrder=2;frame.add(lens);
    const sign=Math.sign(cx);
    tube([[sign*2.36,.28,0],[sign*2.55,.28,-.17],[sign*2.66,.29,-1.7],[sign*2.64,.20,-2.9],[sign*2.54,-.16,-3.55]],.024);
    tube([[sign*2.65,.23,-2.8],[sign*2.63,.08,-3.15],[sign*2.54,-.16,-3.55]],.041,acetate);
    const hinge=new T.Mesh(keep(new T.BoxGeometry(.15,.075,.15)),silver);hinge.position.set(sign*2.43,.28,-.04);frame.add(hinge);
    const screw=new T.Mesh(keep(new T.CylinderGeometry(.023,.023,.012,16)),inner);screw.rotation.x=Math.PI/2;screw.position.set(sign*2.43,.28,.043);frame.add(screw);
    tube([[sign*.31,.25,0],[sign*.36,-.05,-.10],[sign*.41,-.15,-.16]],.012,inner);
    const pad=new T.Mesh(keep(new T.SphereGeometry(1,20,16)),silicone);pad.scale.set(.048,.115,.028);pad.position.set(sign*.41,-.15,-.17);pad.rotation.z=-sign*.25;frame.add(pad);
  }
  tube([[-.29,.38,.02],[-.15,.46,.05],[0,.50,.055],[.15,.45,.02],[.29,.34,-.015]],.022);
  let sunMode=false;
  const baseOptical=new T.Color('#c9e0df'),baseSun=new T.Color('#29372e'),worldTint=new T.Color('#82ae8e');
  const setAtmosphere=(progress:number)=>{glass.color.copy(sunMode?baseSun:baseOptical).lerp(worldTint,progress*.28);silver.envMapIntensity=1.4+progress*.15;};
  const setMaterial=(sun:boolean)=>{
    sunMode=sun;
    glass.color.set(sun?'#29372e':'#c9e0df');glass.opacity=sun?.90:.055;glass.roughness=sun?.13:.045;glass.envMapIntensity=sun?.9:.5;
    glass.specularIntensity=sun?1:.7;
  };
  return {pivot,frame,setMaterial,setAtmosphere};
}
