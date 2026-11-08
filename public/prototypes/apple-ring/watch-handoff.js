// Illustrative device states only. No device connection, battery API, or health data.
import {subscribeExperience,updateExperience,daySnapshot} from './experience-state.js?v=handoff-01';
const section=document.querySelector('#continuity');
const el=id=>section.querySelector('#'+id);
section.querySelectorAll('[data-handoff-moment]').forEach(button=>button.addEventListener('click',()=>{
 updateExperience({handoffMoment:button.dataset.handoffMoment},'handoff-moment');
 // Keep the result discoverable when the mobile composition places it below the controls.
 const heading=el('handoff-screen-title'),bounds=heading.getBoundingClientRect(),navBottom=document.querySelector('.local').getBoundingClientRect().bottom;
 if(bounds.top<navBottom+12||bounds.bottom>innerHeight-12){heading.focus({preventScroll:true});heading.scrollIntoView({block:'center',behavior:'instant'});}
}));
section.querySelectorAll('[data-handoff-text]').forEach(button=>button.addEventListener('click',()=>updateExperience({textSize:button.dataset.handoffText},'handoff-text')));
el('handoff-missing').addEventListener('change',event=>updateExperience({missingNight:event.target.checked},'handoff-missing'));
el('handoff-disconnected').addEventListener('change',event=>updateExperience({ringLink:event.target.checked?'disconnected':'synced'},'handoff-connection'));
subscribeExperience((state,event)=>{
 const together=state.combination==='together',morning=state.handoffMoment==='morning',linked=state.ringLink==='synced';
 const unavailable=!state.sleep?'Preview off':!linked?'No new sync':state.missingNight?'Not enough readings':'';
 el('continuity-mode-title').textContent=together?'Ring + Watch':'Ring + iPhone';
 el('handoff-night-label').textContent=together?'Watch rests. Ring stays on.':'A screen-free night.';
 el('handoff-morning-label').textContent=together?'Your night. Now on Watch.':'Your night. On iPhone.';
 section.querySelectorAll('[data-handoff-moment]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.handoffMoment===state.handoffMoment)));
 section.querySelectorAll('[data-handoff-text]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.handoffText===state.textSize)));
 el('handoff-missing').checked=state.missingNight;el('handoff-disconnected').checked=!linked;
 const device=section.querySelector('.handoff-device');device.dataset.device=together?'watch':'phone';device.dataset.text=state.textSize;
 el('handoff-device-label').textContent=together?'Proposed Watch companion view':'Proposed iPhone companion view';
 el('handoff-clock').textContent=morning?'7:05 AM':'11:00 PM';
 el('handoff-source').textContent=morning?'Last night · Source: Ring':'Ring · Overnight source';
 el('handoff-screen-title').textContent=morning?'Estimated sleep':together?'Watch charging':'Ring overnight';
 el('handoff-value').textContent=unavailable||(morning?'7h 42m':together?'A night off your wrist.':'No screen. Your night.');
 el('handoff-value').classList.toggle('is-reading',morning&&!unavailable);
 el('handoff-screen-note').textContent=!state.sleep?'Sleep preview is off. Change it in either phone preview.':!linked?'Ring is disconnected in this sample. New readings are unavailable until sync.':state.missingNight?'The sample night has a gap. No complete sleep estimate is shown.':morning?'An estimate of time asleep, not a measure of how rested you feel.':together?'Ring would record while Watch is on its charger.':'Ring would record without a screen on your wrist.';
 el('handoff-status').hidden=!morning;
 el('handoff-battery').textContent=linked?'62% · Last synced':'Unavailable';
 el('handoff-sync').textContent=!linked?'Not connected · Last sync unknown':morning?'Last synced 7:05 AM via iPhone':'Overnight scenario · No live connection';
 el('handoff-explanation').textContent=morning?(together?'Put Watch back on. In this proposal, your Ring night summary and last-synced battery status would be available on Watch after syncing through iPhone.':'Ring works with iPhone on its own. Review the same available Ring night estimate and last-synced battery status without needing Watch.'):(together?'In this proposal, Ring collects pulse and movement while Watch charges. Sleep is an estimate derived from available readings.':'Wear Ring overnight and review its information on iPhone. Watch is optional; Ring does not offer Watch’s workout controls or GPS.');
 el('handoff-night-source').textContent=!state.sleep?'Sleep preview off':!linked?'Awaiting Ring sync':state.missingNight?'Incomplete night':'Overnight estimate';
 const day=el('daytime-source');day.querySelector('strong').textContent=together?'Daytime activity':'Everyday movement';day.querySelector('p').textContent='Source: '+daySnapshot(state).source;
 el('continuity-explainer').textContent=together?'Ring supplies the night. Watch supplies daytime activity. The proposed shared record keeps sources visible and avoids adding duplicate readings.':'Ring contributes the available night and everyday movement in this sample. Watch is optional. Missing or unsynced readings are not filled in.';
 section.querySelector('.demo-note').textContent='Illustrative handoff · All Ring integrations are speculative, not existing Apple features. Text size and missing-night choices apply across the demo.';
 if(!event.initial&&event.changed.some(key=>['combination','handoffMoment','ringLink','sleep','missingNight','textSize'].includes(key)))el('handoff-announcement').textContent=[together?'Watch companion':'iPhone companion',morning?'Morning':'Overnight',el('handoff-value').textContent,el('handoff-sync').textContent].join('. ');
});
