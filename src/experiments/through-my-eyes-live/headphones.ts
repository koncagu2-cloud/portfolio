/** Premium neck-worn headphone accessory; the avatar itself remains an imported GLB. */
export function createNeckHeadphones(T: any, resources: any[]) {
  const keep = (value: any) => { resources.push(value); return value; };
  const headphones = new T.Group();
  headphones.name = 'Graphite over-ear headphones';

  const bandMaterial = keep(new T.MeshPhysicalMaterial({ color: '#222229', metalness: .19, roughness: .4, clearcoat: .24, clearcoatRoughness: .46, envMapIntensity: .65 }));
  const bandPadMaterial = keep(new T.MeshPhysicalMaterial({ color: '#17171d', metalness: .01, roughness: .96, clearcoat: .05, clearcoatRoughness: .9 }));
  const aluminum = keep(new T.MeshStandardMaterial({ color: '#5d5964', metalness: .66, roughness: .34, envMapIntensity: .8 }));
  const housing = keep(new T.MeshPhysicalMaterial({ color: '#292830', metalness: .32, roughness: .37, clearcoat: .22, clearcoatRoughness: .44, envMapIntensity: .72 }));
  const cushion = keep(new T.MeshPhysicalMaterial({ color: '#17171c', metalness: .01, roughness: .96, clearcoat: .04, clearcoatRoughness: .92 }));
  const face = keep(new T.MeshPhysicalMaterial({ color: '#25242c', metalness: .21, roughness: .46, clearcoat: .15, clearcoatRoughness: .48, envMapIntensity: .65 }));
  const controlBase = keep(new T.MeshStandardMaterial({ color: '#34323b', metalness: .42, roughness: .39 }));
  const idleColor = new T.Color('#34323b'), hoverColor = new T.Color('#494452');
  const playMaterial = keep(new T.MeshBasicMaterial({ color: '#d1bfeb', toneMapped: false, transparent: true, opacity: 1, depthWrite: false }));
  const pauseMaterial = keep(new T.MeshBasicMaterial({ color: '#d1bfeb', toneMapped: false, transparent: true, opacity: 0, depthWrite: false }));
  const ringMaterial = keep(new T.MeshStandardMaterial({ color: '#847493', metalness: .58, roughness: .32, emissive: '#8e70b2', emissiveIntensity: .055 }));

  const line = (points: number[][], radius: number, material: any, name: string) => {
    const curve = new T.CatmullRomCurve3(points.map(([x, y, z]) => new T.Vector3(x, y, z)));
    const mesh = new T.Mesh(keep(new T.TubeGeometry(curve, 48, radius, 8, false)), material);
    mesh.name = name;
    headphones.add(mesh);
    return mesh;
  };

  // A softly rounded, flattened band reads as padded hardware rather than a wire loop.
  const bandPath = [[-.58,.34,.26],[-.62,.43,.10],[-.43,.53,-.10],[0,.57,-.18],[.43,.53,-.10],[.62,.43,.10],[.58,.34,.26]];
  const bandCurve = new T.CatmullRomCurve3(bandPath.map(([x,y,z]) => new T.Vector3(x,y,z)));
  const makeBandLayer = (halfWidth: number, halfDepth: number, zOffset: number, material: any, name: string) => {
    const along = 64, around = 12, vertices: number[] = [], indices: number[] = [];
    for (let i = 0; i <= along; i++) {
      const t = i / along, point = bandCurve.getPointAt(t), tangent = bandCurve.getTangentAt(t);
      const across = new T.Vector3(-tangent.y, tangent.x, 0).normalize();
      for (let j = 0; j < around; j++) {
        const a = j / around * Math.PI * 2;
        vertices.push(point.x + across.x * Math.cos(a) * halfWidth, point.y + across.y * Math.cos(a) * halfWidth, point.z + zOffset + Math.sin(a) * halfDepth);
      }
    }
    for (let i = 0; i < along; i++) for (let j = 0; j < around; j++) {
      const a = i*around+j, b = i*around+(j+1)%around, c = (i+1)*around+(j+1)%around, d = (i+1)*around+j;
      indices.push(a,b,d,b,c,d);
    }
    const geometry = keep(new T.BufferGeometry());
    geometry.setAttribute('position', new T.Float32BufferAttribute(vertices,3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const mesh = new T.Mesh(geometry, material);
    mesh.name = name;
    headphones.add(mesh);
  };
  makeBandLayer(.052,.021,0,bandMaterial,'Padded matte graphite headband shell');
  makeBandLayer(.037,.008,.021,bandPadMaterial,'Soft inner headband padding');
  line(bandPath.map(([x,y,z]) => [x,y,z+.028]), .0018, aluminum, 'Subtle headband seam');

  let rightControl: any;
  let hovered = false, playing = false, iconProgress = 0, hoverProgress = 0, pulseAt = 0, previousTime = 0;
  for (const side of [-1, 1]) {
    const cup = new T.Group();
    cup.name = side === -1 ? 'Right headphone earcup' : 'Left headphone earcup';
    cup.position.set(side * .475 / 1.18, .17 / 1.32, .325 / 1.18);
    // The outer face lies in local XY (normal +Z), so local Y is the outward yaw axis.
    // The avatar rests with a ~15° yaw. The control-side cup is 8° closer to camera
    // for legibility, while both cups keep their outward-worn orientation.
    const outwardYaw = side < 0 ? 37 : 75;
    cup.rotation.y = side * (outwardYaw * Math.PI / 180);
    // A restrained mirrored roll lets the cups follow the shoulder line while
    // the outward yaw keeps them worn around the neck instead of facing front.
    cup.rotation.z = side * -.17;
    cup.scale.set(1.18,1.32,1.18);
    cup.updateMatrix();

    // The yoke belongs to the fixed headband frame; only its hinge ends follow the turned cup.
    const pivotEnds = [-.0365,.0365].map(offset => new T.Vector3(side*.125+offset,.105,-.027).applyMatrix4(cup.matrix));
    const yokeRoots = [new T.Vector3(side*.58,.34,.28),new T.Vector3(side*.53,.34,.24)];
    const yokeRoot = new T.Mesh(keep(new T.SphereGeometry(.026,18,12)),bandMaterial);
    yokeRoot.position.set(side*.565,.345,.26);
    yokeRoot.name = 'Integrated headband yoke root';
    headphones.add(yokeRoot);
    for (let i=0;i<2;i++) {
      const start=yokeRoots[i],end=pivotEnds[i],mid=start.clone().lerp(end,.52);
      mid.y+=.018;mid.z+=.012;
      const path=new T.CatmullRomCurve3([start,mid,end]);
      const arm=new T.Mesh(keep(new T.TubeGeometry(path,24,.018,10,false)),bandMaterial);
      arm.name=`${side<0?'Right':'Left'} integrated forked headphone yoke ${i+1}`;
      headphones.add(arm);
    }

    // Smooth radial shell with a softly rolled aluminum-inspired outer lip.
    const profile = [[.07,-.073],[.105,-.071],[.128,-.058],[.14,-.036],[.144,-.012],[.139,.016],[.126,.039],[.111,.047],[0,.047]];
    const shellGeometry = new T.LatheGeometry(profile.map(([r,z]) => new T.Vector2(r,z)), 56);
    shellGeometry.rotateX(Math.PI / 2);
    const shell = new T.Mesh(keep(shellGeometry), housing);
    shell.name = 'Curved earcup housing';
    cup.add(shell);

    // Soft oval ear seal, tucked behind the housing and visible around its side profile.
    const pad = new T.Mesh(keep(new T.TorusGeometry(.113,.027,16,64)), cushion);
    pad.position.z = -.035;
    pad.scale.y = 1.14;
    pad.name = 'Padded ear cushion';
    cup.add(pad);

    const facePlate = new T.Mesh(keep(new T.CircleGeometry(.119,64)), face);
    facePlate.position.z = .048;
    facePlate.scale.y = 1.12;
    facePlate.name = 'Satin graphite outer face';
    cup.add(facePlate);
    const machinedLip = new T.Mesh(keep(new T.TorusGeometry(.126,.004,10,64)), aluminum);
    machinedLip.position.z = .052;
    machinedLip.scale.y = 1.12;
    cup.add(machinedLip);

    // Compact pivot and yoke join each cup to the floating band.
    const pivot = new T.Mesh(keep(new T.CylinderGeometry(.026,.026,.062,24)), aluminum);
    pivot.rotation.z = Math.PI / 2;
    pivot.position.set(side*.125,.105,-.027);
    pivot.name = 'Earcup swivel pivot';
    cup.add(pivot);
    const pivotCap = new T.Mesh(keep(new T.CylinderGeometry(.021,.021,.006,24)), bandMaterial);
    pivotCap.rotation.z = Math.PI / 2;
    pivotCap.position.set(side*.16,.105,-.027);
    pivotCap.name = 'Graphite hinge cap';
    cup.add(pivotCap);
    if (side === -1) {
      // Model-space right side (x < 0): a recessed tactile control at the face center.
      const control = new T.Group();
      control.name = 'Right earcup play pause control';
      control.scale.y = 1.18 / 1.32; // Counter the cup's slight oval proportion so the control stays round.
      const socket = new T.Mesh(keep(new T.CylinderGeometry(.036,.036,.009,48)), bandMaterial);
      socket.rotation.x = Math.PI / 2;
      socket.position.z = .049;
      control.add(socket);
      const button = new T.Mesh(keep(new T.CircleGeometry(.029,48)), controlBase);
      button.position.z = .052;
      button.name = 'Recessed tactile button';
      control.add(button);
      const ring = new T.Mesh(keep(new T.TorusGeometry(.031,.0022,10,48)), ringMaterial);
      ring.position.z = .055;
      ring.name = 'Muted lavender status ring';
      control.add(ring);

      const playShape = new T.Shape();
      playShape.moveTo(-.009,-.015); playShape.lineTo(-.009,.015); playShape.lineTo(.018,0); playShape.closePath();
      const play = new T.Mesh(keep(new T.ShapeGeometry(playShape)), playMaterial);
      play.scale.setScalar(1.45);
      play.position.z = .058;
      play.name = 'Play icon';
      control.add(play);
      const pause = new T.Group();
      pause.name = 'Pause icon';
      pause.scale.setScalar(1.35);
      for (const x of [-.005,.005]) {
        const bar = new T.Mesh(keep(new T.BoxGeometry(.004,.018,.001)), pauseMaterial);
        bar.position.x = x;
        pause.add(bar);
      }
      pause.position.z = .058;
      pause.visible = true;
      control.add(pause);
      cup.add(control);
    rightControl = { control, button, ring, play, pause };
    }
    headphones.add(cup);
  }

  return {
    group: headphones,
    control: rightControl.control,
    controlPoint: rightControl.button,
    setHovered(value: boolean) { hovered = value; },
    setPlaying(value: boolean) { playing = value; },
    pulse() { pulseAt = performance.now(); },
    update(now: number) {
      const dt = previousTime ? Math.min((now - previousTime) / 1000, .05) : .016;
      previousTime = now;
      const target = playing ? 1 : 0;
      iconProgress += (target - iconProgress) * Math.min(1, dt * 18);
      rightControl.play.material.opacity = 1 - iconProgress;
      rightControl.pause.children.forEach((bar: any) => { bar.material.opacity = iconProgress; });
      const hoverTarget = hovered ? 1 : 0;
      hoverProgress += (hoverTarget - hoverProgress) * Math.min(1, dt * 14);
      controlBase.color.lerpColors(idleColor, hoverColor, hoverProgress);
      const flash = pulseAt ? Math.max(0, 1 - (now - pulseAt) / 420) : 0;
      const ringTarget = (hovered ? .28 : playing ? .18 : .055) + flash * .68;
      ringMaterial.emissiveIntensity += (ringTarget - ringMaterial.emissiveIntensity) * Math.min(1, dt * 16);
      rightControl.button.scale.setScalar(1 + flash * .045);
      const animating = Math.abs(target - iconProgress) > .015 || Math.abs(hoverTarget - hoverProgress) > .015 || flash > .02;
      return animating;
    },
  };
}
