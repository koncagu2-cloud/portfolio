import {jobs} from './data.js';
import {normalizeApplications,prepareDemoApplication} from './applications.js';
export const STORAGE_KEY='align.m06.candidate.v1';
export const emptyState=()=>({version:1,preferences:{arrangement:'Remote',minimumPay:90000},evidence:{portfolio:'declared',systems:'not-yet',blueprinting:'unknown',collaboration:'unknown',facilitation:'unknown'},saved:[],passed:[],notes:{},stages:{},applications:[]});
export const validId=id=>jobs.some(j=>j.id===id);
export function validatePreferences(input){const errors={},raw=String(input.minimumPay??'').trim(),minimumPay=Number(raw);if(!['Any','Remote','Hybrid','On-site'].includes(input.arrangement))errors.arrangement='Choose a listed work arrangement.';if(!raw||!Number.isInteger(minimumPay)||minimumPay<0||minimumPay>1000000)errors.minimumPay='Enter a whole annual amount from 0 to 1,000,000 USD. Use 0 for no minimum.';return {errors,value:{arrangement:input.arrangement,minimumPay}};}
export function normalizeState(input){const s=emptyState();if(!input||input.version!==1)return s;const p=validatePreferences(input.preferences||{});if(!Object.keys(p.errors).length)s.preferences=p.value;for(const key of ['saved','passed'])if(Array.isArray(input[key]))s[key]=[...new Set(input[key].filter(validId))];for(const id of s.saved){if(typeof input.notes?.[id]==='string')s.notes[id]=input.notes[id].slice(0,500);if(['exploring','discuss'].includes(input.stages?.[id]))s.stages[id]=input.stages[id];}for(const key of Object.keys(s.evidence))if(['declared','none','not-yet','unknown'].includes(input.evidence?.[key]))s.evidence[key]=input.evidence[key];s.applications=normalizeApplications(input.applications);return s;}
export function readState(storage){try{const raw=storage.getItem(STORAGE_KEY);if(!raw)return {state:emptyState(),error:null};const value=JSON.parse(raw);if(value?.version!==1)return {state:emptyState(),error:'This saved format is unavailable. Showing a fresh local demo.'};return {state:normalizeState(value),error:null};}catch{return {state:emptyState(),error:'Saved data could not be read. You can explore in memory; browser persistence is unavailable.'};}}
export function writeState(storage,state){try{const value=normalizeState(state);storage.setItem(STORAGE_KEY,JSON.stringify(value));const stored=JSON.parse(storage.getItem(STORAGE_KEY));if(JSON.stringify(stored)!==JSON.stringify(value))throw new Error('acknowledgement');return null;}catch{return 'This change could not be confirmed in browser storage. It is kept for this visit only.';}}
export const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
export const compact=n=>n%1000===0?'$'+n/1000+'k':money(n);
export const payLabel=j=>j.pay?`${money(j.pay.min)}–${money(j.pay.max)} ${j.pay.currency} / ${j.pay.period}`:'Pay not disclosed';
export function preferenceEvidence(j,p){const work=p.arrangement==='Any'?{state:'not-set',label:'Any arrangement',text:'No work preference set.'}:j.arrangement===p.arrangement?{state:'meets',label:p.arrangement+' ✓',text:`${j.arrangement} meets your preference.`}:{state:'differs',label:j.arrangement+' · Different',text:`${j.arrangement} differs from your ${p.arrangement.toLowerCase()} preference.`};let pay;if(!p.minimumPay)pay={state:'not-set',label:'No pay minimum',text:'No pay minimum set.'};else if(!j.pay)pay={state:'unknown',label:compact(p.minimumPay)+' · Pay unknown',text:'Pay is not disclosed.'};else if(j.pay.currency!=='USD'||j.pay.period!=='year')pay={state:'not-comparable',label:'Pay · Not comparable',text:'Pay units differ; no conversion assumed.'};else {const meets=j.pay.min>=p.minimumPay;pay={state:meets?'meets':'differs',label:compact(p.minimumPay)+' minimum '+(meets?'✓':'· Differs'),text:meets?`Posted pay meets your ${compact(p.minimumPay)} minimum.`:`The range starts below your ${compact(p.minimumPay)} minimum.`};}return {work,pay};}
// A company history or an unscoped statement cannot confirm this role.
export function sponsorshipInfo(job){
 const source=job.sponsorship||{};
 const scoped=typeof source.scope==='string'&&source.scope.startsWith(job.title+' /');
 const roleStatement=!!source.source&&!!source.date&&scoped&&(!source.evidenceType||source.evidenceType==='role-statement');
 const status=['available','unavailable'].includes(source.status)&&roleStatement?source.status:'unknown';
 const label={available:'Sponsorship available if needed',unavailable:'Sponsorship not available',unknown:'Sponsorship unknown'}[status];
 const provenance=status==='unknown'?'No confirmed role-specific statement.':`Fictional role statement ${source.source} · ${source.date} · ${source.scope}`;
 const explanation=source.evidenceType==='historical'?'Historical employer sponsorship does not confirm availability for this role.':status==='unknown'?'No role-specific sponsorship statement is confirmed in this demo. Ask before relying on availability.':'This describes support for this fictional role, not your individual eligibility or a guarantee.';
 return {status,label,provenance,explanation};
}
// Only an explicitly provided listing value describes the level sought.
export const experienceLevel=j=>typeof j.experienceLevel==='string'&&j.experienceLevel.trim()?j.experienceLevel.trim():null;
export const experienceLevelLabel=j=>experienceLevel(j)||'Not specified in this listing';
const mapping={'UX portfolio':'portfolio','Product-team collaboration':'collaboration','Research facilitation':'facilitation','Design-system experience':'systems','Service blueprinting':'blueprinting','Stakeholder facilitation':'facilitation','Research synthesis':null};
// Missing evidence is not a declaration of absent experience. Preserve legacy
// "not-yet" answers as uncertain; only an explicit "none" answer creates a gap.
export const naturalList=values=>values.length<2?(values[0]||''):values.slice(0,-1).join(', ')+' and '+values.at(-1);
export const humanRequirement=label=>label==='UX portfolio'?'a UX portfolio':label.startsWith('UX ')?label:label[0].toLowerCase()+label.slice(1);
export function decisionBrief(j,state){
  const p=preferenceEvidence(j,state.preferences);
  const rows=[...j.requirements.map(label=>({label,importance:'Essential'})),...j.preferred.map(label=>({label,importance:'Preferred'}))].map(r=>({...r,state:state.evidence[mapping[r.label]]||'unknown'}));
  const available=rows.filter(r=>r.state==='declared');
  const gaps=rows.filter(r=>r.state==='none');
  const missing=rows.filter(r=>r.state==='unknown'||r.state==='not-yet');
  const roleUnknowns=[...(!j.pay?['salary']:[]),...(sponsorshipInfo(j).status==='unknown'?['sponsorship']:[]),...(!j.hours?['core hours']:[]),...(!experienceLevel(j)?['experience level']:[])];
  const unknowns=[...missing.map(r=>r.label),...roleUnknowns];
  const work=p.work.state==='not-set'?`Work arrangement: ${j.arrangement.toLowerCase()}.`:p.work.state==='meets'?`The role is ${j.arrangement.toLowerCase()}, as you prefer.`:`You prefer ${state.preferences.arrangement.toLowerCase()} work; this role is ${j.arrangement.toLowerCase()}.`;
  const pay=p.pay.state==='unknown'?"The salary isn’t listed, so pay is still unknown.":p.pay.state==='not-set'?"You haven’t set a pay minimum.":p.pay.state==='not-comparable'?"The pay uses different units, so it hasn’t been compared.":`The salary starts at ${compact(j.pay.min)}, ${p.pay.state==='meets'?'meeting':'below'} your ${compact(state.preferences.minimumPay)} minimum.`;
  const categories={aligns:[],differs:[],unknown:[]};
  if(p.work.state==='meets')categories.aligns.push({kind:'work',text:`${j.arrangement} work matches your preference.`});
  if(p.work.state==='differs')categories.differs.push({kind:'work',text:`${j.arrangement} work; you prefer ${state.preferences.arrangement.toLowerCase()}.`});
  if(p.pay.state==='meets')categories.aligns.push({kind:'pay',text:`${compact(j.pay.min)} start meets your ${compact(state.preferences.minimumPay)} minimum.`});
  if(p.pay.state==='differs')categories.differs.push({kind:'pay',text:`${compact(j.pay.min)} start is below your ${compact(state.preferences.minimumPay)} minimum.`});
  if(p.pay.state==='unknown')categories.unknown.push({kind:'pay',text:'Salary not listed.'});
  if(p.pay.state==='not-comparable')categories.unknown.push({kind:'pay',text:'Pay units differ; no conversion assumed.'});
  if(sponsorshipInfo(j).status==='unknown')categories.unknown.push({kind:'listing',text:'Sponsorship not confirmed for this role.'});
  if(!j.hours)categories.unknown.push({kind:'listing',text:'Core hours not listed.'});
  if(!experienceLevel(j))categories.unknown.push({kind:'listing',text:'Experience level not specified in this listing.'});
  const evidenceNeeds=[];
  if(available.length)evidenceNeeds.push('Self-declared, unverified: '+naturalList(available.map(r=>r.label)));
  if(missing.length)evidenceNeeds.push('Evidence not shared: '+naturalList(missing.map(r=>humanRequirement(r.label))));
  if(gaps.length)evidenceNeeds.push('Experience gaps are self-declared, not independently verified');
  if(evidenceNeeds.length)categories.unknown.push({kind:'evidence',text:evidenceNeeds.join('. ')+'.'});
  return {categories,preferences:p,requirements:rows,available,gaps,missing,roleUnknowns,unknowns,summary:work+' '+pay,
    evidenceSentence:available.length?`${naturalList(available.map(r=>r.label))} · self-declared, not verified by ALIGN.`:'You haven’t declared evidence for these requirements.',
    missingSentence:missing.length?`${naturalList(missing.map(r=>r.label))}. Your experience is still unknown.`:'You’ve answered each requirement. Your declarations are unverified.',
    gapSentence:gaps.length?`You said you don’t have ${naturalList(gaps.map(r=>humanRequirement(r.label)+' ('+r.importance.toLowerCase()+')'))}.`:'No experience gaps explicitly stated.',
    roleUnknownSentence:roleUnknowns.length?`Ask about ${naturalList(roleUnknowns)}.`:'No missing listing details identified.',
    question:!experienceLevel(j)?'What experience level is this role intended for?':!j.pay?'What is the annual salary range?':sponsorshipInfo(j).status==='unknown'?'Is sponsorship offered for this role?':'What are the core collaboration hours?'};
}
export function filterJobs(list,{query='',location='',arrangement='Any',sponsorship='all'}={}){const q=query.trim().toLowerCase(),loc=location.trim().toLowerCase();return list.filter(j=>(!q||[j.title,j.employer,...j.requirements,...j.preferred].join(' ').toLowerCase().includes(q))&&(!loc||j.location.toLowerCase().includes(loc))&&(arrangement==='Any'||j.arrangement===arrangement)&&(sponsorship==='all'||sponsorshipInfo(j).status===sponsorship));}
export function toggleSaved(state,id){if(!validId(id))return state;const next=structuredClone(state);if(next.saved.includes(id)){next.saved=next.saved.filter(x=>x!==id);delete next.notes[id];delete next.stages[id];}else next.saved.push(id);return next;}
export function submitDemo(storage,state,jobId,draft,id,now){const latest=readState(storage);if(latest.error)return {record:null,state,errors:{form:'Storage could not be read. No simulated submission is confirmed. Your answer is retained; retry.'}};const current=normalizeState({...latest.state,preferences:state.preferences,evidence:state.evidence,saved:state.saved,passed:state.passed,notes:state.notes,stages:state.stages});const result=prepareDemoApplication(current,jobId,draft,id,now);if(!result.record||result.duplicate)return result;if(writeState(storage,result.state))return {record:null,state,errors:{form:'The local write could not be confirmed. No application was sent. Keep this page open and retry to reconcile the receipt.'}};const verified=readState(storage),record=verified.state.applications.find(a=>a.id===id);if(verified.error||!record)return {record:null,state,errors:{form:'Receipt verification failed. No application was sent; retry to check for an existing local record.'}};return {...result,state:verified.state,record};}
