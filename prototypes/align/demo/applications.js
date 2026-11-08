import {jobs,jobById,FIXTURE_DATE} from './data.js';

export const DEMO_CANDIDATE = Object.freeze({
  name:'Alex Rivera', email:'alex@example.com',
  resume:'alex-demo.pdf · placeholder; no file attached',
  portfolio:'https://example.com/alex · placeholder; not uploaded'
});
export const newApplicationDraft=()=>({answer:'I enjoy clarifying complex workflows.',acknowledged:false});

export function validateApplicationDraft(draft) {
  const errors={};
  if(typeof draft.answer!=='string'||draft.answer.length>1000)errors.answer='Use up to 1,000 characters for this fictional answer.';
  if(draft.acknowledged!==true)errors.acknowledged='Confirm that this is a local simulation before submitting.';
  return {errors,value:{answer:typeof draft.answer==='string'?draft.answer.trim():'',acknowledged:draft.acknowledged===true}};
}

export function snapshotListing(job) {
  return structuredClone({id:job.id,title:job.title,employer:job.employer,arrangement:job.arrangement,location:job.location,pay:job.pay,requirements:job.requirements,preferred:job.preferred,sponsorship:job.sponsorship,fixtureDate:FIXTURE_DATE});
}

const text=(value,max=200)=>typeof value==='string'&&value.length>0&&value.length<=max;
function validSnapshot(value,jobId) {
  if(!value||value.id!==jobId||!text(value.title)||!text(value.employer)||!text(value.location)||!['Remote','Hybrid','On-site'].includes(value.arrangement))return false;
  if(!value.sponsorship||!['available','unavailable','unknown'].includes(value.sponsorship.status))return false;
  if(!text(value.sponsorship.scope)||!text(value.fixtureDate))return false;
  if(value.sponsorship.status!=='unknown'&&(!text(value.sponsorship.source)||!text(value.sponsorship.date)))return false;
  if(!Array.isArray(value.requirements)||!value.requirements.every(v=>text(v))||!Array.isArray(value.preferred)||!value.preferred.every(v=>text(v)))return false;
  if(value.pay!==null&&(!value.pay||!Number.isFinite(value.pay.min)||!Number.isFinite(value.pay.max)||value.pay.min<0||value.pay.max<value.pay.min||value.pay.currency!=='USD'||value.pay.period!=='year'))return false;
  return true;
}

export function normalizeApplications(input) {
  if(!Array.isArray(input))return [];
  const ids=new Set(),jobIds=new Set(),records=[];
  for(const value of input){
    if(!value||!jobs.some(j=>j.id===value.jobId)||!/^DEMO-[a-zA-Z0-9-]{8,80}$/.test(value.id)||ids.has(value.id)||jobIds.has(value.jobId))continue;
    if(value.status!=='recorded-locally'||!text(value.createdAt)||!Number.isFinite(Date.parse(value.createdAt))||!validSnapshot(value.listing,value.jobId))continue;
    if(!value.payload||typeof value.payload.answer!=='string'||value.payload.answer.length>1000)continue;
    ids.add(value.id);jobIds.add(value.jobId);
    records.push({id:value.id,jobId:value.jobId,status:'recorded-locally',createdAt:new Date(value.createdAt).toISOString(),listing:structuredClone(value.listing),payload:{...DEMO_CANDIDATE,answer:value.payload.answer},simulation:true});
  }
  return records;
}

export function prepareDemoApplication(state,jobId,draft,id,now) {
  const existing=state.applications.find(a=>a.jobId===jobId);
  if(existing)return {state,record:existing,duplicate:true,errors:{}};
  const {errors,value}=validateApplicationDraft(draft),job=jobById(jobId);
  if(!job)errors.form='This fictional listing is unavailable.';
  if(!/^DEMO-[a-zA-Z0-9-]{8,80}$/.test(id)||state.applications.some(a=>a.id===id)||!Number.isFinite(Date.parse(now)))errors.form='The demo record could not be prepared. Return to the listing and try again.';
  if(Object.keys(errors).length)return {state,record:null,errors};
  const record={id,jobId,status:'recorded-locally',createdAt:new Date(now).toISOString(),listing:snapshotListing(job),payload:{...DEMO_CANDIDATE,answer:value.answer},simulation:true};
  return {state:{...state,applications:[...state.applications,record]},record,duplicate:false,errors:{}};
}
