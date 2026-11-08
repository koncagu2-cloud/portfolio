// In-memory demo choices only. No storage, network calls, or personal readings.
export const finishNames=Object.freeze(['Natural Titanium','Black Titanium','White Titanium','Desert Titanium']);
const defaults=Object.freeze({finish:0,sleep:true,heart:true,textSize:'standard',missingNight:false,reflection:'',stage:'morning',combination:'together',handoffMoment:'night',ringLink:'synced'});
let state={...defaults};
const listeners=new Set();
const valid={handoffMoment:value=>['night','morning'].includes(value),ringLink:value=>['synced','disconnected'].includes(value),finish:value=>Number.isInteger(value)&&value>=0&&value<4,sleep:value=>typeof value==='boolean',heart:value=>typeof value==='boolean',textSize:value=>['standard','large'].includes(value),missingNight:value=>typeof value==='boolean',reflection:value=>['','Rested','Somewhat rested','Tired'].includes(value),stage:value=>['morning','afternoon','evening'].includes(value),combination:value=>['together','ring'].includes(value)};
export function getExperience(){return Object.freeze({...state});}
export function updateExperience(patch,reason='choice'){
 const changed=[];
 for(const[key,value]of Object.entries(patch)){if(valid[key]?.(value)&&state[key]!==value){state[key]=value;changed.push(key);}}
 if(changed.length)for(const listener of listeners)listener(getExperience(),{changed,reason,reset:false,initial:false});
}
export function subscribeExperience(listener){listeners.add(listener);listener(getExperience(),{changed:[],reason:'initial',reset:false,initial:true});return()=>listeners.delete(listener);}
export function resetExperience(){const next={...defaults,textSize:state.textSize};const changed=Object.keys(defaults).filter(key=>state[key]!==next[key]);state=next;for(const listener of listeners)listener(getExperience(),{changed,reason:'reset',reset:true,initial:false});}
export function daySnapshot(current=getExperience()){
 const moments={morning:{clock:'7:05',steps:'120'},afternoon:{clock:'2:30',steps:'6,840'},evening:{clock:'10:00',steps:'8,210'}};
 return {...moments[current.stage],source:current.combination==='together'?'Apple Watch':'Ring'};
}
