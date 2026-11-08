const reports=[];
const textScale=new URLSearchParams(location.search).get('text')==='200'?2:1;
let cases=[
 ['Discover · matching','discover',''],['Discover · imperfect','discover','morrow'],
 ['Search','search',''],['Search · empty','search?query=unfindable',''],
 ['Saved','saved','shortlist'],['Saved · unsaved draft','saved','draft-notes'],['Comparison','compare?ids=north,morrow,cedar','shortlist'],
 ['Details · missing evidence','job/morrow',''],['Details · explicit absence','job/north','gap'],
 ['Details · recorded','job/north','recorded'],['Application review','apply/north',''],['Applications · empty','applications',''],
 ['Applications · recorded','applications','recorded'],['Receipt','receipt/DEMO-preview-0001','recorded'],
 ['Search · invalid filter','search?arrangement=invalid',''],['Preferences','profile',''],['Missing page','missing','']
];
let viewports=[{width:320,height:844},{width:375,height:844},{width:390,height:844},{width:430,height:844},{width:768,height:844},{width:1024,height:844},{width:1440,height:844},{width:844,height:390}];
const auditParams=new URLSearchParams(location.search),single=auditParams.get('case');
if(single){cases=cases.filter(c=>c[0]===single);viewports=viewports.filter(v=>v.width===Number(auditParams.get('width')||320));}
for(const {width,height} of viewports)for(const [name,route,seed] of cases){
 const frame=document.createElement('iframe');frame.width=width;frame.height=height;frame.title=`Audit ${name} at ${width} × ${height}`;
 frame.src='index.html?preview=1'+(seed?'&case='+seed:'')+'#/'+route;
 document.querySelector('#frame-host').replaceChildren(frame);
 await new Promise(resolve=>frame.addEventListener('load',resolve,{once:true}));
 const d=frame.contentDocument;await d.fonts.ready;
 // Test-only text-resize stress: double computed font sizes and line heights,
 // keeping viewport and other dimensions unchanged. Not browser/OS text zoom.
 if(textScale!==1){
  const sizes=[...d.querySelectorAll('body,body *')].map(el=>{const c=frame.contentWindow.getComputedStyle(el);return {el,font:parseFloat(c.fontSize),line:parseFloat(c.lineHeight)};});
  const sheet=d.styleSheets[0];sizes.forEach(({el,font,line},i)=>{el.dataset.qaText=i;sheet.insertRule(`[data-qa-text="${i}"]{font-size:${font*textScale}px!important;${Number.isFinite(line)?`line-height:${line*textScale}px!important;`:''}}`,sheet.cssRules.length);});
 }
 await new Promise(resolve=>frame.contentWindow.requestAnimationFrame(()=>frame.contentWindow.requestAnimationFrame(resolve)));
 const visible=el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&frame.contentWindow.getComputedStyle(el).visibility!=='hidden';};
 const controls=[...d.querySelectorAll('button,a.btn,summary,select,input:not([type=checkbox]),textarea,label.check,nav a,.brand')].filter(visible);
 const short=controls.filter(el=>el.getBoundingClientRect().height<43.5||el.getBoundingClientRect().width<43.5).map(el=>({text:el.textContent.trim().slice(0,50)||el.id,height:Math.round(el.getBoundingClientRect().height),width:Math.round(el.getBoundingClientRect().width)}));
 const names=[...d.querySelectorAll('input,select,textarea')].filter(visible).filter(el=>!el.labels?.length&&!el.getAttribute('aria-label')).map(el=>el.id||el.name);
 const clippedTabStops=[...d.querySelectorAll('a[href],button,input,select,textarea,summary')].filter(visible).filter(el=>{for(let parent=el.parentElement;parent;parent=parent.parentElement){const style=frame.contentWindow.getComputedStyle(parent);if(style.clipPath!=='none'||(style.clip!=='auto'&&style.clip!==''))return true;}return false;}).map(el=>el.textContent.trim().slice(0,60)||el.id);
 const unnamedButtons=[...d.querySelectorAll('button')].filter(visible).filter(el=>!(el.getAttribute('aria-label')||el.textContent.trim()||el.getAttribute('title'))).map(el=>el.outerHTML.slice(0,100));
 const badControls=[...d.querySelectorAll('[aria-controls]')].flatMap(el=>el.getAttribute('aria-controls').split(/\s+/).filter(id=>!d.getElementById(id)));
 const nav=d.querySelector('.bottom-nav'),actions=d.querySelector('.discovery-actions');
 const actionOverlap=!!(nav&&actions&&visible(nav)&&frame.contentWindow.getComputedStyle(actions).position==='fixed'&&(actions.getBoundingClientRect().bottom>nav.getBoundingClientRect().top+1||actions.getBoundingClientRect().top<0));
 const discoverActions=route==='discover'?[...d.querySelectorAll('.discovery-actions button,.discovery-actions a')].filter(visible).length:3;
 const ids=[...d.querySelectorAll('[id]')].map(el=>el.id);
 const references=[...d.querySelectorAll('[aria-describedby],[aria-labelledby]')].flatMap(el=>['aria-describedby','aria-labelledby'].flatMap(attr=>(el.getAttribute(attr)||'').split(/\s+/).filter(id=>id&&!d.getElementById(id))));
 reports.push({name,width,height,route,seed,textScale,ready:d.documentElement.dataset.ready==='true',overflow:d.documentElement.scrollWidth>d.documentElement.clientWidth+1,shortControls:short,unlabelledInputs:names,missingDescriptions:references,clippedTabStops,unnamedButtons,badControls,actionOverlap,discoverActions,duplicateIds:ids.filter((id,i)=>ids.indexOf(id)!==i),h1:d.querySelectorAll('h1').length});
 document.querySelector('#progress').textContent=`Inspected ${reports.length} / ${viewports.length*cases.length}`;
}
const summary={frames:reports.length,failures:reports.filter(r=>!r.ready||r.overflow||r.shortControls.length||r.unlabelledInputs.length||r.missingDescriptions.length||r.clippedTabStops.length||r.unnamedButtons.length||r.badControls.length||r.actionOverlap||r.discoverActions!==3||r.duplicateIds.length||r.h1!==1),reports};
document.querySelector('#qa-json').textContent=JSON.stringify(summary,null,2);
document.querySelector('#progress').textContent=`Complete: ${reports.length} frames · ${summary.failures.length} flagged`;
if(!single)document.querySelector('#frame-host').replaceChildren();
