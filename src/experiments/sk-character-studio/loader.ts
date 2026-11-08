import {budgets} from './config';
import {disposeObject} from './asset';
const decoder=new TextDecoder();
export function inspectContainer(buffer:ArrayBuffer){
 let json:any;
 if(buffer.byteLength>=12&&new DataView(buffer).getUint32(0,true)===0x46546c67){
  const view=new DataView(buffer);if(view.getUint32(4,true)!==2||view.getUint32(8,true)!==buffer.byteLength)throw new Error('Invalid glTF 2.0 binary header.');
  if(buffer.byteLength<20||view.getUint32(16,true)!==0x4e4f534a)throw new Error('GLB JSON chunk is missing.');const length=view.getUint32(12,true);if(length>buffer.byteLength-20)throw new Error('Truncated GLB JSON chunk.');json=JSON.parse(decoder.decode(buffer.slice(20,20+length)));
 }else json=JSON.parse(decoder.decode(buffer));
 if(json.asset?.version!=='2.0')throw new Error('Only glTF 2.0 assets are supported.');
 const unsupported=['KHR_draco_mesh_compression','EXT_meshopt_compression','KHR_texture_basisu'];if((json.extensionsRequired||[]).some((e:string)=>unsupported.includes(e)))throw new Error('This asset needs Draco, Meshopt or KTX2 decoding. Export an uncompressed review GLB; decoder support is not configured.');
 return json;
}
/** Local selection is parsed in memory; no file or reference photo is uploaded. */
export async function parseSelection(GLTFLoader:any,T:any,files:File[]){
 const models=files.filter(f=>/\.(glb|gltf)$/i.test(f.name));if(models.length!==1)throw new Error('Choose exactly one .glb or .gltf, plus its local resource files if needed.');
 if(files.reduce((n,f)=>n+f.size,0)>budgets.totalBytes)throw new Error('Selected files exceed the 25 MiB review limit.');
 const buffer=await models[0].arrayBuffer(),json=inspectContainer(buffer);const resources=new Map<string,File>();for(const f of files){if(resources.has(f.name))throw new Error(`Ambiguous resource filename: ${f.name}`);resources.set(f.name,f);}
 const uris=[...(json.buffers||[]),...(json.images||[])].flatMap((r:any)=>r.uri?[r.uri]:[]);
 for(const uri of uris){if(/^data:/i.test(uri))continue;if(/^(?:[a-z]+:|\/\/|\/)/i.test(uri)||uri.split('/').includes('..'))throw new Error('Remote or parent-path resources are not permitted for local selection.');const name=decodeURIComponent(uri.split('/').pop());if(!resources.has(name))throw new Error(`Missing local resource: ${name}. Select it together with the .gltf.`);}
 const urls=new Map<string,string>(),manager=new T.LoadingManager(),errors:string[]=[];manager.onError=(url:string)=>errors.push(url);manager.setURLModifier((url:string)=>{if(/^data:|^blob:/i.test(url))return url;const name=decodeURIComponent(url.split('/').pop()!);const file=resources.get(name);if(!file)throw new Error(`Unresolved local resource: ${name}`);if(!urls.has(name))urls.set(name,URL.createObjectURL(file));return urls.get(name)!;});
 try{const gltf=await new GLTFLoader(manager).parseAsync(buffer,'');if(errors.length){disposeObject(gltf.scenes||[gltf.scene]);throw new Error('A model resource could not be decoded. Check the selected buffers and texture files.');}return gltf;}finally{urls.forEach(url=>URL.revokeObjectURL(url));}
}
export async function loadEmbedded(GLTFLoader:any,T:any,url:string,signal:AbortSignal){
 const target=new URL(url,location.href);if(target.origin!==location.origin)throw new Error('Configured review assets must be same-origin.');
 const controller=new AbortController(),cancel=()=>controller.abort();if(signal.aborted)cancel();signal.addEventListener('abort',cancel,{once:true});const timer=setTimeout(cancel,20000);
 try{const response=await fetch(target,{signal:controller.signal});if(!response.ok)throw new Error(`Asset request failed (${response.status}).`);if(Number(response.headers.get('content-length'))>budgets.totalBytes)throw new Error('Asset exceeds the 25 MiB review limit.');
 const buffer=await response.arrayBuffer();if(buffer.byteLength>budgets.totalBytes)throw new Error('Asset exceeds the 25 MiB review limit.');const json=inspectContainer(buffer);
 if([...(json.buffers||[]),...(json.images||[])].some((r:any)=>r.uri&&!/^data:/i.test(r.uri)))throw new Error('Configured URL assets must be self-contained. Use local multi-file selection for external .gltf resources.');
 const manager=new T.LoadingManager(),errors:string[]=[];manager.onError=(url:string)=>errors.push(url);const gltf=await new GLTFLoader(manager).parseAsync(buffer,'');if(errors.length){disposeObject(gltf.scenes||[gltf.scene]);throw new Error('An embedded resource could not be decoded.');}return gltf;
 }finally{clearTimeout(timer);signal.removeEventListener('abort',cancel);}
}
