/** Presentation gestures for the existing static mesh, not a facial/skeletal rig.
 * One owner resolves transition > return/acknowledgment > pointer > idle.
 * Animation time stops offscreen/paused. No timers or per-frame object allocation.
 */
export type CharacterMode='idle'|'pointer'|'attention'|'transition'|'return';
const smooth=(v:number)=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
export function createCharacterBehavior(seed=731){
 let clock=0,random=seed>>>0,nextBlink=2.7,blinkStart=-10,doubleBlink=false,nextGaze=2.2,idleX=0,idleY=0,pointerX=0,pointerY=0,pointerUntil=0,attentionUntil=0,returnUntil=0,headDelay=0,smileUntil=0,attentionX=0,previousMode:CharacterMode='idle';
 const pose={mode:'idle' as CharacterMode,gazeX:0,gazeY:0,yaw:0,pitch:0,blink:0,breathe:0,lean:0,highlight:0,smile:0,clock:0};
 const rand=()=>{random=(Math.imul(random,1664525)+1013904223)>>>0;return random/4294967296;};
 const attend=()=>{attentionX=0;smileUntil=clock+1.7;attentionUntil=clock+.85;headDelay=clock+.10;};
 return {
  pose,
  pointer(x:number,y:number){pointerX=Math.max(-1,Math.min(1,x));pointerY=Math.max(-1,Math.min(1,y));pointerUntil=clock+2.4;},
  leave(){pointerUntil=0;pointerX=pointerY=0;},
  attend,
  lookAtPerspective(){attend();attentionX=.50;},
  greet(){smileUntil=clock+2.4;blinkStart=clock;nextBlink=clock+3.2+rand()*1.2;attend();smileUntil=clock+2.4;},
  arrive(){pose.gazeX=-.45;pose.gazeY=-.06;pose.yaw=-.06;pose.pitch=.015;attend();},
  returnFromProject(index:number){smileUntil=clock+1.8;pointerUntil=0;returnUntil=clock+1.15;idleX=(index-1.5)*.14;idleY=.025;nextGaze=clock+2.2;headDelay=clock+.12;},
  step(dt:number,active:boolean,transition:number|null){
   if(!active){pose.mode='idle';pose.blink=0;return pose;}
   clock+=Math.min(dt,.08);pose.clock=clock;
   const mode:CharacterMode=transition!==null?'transition':clock<returnUntil?'return':clock<attentionUntil?'attention':clock<pointerUntil?'pointer':'idle';
   if(mode!==previousMode){headDelay=clock+.09;previousMode=mode;}
   if(clock>=nextGaze){idleX=rand()<.32?0:(rand()-.5)*.48;idleY=(rand()-.5)*.15;nextGaze=clock+1.8+rand()*3.4;}
   let x=mode==='pointer'?pointerX:mode==='idle'?idleX:mode==='attention'?attentionX:mode==='return'?idleX*(1-smooth((clock-returnUntil+1.15)/1.15)):0;
   let y=mode==='pointer'?-pointerY:mode==='idle'?idleY:0;
   // Brief eye contact before attention moves to the lens; no invented expression morphs.
   if(transition!==null){x=.10*smooth((transition-.16)/.20);y=.015;}
   const eyes=1-Math.exp(-dt*14),head=clock<headDelay?0:1-Math.exp(-dt*3.5);
   pose.gazeX+=(x-pose.gazeX)*eyes;pose.gazeY+=(y-pose.gazeY)*eyes;
   const nod=mode==='attention'?-.035*Math.sin(Math.PI*smooth((clock-attentionUntil+.85)/.85)):transition!==null?-.035*Math.sin(Math.PI*smooth(transition/.24)):0;
   const still=transition!==null?1-smooth((transition-.12)/.34):1;
   // Head follows target after a short latency; eyes are independent and faster.
   pose.yaw+=((x*.16+Math.sin(clock*.47)*.006*still)-pose.yaw)*head;
   pose.pitch+=((y*.065+nod)-pose.pitch)*head;
   if(clock>=nextBlink){blinkStart=clock;if(doubleBlink){doubleBlink=false;nextBlink=clock+2.8+rand()*3.7;}else{doubleBlink=rand()<.16;nextBlink=clock+(doubleBlink?.31:2.8+rand()*3.7);}}
   const age=clock-blinkStart;pose.blink=age<0||age>.23?0:age<.07?smooth(age/.07):1-smooth((age-.07)/.16);
   const smileTarget=transition!==null?0:clock<smileUntil?.85:.08;pose.smile+=(smileTarget-pose.smile)*(1-Math.exp(-dt*4.5));
   pose.breathe=(Math.sin(clock*1.13)*.0027+Math.sin(clock*.39+.8)*.0011)*still;
   pose.lean=Math.sin(clock*.31+.3)*.0025*still;
   pose.highlight+=((mode==='pointer'?.12:mode==='attention'||mode==='transition'?.18:0)-pose.highlight)*(1-Math.exp(-dt*3));pose.mode=mode;
   return pose;
  },
  neutral(){pose.gazeX=pose.gazeY=pose.yaw=pose.pitch=pose.blink=pose.breathe=pose.lean=pose.highlight=pose.smile=0;attentionX=0;smileUntil=0;pointerUntil=attentionUntil=returnUntil=0;previousMode='idle';}
 };
}
