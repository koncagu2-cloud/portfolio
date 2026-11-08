/** Asset-specific configuration; the renderer and choreography know only CharacterAsset. */
export interface RigConfig {
 head:string; eyes:[string,string]; socket:string; blink:[string,string];
 clips:{idle:string;eyeContact?:string};
 headLimit:number; eyeLimit:number;
 glasses:{enabled:boolean;scale:number;position:[number,number,number];rotation:[number,number,number]};
 materials:Record<string,{color?:string;roughness?:number;metalness?:number}>;
}
export const productionRig:RigConfig={
 head:'Head',eyes:['Eye_L','Eye_R'],socket:'GlassesSocket',blink:['eyeBlinkLeft','eyeBlinkRight'],
 clips:{idle:'Idle',eyeContact:'EyeContact'},headLimit:12,eyeLimit:8,
 glasses:{enabled:true,scale:.028,position:[0,0,0],rotation:[0,0,0]},materials:{}
};
/** Null until an owner-approved asset exists. No missing/imaginary production GLB is requested. */
export const productionAssetURL:string|null=null;
export const fixtureRig:RigConfig={...productionRig,glasses:{...productionRig.glasses,scale:.055}};
export const budgets={triangles:60000,joints:70,drawCalls:30,textureEdge:2048,totalBytes:25*1024*1024};
