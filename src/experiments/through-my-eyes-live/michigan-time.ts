/** Local time is quiet metadata, never a repeatedly announced live region. */
const clock=document.querySelector<HTMLTimeElement>('[data-michigan-time]');
if(clock){
 const format=new Intl.DateTimeFormat('en-US',{timeZone:'America/Detroit',hour:'numeric',minute:'2-digit',timeZoneName:'short'});
 const update=()=>{if(document.hidden)return;const now=new Date();clock.textContent=format.format(now);clock.dateTime=now.toISOString();};
 update();const timer=window.setInterval(update,60_000);
 document.addEventListener('visibilitychange',update);
 const cleanup=()=>{clearInterval(timer);document.removeEventListener('visibilitychange',update);};
 window.addEventListener('pagehide',e=>{if(!e.persisted)cleanup();},{once:true});import.meta.hot?.dispose(cleanup);
}
