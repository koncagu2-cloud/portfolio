import {firefox,webkit} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
const output='/Users/suleymankoncagul/Documents/ChatGPT/Apple portfolio Piece/Through My Eyes Experience/performance/cross-browser';await mkdir(output,{recursive:true});const results=[];
for(const [name,engine] of Object.entries({firefox,webkit})){
 let browser;const errors=[];let state={};
 try{
  browser=await engine.launch({headless:true});const page=await browser.newPage({viewport:{width:1024,height:768},reducedMotion:'reduce'});
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4353/experiments/through-my-eyes-live/');
  await page.waitForFunction(()=>document.querySelector('[data-tme]')?.getAttribute('data-ready')==='true'||document.querySelector('[data-status]')?.textContent?.includes('3D is unavailable'));
  await page.waitForFunction(()=>document.querySelector('[data-tme]')?.getAttribute('data-presented')==='true'||document.querySelector('[data-status]')?.textContent?.includes('3D is unavailable'));state=await page.locator('[data-tme]').evaluate(el=>({...el.dataset}));await page.screenshot({path:output+'/'+name+'-hero.png'});
  await page.getByRole('link',{name:'Look closer',exact:true}).click();await page.locator('#d2l-world').waitFor({state:'visible'});
  await page.getByRole('radio',{name:'Assignment-01.pdf PDF document · Final draft'}).check();await page.getByRole('button',{name:'Review selected file'}).click();await page.getByRole('button',{name:'Submit demo'}).click();
  const success=await page.locator('[data-tme]').getAttribute('data-demo-state');const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);await page.screenshot({path:output+'/'+name+'-demo.png'});
  results.push({name,ready:state.ready==='true',fallback:state.ready!=='true',success,overflow,errors});
 }catch(error){results.push({name,error:String(error),state,errors});}finally{await browser?.close();}
}
await writeFile(output+'/results.json',JSON.stringify(results,null,2));console.log(results);
