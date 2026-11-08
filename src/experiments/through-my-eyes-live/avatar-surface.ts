/** Surface treatment for the cap and the original hair fallback.
 * No face, eyes, glasses or facial proportions are generated or modified.
 */
export function createAvatarSurfaces(T:any){
 const weave=document.createElement('canvas'),hair=document.createElement('canvas');weave.width=weave.height=hair.width=hair.height=256;
 for(const [canvas,kind]of[[weave,'weave'],[hair,'hair']] as const){
  const c=canvas.getContext('2d')!,data=c.createImageData(256,256);
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){
   const noise=((Math.imul(x+17,374761393)^Math.imul(y+31,668265263))>>>0)%37/37;
   const u=x/256,v=y/256;
   const h=kind==='weave'? .5+.12*Math.sin(x*Math.PI/2)*Math.sin(y*Math.PI/2)+.10*(noise-.5):.5+.20*Math.cos((u*24+.55*Math.sin(v*Math.PI*4))*Math.PI*2)+.05*(noise-.5);
   const i=(y*256+x)*4;data.data[i]=data.data[i+1]=data.data[i+2]=Math.round(h*255);data.data[i+3]=255;
  }
  c.putImageData(data,0,0);
 }
 const cloth=new T.CanvasTexture(weave),flow=new T.CanvasTexture(hair);for(const t of[cloth,flow]){t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=2;}cloth.repeat.set(4,3);
 return{cloth,flow};
}
