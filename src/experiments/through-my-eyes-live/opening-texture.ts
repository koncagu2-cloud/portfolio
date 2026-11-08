/** Rasterize the EXISTING D2L opening for the WebGL lens; no interface is invented.
 * All image pixels are same-origin. Failure is explicit and retains the authentic artifact.
 * This is a noninteractive representation; the real HTML takes focus at arrival.
 */
export async function captureOpening(world:HTMLElement,width:number,height:number):Promise<HTMLCanvasElement>{
 await Promise.all([...world.querySelectorAll<HTMLImageElement>(':scope>header img,:scope>.tme-community-story img')].map(i=>{i.loading='eager';return i.decode();}));
 const embedded=new Map<Element,string>();
 await Promise.all([...world.querySelectorAll<SVGImageElement>('svg image')].map(async source=>{const image=new Image();image.src=source.href.baseVal;await image.decode();const pixels=document.createElement('canvas');pixels.width=image.naturalWidth;pixels.height=image.naturalHeight;pixels.getContext('2d')!.drawImage(image,0,0);embedded.set(source,pixels.toDataURL());}));
 const wrap=document.createElement('div');wrap.setAttribute('xmlns','http://www.w3.org/1999/xhtml');
 const style=getComputedStyle(world);wrap.style.cssText=`box-sizing:border-box;width:${width}px;height:${height}px;overflow:hidden;background:${world.id==='d2l-world'?'#dce3d5':world.id==='chapter-community'?'#e5dfea':'#19181f'};color:${world.id==='d2l-world'?'#202a24':world.id==='chapter-community'?'#292331':'#eee9f2'};padding:${style.paddingTop} ${style.paddingRight} 0 ${style.paddingLeft};font-family:${style.fontFamily};`;
 const copy=(source:Element):Element=>{
  const clone=source.cloneNode(false) as HTMLElement,computed=getComputedStyle(source);
  clone.removeAttribute('id');clone.removeAttribute('class');clone.removeAttribute('href');
  for(const property of computed)clone.style.setProperty(property,computed.getPropertyValue(property));
  if(world.closest('[data-cinematic=true]')){clone.style.visibility='visible';clone.style.opacity='1';}
  clone.style.animation='none';clone.style.transition='none';if(source.getAnimations().some(a=>a.playState==='running'))clone.style.transform='none';
  if(source instanceof HTMLImageElement){const pixels=document.createElement('canvas');pixels.width=source.naturalWidth;pixels.height=source.naturalHeight;pixels.getContext('2d')!.drawImage(source,0,0);(clone as HTMLImageElement).src=pixels.toDataURL();clone.removeAttribute('srcset');clone.removeAttribute('loading');}
  if(embedded.has(source)){clone.setAttribute('href',embedded.get(source)!);clone.removeAttributeNS('http://www.w3.org/1999/xlink','href');}
  for(const child of source.childNodes)clone.append(child.nodeType===Node.ELEMENT_NODE?copy(child as Element):child.cloneNode(true));
  return clone;
 };
 for(const selector of['.tme-world-nav','.tme-world-intro','.tme-ring-opening','.tme-community-story','.tme-align-opening']){const source=world.querySelector(selector);if(source)wrap.append(copy(source));}
 const markup=new XMLSerializer().serializeToString(wrap),url='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%">${markup}</foreignObject></svg>`);
 const image=new Image();await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('Browser could not rasterize the project opening'));image.src=url;});
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d')!.drawImage(image,0,0);canvas.getContext('2d')!.getImageData(0,0,1,1);return canvas;
}
