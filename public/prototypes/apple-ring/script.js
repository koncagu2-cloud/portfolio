import './watch-handoff.js?v=handoff-01';
import {finishNames,getExperience,updateExperience,subscribeExperience,resetExperience,daySnapshot} from './experience-state.js?v=handoff-01';
document.documentElement.classList.add('js');
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
function motionReduced(){return reduce.matches||document.documentElement.dataset.motion==='reduced';}
const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}}),{threshold:.13});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));
const hero=document.querySelector('.hero-track'),ring=document.querySelector('.hero-ring'),title=document.querySelector('.hero-title'),material=document.querySelector('.material-track'),closeup=document.querySelector('.material-sticky>img');
const clamp=n=>Math.min(1,Math.max(0,n));let queued=false;
function animateScroll() {
 queued=false;
 if(motionReduced())return;
 const h=hero.getBoundingClientRect();
 if(h.bottom>=0&&h.top<=innerHeight){
  const p=clamp(-h.top/Math.max(1,hero.offsetHeight-innerHeight+64));
  ring.style.transform=`translateY(${-p*75}px) scale(${1+p*.28}) rotate(${-p*11}deg)`;
  title.style.opacity=String(1-p*.95);title.style.transform=`translateY(${-p*65}px)`;
 }
 const m=material.getBoundingClientRect();
 if(m.bottom>=0&&m.top<=innerHeight){
  const q=clamp((innerHeight-m.top)/Math.max(1,material.offsetHeight));
  closeup.style.transform=`translateX(${-q*8}%) scale(${1+q*.2}) rotate(${q*8}deg)`;
 }
}
window.addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(animateScroll);}},{passive:true});window.addEventListener('resize',animateScroll);animateScroll();
document.querySelectorAll('[data-finish]').forEach(button=>button.addEventListener('click',()=>updateExperience({finish:Number(button.dataset.finish)},'finish-page')));
function showPhone(view,{focus=false}={}) {
 if(!['today','sleep','access'].includes(view))return;
 document.querySelectorAll('.feature-select [data-view]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.view===view)));
 for(const name of ['today','sleep','access'])document.getElementById('phone-'+name).hidden=name!==view;
 if(focus){
  const heading=document.querySelector('#phone-'+view+' h3');
  heading.focus({preventScroll:true});
  const bounds=heading.getBoundingClientRect(),navBottom=document.querySelector('.local').getBoundingClientRect().bottom;
  if(bounds.top<navBottom+12||bounds.bottom>innerHeight-12)heading.scrollIntoView({block:'center',behavior:'instant'});
 }
}
document.querySelectorAll('[data-view]').forEach(el=>el.addEventListener('click',()=>showPhone(el.dataset.view,{focus:!!el.closest('.phone')})));
document.querySelector('#sleep-access').addEventListener('change',event=>updateExperience({sleep:event.target.checked},'access-page'));
function setupStep(step,{focus=true}={}){document.querySelectorAll('[data-setup-step]').forEach(el=>el.hidden=Number(el.dataset.setupStep)!==step);document.querySelectorAll('[data-progress]').forEach(el=>el.classList.toggle('active',Number(el.dataset.progress)===step));document.querySelector('#setup-announcement').textContent=['Setup preview: connect your ring.','Setup preview: choose sample settings.','Setup preview complete.'][step];const panel=document.querySelector(`[data-setup-step="${step}"]`);if(focus)panel.querySelector('button,a,input')?.focus({preventScroll:true});}
document.querySelector('#setup-connect').addEventListener('click',()=>{const state=getExperience();document.querySelector('#setup-sleep').checked=state.sleep;document.querySelector('#setup-heart').checked=state.heart;setupStep(1);});
document.querySelector('[data-setup-back]').addEventListener('click',()=>setupStep(0));
document.querySelector('#setup-continue').addEventListener('click',()=>{updateExperience({sleep:document.querySelector('#setup-sleep').checked,heart:document.querySelector('#setup-heart').checked},'setup-complete');renderSetupResult(getExperience());setupStep(2);});
document.querySelector('#setup-reset').addEventListener('click',()=>setupStep(0));
document.querySelector('#setup-explore').addEventListener('click',event=>{event.preventDefault();showPhone('today');if(location.hash!=='#experience')history.pushState(null,'','#experience');document.querySelector('#experience').scrollIntoView({behavior:motionReduced()?'instant':'smooth',block:'start'});document.querySelector('.feature-select [data-view="today"]').focus({preventScroll:true});});
document.querySelector('#heart-access').addEventListener('change',event=>updateExperience({heart:event.target.checked},'access-page'));
document.querySelectorAll('[data-combination]').forEach(button=>button.addEventListener('click',()=>updateExperience({combination:button.dataset.combination},'device-choice')));
document.querySelectorAll('[data-phone-text]').forEach(button=>button.addEventListener('click',()=>updateExperience({textSize:button.dataset.phoneText},'text-page')));
let userReducedMotion=false;
const motionControl=document.querySelector('#page-motion');
function updateMotionPreference(){const on=reduce.matches||userReducedMotion;if(on)document.documentElement.dataset.motion='reduced';else delete document.documentElement.dataset.motion;motionControl.checked=on;motionControl.disabled=reduce.matches;document.querySelector('#motion-status').textContent=reduce.matches?'Reduce Motion is enabled in your system settings.':on?'Page motion is reduced. Every section remains available.':'Page motion follows the standard presentation.';if(!on)animateScroll();}
motionControl.addEventListener('change',()=>{userReducedMotion=motionControl.checked;updateMotionPreference();});reduce.addEventListener('change',updateMotionPreference);updateMotionPreference();
function renderSetupResult(state){document.querySelector('#setup-result').textContent=state.sleep||state.heart?`Sample settings: ${[state.sleep?'sleep estimates':null,state.heart?'heart rate':null].filter(Boolean).join(' and ')} enabled. These choices apply across the demo.`:'Both sample options are off. You can enable them later in either phone preview.';}
subscribeExperience((state,event)=>{
 const snapshot=daySnapshot(state),available=state.sleep&&!state.missingNight;
 document.querySelectorAll('[data-finish]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.finish)===state.finish)));
 document.querySelector('#finish-product').style.backgroundPosition=`${state.finish*100/3}% center`;
 document.querySelector('#finish-product').setAttribute('aria-label',`Apple Ring concept in ${finishNames[state.finish]}`);
 document.querySelector('#finish-name').textContent=finishNames[state.finish];
 document.querySelector('#sleep-access').checked=state.sleep;document.querySelector('#heart-access').checked=state.heart;
 document.querySelectorAll('[data-sleep-number]').forEach(el=>el.textContent=!state.sleep?'Preview off':state.missingNight?'Not enough readings':'7h 42m');
 document.querySelectorAll('[data-sleep-note]').forEach(el=>el.textContent=!state.sleep?'Sleep preview is off. Change it in Preview settings.':state.missingNight?'This sample night has a gap. No estimate is shown.':'35m above your 14-night average');
 document.querySelector('.sleep-period').hidden=!available;document.querySelector('.sleep-period').nextElementSibling.hidden=!available;document.querySelectorAll('#phone-sleep .phone-card')[1].hidden=!available;
 document.querySelector('#phone-sleep>p:last-child').textContent=!state.sleep?'Sleep preview is off across this demo.':state.missingNight?'Missing information is left blank. It is not a low score.':'Sleep is an estimate. How rested you feel may differ.';
 const rows=document.querySelectorAll('#phone-today .metric-row');rows[0].querySelector('strong').textContent=snapshot.steps;rows[0].querySelector('.phone-sub').textContent='Source: '+snapshot.source;
 rows[1].querySelector('strong').textContent=state.heart?'56 BPM':'Preview off';rows[1].querySelector('.phone-sub').textContent=state.heart?'Overnight estimate · Ring':'Heart rate preview is off';
 document.querySelector('.phone .status>span:first-child').textContent=snapshot.clock;
 document.querySelector('#phone-today>p.phone-sub').textContent='Sample time · '+snapshot.clock;
 document.querySelector('.phone').dataset.text=state.textSize;document.querySelectorAll('[data-phone-text]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.phoneText===state.textSize)));
 document.querySelectorAll('[data-combination]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.combination===state.combination)));
 renderSetupResult(state);
 if(event.reset){setupStep(0,{focus:false});document.querySelector('#demo-reset-status').textContent='Demo reset. Natural Titanium and sample data enabled. Display preferences kept.';}
});
document.querySelectorAll('[data-reset-demo]').forEach(button=>button.addEventListener('click',()=>resetExperience()));

// Enable only the page controls whose handlers have initialized.
document.querySelectorAll('button:disabled,input:disabled').forEach(control=>{
 if(!control.closest('#try-ring')&&!control.matches('[data-open-try]')&&!(control===motionControl&&reduce.matches))control.disabled=false;
});
