import {finishNames,getExperience,updateExperience,subscribeExperience,daySnapshot} from './experience-state.js?v=handoff-01';
const dialog = document.querySelector('#try-ring');
const names = finishNames;
const poses = {
 outside:['A quiet exterior.','A satin outer shell and polished edges meet a dark inner liner. A proposed material study.'],
 inside:['Details on the inside.','Proposed optical windows allow light emitters and a detector to sample reflected light for pulse estimates. The layout is unvalidated.'],
 profile:['A smaller presence.','See the proposed band profile from the side. Final fit and dimensions would need physical testing.']
};
let viewer, viewerPromise, failed=false, activeFinish=getExperience().finish, returnFocus, activeTab='design',settingsOpen=false,activePose='outside';
const sourceOpen={morning:false,afternoon:false,evening:false};
const rotation=document.querySelector('#ring-rotation'),zoom=document.querySelector('#ring-zoom');
function updateViewerLabels(){
 document.querySelector('#rotation-value').textContent=rotation.value+'°';
 rotation.setAttribute('aria-valuetext',rotation.value+' degrees');
 zoom.setAttribute('aria-valuetext',Math.round(Number(zoom.value)*100)+' percent');
}
updateViewerLabels();
function fallback(){
 const focusNeedsRecovery=dialog.open&&document.activeElement.matches('.viewer-3d-only,[data-ring-pose]');
 failed=true;
 document.querySelector('#ring-viewer').setAttribute('aria-busy','false');
 document.querySelector('#viewer-fallback').hidden=false;
 dialog.querySelectorAll('.viewer-3d-only,[data-ring-pose]').forEach(el=>el.disabled=true);
 document.querySelector('#viewer-status').textContent='3D is unavailable here. Explore the finishes and sample day instead.';
 const canvas=dialog.querySelector('canvas');if(canvas)canvas.hidden=true;
 if(focusNeedsRecovery)dialog.querySelector('[data-try-finish][aria-pressed="true"]').focus();
}
async function loadViewer(){
 if(failed)return;
 if(!viewerPromise){
  document.querySelector('#ring-viewer').setAttribute('aria-busy','true');document.querySelector('#viewer-status').textContent='Loading the interactive design study…';
  viewerPromise=import('./ring-model.js?v=model-02').then(module=>{
   viewer=module.createRingViewer(document.querySelector('#ring-viewer'),{onRotation(value){rotation.value=String(value);updateViewerLabels();},onFailure:fallback});
   renderFinish(activeFinish);viewer.setPose(activePose);viewer.setRotation(Number(rotation.value));viewer.setZoom(Number(zoom.value));document.querySelector('#viewer-fallback').hidden=true;document.querySelector('#ring-viewer').setAttribute('aria-busy','false');document.querySelector('#viewer-status').textContent='Drag to turn, or use the rotation, zoom, and view controls.';return viewer;
  }).catch(()=>{fallback();return null;});
 }
 await viewerPromise;viewer?.resize();
}
function renderFinish(index){activeFinish=index;document.querySelector('#try-finish-name').textContent=names[index];dialog.querySelectorAll('[data-try-finish]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.tryFinish)===index)));const fallbackImage=document.querySelector('#viewer-fallback');fallbackImage.style.backgroundPosition=`${index*100/3}% center`;fallbackImage.setAttribute('aria-label',names[index]+' ring concept');viewer?.setFinish(index);document.querySelector('#ring-viewer canvas')?.setAttribute('aria-label',names[index]+' ring concept. Use the rotation, zoom, and view controls to explore this shape study.');}
function pose(name){activePose=Object.hasOwn(poses,name)?name:'outside';const copy=poses[activePose];document.querySelector('#pose-title').textContent=copy[0];document.querySelector('#pose-description').textContent=copy[1];dialog.querySelectorAll('[data-ring-pose]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.ringPose===name)));rotation.value='0';updateViewerLabels();viewer?.setPose(activePose);}
function tab(name,{focus=false}={}){activeTab=name;for(const item of['design','day']){const button=document.querySelector('#try-'+item+'-tab');button.setAttribute('aria-selected',String(name===item));button.tabIndex=name===item?0:-1;document.querySelector('#try-'+item).hidden=name!==item;}if(focus)document.querySelector('#try-'+name+'-tab').focus();if(name==='design')loadViewer();}
document.querySelectorAll('[data-open-try]').forEach(button=>button.addEventListener('click',()=>{returnFocus=button;renderFinish(getExperience().finish);dialog.showModal();document.body.style.overflow='hidden';tab(button.dataset.tryStart||activeTab);document.querySelector('#try-close').focus();}));
document.querySelector('#try-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{document.body.style.overflow='';returnFocus?.focus({preventScroll:true});});
dialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const controls=[...dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),a[href],[tabindex]')].filter(el=>el.tabIndex>=0&&el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}});
for(const name of['design','day']){const button=document.querySelector('#try-'+name+'-tab');button.addEventListener('click',()=>tab(name));button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?'design':event.key==='End'?'day':name==='design'?'day':'design';tab(next,{focus:true});});}
document.querySelector('#try-day-shortcut').addEventListener('click',()=>tab('day',{focus:true}));
dialog.querySelectorAll('[data-try-finish]').forEach(button=>button.addEventListener('click',()=>updateExperience({finish:Number(button.dataset.tryFinish)},'finish-viewer')));
dialog.querySelectorAll('[data-ring-pose]').forEach(button=>button.addEventListener('click',()=>pose(button.dataset.ringPose)));
rotation.addEventListener('input',()=>{updateViewerLabels();viewer?.setRotation(Number(rotation.value));});
zoom.addEventListener('input',()=>{updateViewerLabels();viewer?.setZoom(Number(zoom.value));});
document.querySelector('#viewer-reset').addEventListener('click',()=>{viewer?.reset();rotation.value='0';zoom.value='1';pose('outside');});
const stageContent={
 morning:{clock:'7:05',title:'Sleep',subtitle:'Last night',label:'Estimated sleep',measure:'7h 42m',context:'35m above your 14-night average',source:'Source: Ring. An illustrative estimate, not a measure of how rested you should feel.',support:[['Time in bed','7h 55m'],['Wake time','7:05 AM']],note:'Sleep is an estimate. Your own experience adds context.'},
 afternoon:{clock:'2:30',title:'Movement',subtitle:'Today so far',label:'Steps',measure:'6,840',context:'An overview of your movement today.',source:'Source: Ring in this fictional day. This sample does not represent actual activity tracking or exercise accuracy.',support:[['Updated','2:30 PM'],['Data source','Ring']],note:'A daily picture, without a score to chase.'},
 evening:{clock:'10:00',title:'Reflection',subtitle:'A moment for you',label:'Your perspective',measure:'How did today feel?',context:'Your own words can sit alongside the numbers.',source:'Source: your sample selection. Reflections are separate from sensor readings. Nothing is saved or sent.',support:[],note:'Your reflection is optional. There is no streak to maintain.'}
};
function renderDay(state=getExperience()){
 const stage=state.stage,data=stageContent[stage],snapshot=daySnapshot(state),sleepOff=stage==='morning'&&!state.sleep,missing=stage==='morning'&&state.sleep&&state.missingNight;
 dialog.querySelectorAll('[data-day-stage]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.dayStage===stage)));
 document.querySelector('#day-clock').textContent=snapshot.clock;document.querySelector('#day-phone-title').textContent=data.title;document.querySelector('#day-phone-subtitle').textContent=data.subtitle;document.querySelector('#day-measure-label').textContent=data.label;
 document.querySelector('#day-measure').textContent=sleepOff?'Preview off':missing?'Not enough readings':stage==='afternoon'?snapshot.steps:data.measure;
 document.querySelector('#day-context').textContent=sleepOff?'Sleep preview is off. Change it in Preview settings below.':missing?'This night is left blank. Missing information is not a low score.':data.context;
 document.querySelector('#day-source-detail').textContent=sleepOff?'Sleep estimates are hidden across the demo by your sample settings.':missing?'Source: Ring. This sample night has a gap. No sleep estimate is displayed.':stage==='afternoon'?`Source: ${snapshot.source} in this fictional day. This is illustrative movement information.`:data.source;
 document.querySelector('#day-source-detail').hidden=!sourceOpen[stage];document.querySelector('#day-source-button').setAttribute('aria-expanded',String(sourceOpen[stage]));
 document.querySelector('#day-bottom-note').textContent=sleepOff?'Sleep estimates stay hidden until you enable the preview.':data.note;document.querySelector('#missing-night-choice').hidden=stage!=='morning';document.querySelector('#try-missing-night').checked=state.missingNight;document.querySelector('#try-missing-night').disabled=!state.sleep;
 document.querySelector('#day-reflection').hidden=stage!=='evening';
 let rows=data.support;
 if(stage==='afternoon')rows=[['Updated','2:30 PM'],['Data source',snapshot.source],['Resting heart rate',state.heart?'56 BPM':'Preview off']];
 const support=document.querySelector('#day-support');support.replaceChildren();support.hidden=sleepOff||missing||!rows.length;
 for(const[label,value]of rows){const row=document.createElement('div'),a=document.createElement('span'),b=document.createElement('strong');a.textContent=label;b.textContent=value;row.append(a,b);support.append(row);}
 document.querySelector('#reflection-result').textContent=state.reflection?'Sample reflection: '+state.reflection+'. Kept separate from ring estimates.':'Optional. You can leave this moment unrecorded.';
 dialog.querySelectorAll('[data-reflection]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.reflection===state.reflection)));
 document.querySelector('#day-sleep-access').checked=state.sleep;document.querySelector('#day-heart-access').checked=state.heart;
 document.querySelector('.try-day-phone').dataset.text=state.textSize;dialog.querySelectorAll('[data-day-text]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.dayText===state.textSize)));
 document.querySelector('#day-settings').hidden=!settingsOpen;document.querySelector('#day-settings-button').setAttribute('aria-expanded',String(settingsOpen));
}
dialog.querySelectorAll('[data-day-stage]').forEach(button=>button.addEventListener('click',()=>updateExperience({stage:button.dataset.dayStage},'day-stage')));
document.querySelector('#try-missing-night').addEventListener('change',event=>updateExperience({missingNight:event.target.checked},'sample-night'));
document.querySelector('#day-source-button').addEventListener('click',()=>{const stage=getExperience().stage;sourceOpen[stage]=!sourceOpen[stage];renderDay();});
dialog.querySelectorAll('[data-reflection]').forEach(button=>button.addEventListener('click',()=>updateExperience({reflection:getExperience().reflection===button.dataset.reflection?'':button.dataset.reflection},'sample-reflection')));
dialog.querySelectorAll('[data-day-text]').forEach(button=>button.addEventListener('click',()=>updateExperience({textSize:button.dataset.dayText},'text-viewer')));
document.querySelector('#day-settings-button').addEventListener('click',()=>{settingsOpen=!settingsOpen;renderDay();});
document.querySelector('#day-sleep-access').addEventListener('change',event=>updateExperience({sleep:event.target.checked},'access-viewer'));
document.querySelector('#day-heart-access').addEventListener('change',event=>updateExperience({heart:event.target.checked},'access-viewer'));
// Script-only actions stay unavailable if this module cannot initialize.
dialog.querySelectorAll('button:disabled,input:disabled').forEach(control=>control.disabled=false);
document.querySelectorAll('[data-open-try]').forEach(control=>control.disabled=false);
subscribeExperience((state,event)=>{
 if(event.initial||event.reset||event.changed.includes('finish'))renderFinish(state.finish);
 if(event.reset){for(const key of Object.keys(sourceOpen))sourceOpen[key]=false;viewer?.reset();rotation.value='0';zoom.value='1';pose('outside');document.querySelector('#try-reset-status').textContent='Demo reset. Natural Titanium and sample data enabled. Display preferences kept.';}
 else if(!event.initial&&document.querySelector('#try-reset-status').textContent!=='Choices apply across the demo for this visit.')document.querySelector('#try-reset-status').textContent='Choices apply across the demo for this visit.';
 renderDay(state);
 if(!event.initial&&dialog.open){const fields=event.changed;let message='';if(!event.reset){if(fields.includes('sleep'))message=state.sleep?'Sleep preview enabled across the demo.':'Sleep preview disabled across the demo.';else if(fields.includes('heart'))message=state.heart?'Heart rate preview enabled.':'Heart rate preview disabled.';else if(fields.includes('reflection'))message=state.reflection?'Sample reflection: '+state.reflection+'.':'Sample reflection cleared.';else if(fields.includes('stage')||fields.includes('missingNight'))message=stageContent[state.stage].title+'. '+document.querySelector('#day-measure').textContent;}document.querySelector('#day-announcement').textContent=message;}
});

