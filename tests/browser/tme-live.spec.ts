import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const route='/experiments/through-my-eyes-live/';
const output=process.env.TME_OUTPUT||'/Users/suleymankoncagul/Documents/ChatGPT/Apple portfolio Piece/Through My Eyes Experience/polish';
test('complete lens journey, D2L recovery and return; capture desktop recording',async({page},testInfo)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await mkdir(output+'/screenshots',{recursive:true});await page.goto(route);const root=page.locator('[data-tme]');await expect(root).toHaveAttribute('data-ready','true');
 await expect(root).toHaveAttribute('data-asset','temporary-phase-11-static-study');await page.screenshot({path:output+'/screenshots/desktop-hero.png'});
 const startYaw=await root.getAttribute('data-head-yaw');await page.mouse.move(1240,300);await page.waitForTimeout(1000);expect(await root.getAttribute('data-head-yaw')).not.toBe(startYaw);await page.screenshot({path:output+'/screenshots/character-interaction.png'});
 // Observe an actual blink within one idle cycle, rather than force a test-only facial state.
 await expect.poll(async()=>Number(await root.getAttribute('data-blink')),{timeout:12000,intervals:[40]}).toBeGreaterThan(.2);
 await page.getByRole('link',{name:'Enter through the lens',exact:false}).click();await page.waitForTimeout(400);await page.screenshot({path:output+'/screenshots/desktop-lens-approach.png'});expect(Number(await root.getAttribute('data-camera-distance'))).toBeGreaterThan(.003);await expect(page.locator('#d2l-world')).toBeFocused();await expect(root).toHaveAttribute('data-phase','project');await page.screenshot({path:output+'/screenshots/desktop-d2l.png'});await page.locator('.tme-world').screenshot({path:output+'/screenshots/full-d2l.png'});
 await page.getByRole('button',{name:'Review selected file'}).click();await expect(page.locator('[data-feedback]')).toHaveText('Choose a sample file before reviewing.');
 await page.getByRole('radio',{name:'Assignment-01.pdf PDF document · Final draft'}).check();await page.getByRole('button',{name:'Review selected file'}).click();await expect(page.getByRole('button',{name:'Submit demo'})).toBeFocused();
 await page.getByRole('button',{name:'Remove selected sample file'}).click();await expect(page.locator('[data-feedback]')).toContainText('File removed');
 await page.getByRole('radio',{name:'Assignment-notes.pdf PDF document · Working notes'}).check();await page.getByRole('button',{name:'Review selected file'}).click();await page.getByRole('button',{name:'Submit demo'}).click();await expect(page.locator('[data-record-file]')).toHaveText('Assignment-notes.pdf');await expect(root).toHaveAttribute('data-demo-state','success');await page.screenshot({path:output+'/screenshots/desktop-demo.png'});
 await page.getByRole('link',{name:'Back through the lens'}).click();await expect(root).toHaveAttribute('data-phase','intro');await expect(page.getByRole('link',{name:'Explore my work',exact:true})).toBeFocused();
 await writeFile(output+'/runtime.json',JSON.stringify(await root.evaluate(el=>({...el.dataset,viewport:{width:innerWidth,height:innerHeight},overflow:document.documentElement.scrollWidth>innerWidth})),null,2));expect(errors).toEqual([]);
 if(page.video())await writeFile(output+'/recording-path.txt',await page.video()!.path());
});
test('responsive touch compositions, 320 through 1440px',async({page})=>{
 for(const width of [320,375,768,1024,1440]){await page.setViewportSize({width,height:width<700?812:1000});await page.goto(route);await expect(page.locator('[data-tme]')).toHaveAttribute('data-ready','true');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.getByRole('link',{name:'Enter through the lens',exact:false})).toBeInViewport();await page.screenshot({path:output+`/screenshots/hero-${width}.png`});
 await page.getByRole('link',{name:'D2L, without motion'}).click();await expect(page.locator('#d2l-world')).toBeFocused();await page.screenshot({path:output+`/screenshots/d2l-${width}.png`});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});
test('reduced motion, keyboard, accessibility and WebGL failure',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(route);const root=page.locator('[data-tme]');await expect(root).toHaveAttribute('data-ready','true');await expect(root).toHaveAttribute('data-motion','reduced');await expect(page.getByRole('button',{name:'Motion paused'})).toBeDisabled();await page.waitForTimeout(700);const count=await root.getAttribute('data-render-count');await page.waitForTimeout(700);expect(await root.getAttribute('data-render-count')).toBe(count);
 await page.getByRole('link',{name:'Enter through the lens',exact:false}).focus();await page.keyboard.press('Enter');await expect(page.locator('#d2l-world')).toBeFocused();
 const results=await new AxeBuilder({page}).include('.tme').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();await writeFile(output+'/accessibility.json',JSON.stringify(results.violations,null,2));expect(results.violations).toEqual([]);
 await page.getByRole('radio',{name:'Assignment-01.pdf PDF document · Final draft'}).focus();await page.keyboard.press('Space');await page.getByRole('button',{name:'Review selected file'}).focus();await page.keyboard.press('Enter');await expect(page.getByRole('button',{name:'Submit demo'})).toBeFocused();await page.keyboard.press('Enter');await expect(root).toHaveAttribute('data-demo-state','success');
 await page.route('**/temporary-head.glb',r=>r.abort());await page.goto(route);await expect(page.locator('[data-status]')).toContainText('3D is unavailable');await page.getByRole('link',{name:'Enter through the lens',exact:false}).click();await expect(page.locator('#d2l-world')).toBeFocused();await expect(page.getByRole('button',{name:'Review selected file'})).toBeVisible();
});
test.describe('touch journey',()=>{
 test('tap entry, complete demo and return on mobile',async({browser})=>{
  const context=await browser.newContext({baseURL:test.info().project.use.baseURL,viewport:{width:375,height:812},isMobile:true,hasTouch:true,...(process.env.TME_NO_RECORDING?{}:{recordVideo:{dir:output+'/mobile-recording',size:{width:375,height:812}}})});const page=await context.newPage();
  await page.goto(route);const root=page.locator('[data-tme]');await expect(root).toHaveAttribute('data-ready','true');await page.screenshot({path:output+'/screenshots/mobile-hero.png'});
  await page.getByRole('link',{name:'Enter through the lens',exact:false}).tap();await expect(root).toHaveAttribute('data-phase','project');await expect(page.locator('#d2l-world')).toBeFocused();await page.screenshot({path:output+'/screenshots/mobile-d2l.png'});
  await page.getByRole('radio',{name:'Assignment-01.pdf PDF document · Final draft'}).tap();await page.getByRole('button',{name:'Review selected file'}).tap();await page.getByRole('button',{name:'Submit demo'}).tap();await expect(root).toHaveAttribute('data-demo-state','success');await page.screenshot({path:output+'/screenshots/mobile-demo.png'});
  await page.getByRole('link',{name:'Back through the lens'}).tap();await expect(page.getByRole('link',{name:'Explore my work',exact:true})).toBeFocused();await expect(root).toHaveAttribute('data-phase','intro');await context.close();if(page.video())await page.video()!.saveAs(output+'/interaction-mobile.webm');
 });
});

test('attention, pause, direct case study and continuous destination composition',async({page})=>{
 await page.goto(route);const root=page.locator('[data-tme]');await expect(root).toHaveAttribute('data-ready','true');
 await expect(page.getByRole('link',{name:'Read D2L case study'})).toHaveAttribute('href','/work/d2l-redesign/');
 await page.getByRole('link',{name:'Enter through the lens',exact:false}).focus();await expect(root).toHaveAttribute('data-attention','visitor');await page.waitForTimeout(450);
 await page.screenshot({path:output+'/screenshots/character-acknowledges.png'});
 const start=Number(await root.getAttribute('data-render-count'));const stamp=Date.now();await page.waitForTimeout(1000);const frameDelta=Number(await root.getAttribute('data-render-count'))-start;
 await page.getByRole('button',{name:'Pause motion'}).click();await page.waitForTimeout(200);const paused=await root.getAttribute('data-render-count');await page.mouse.move(900,200);await page.waitForTimeout(500);expect(await root.getAttribute('data-render-count')).toBe(paused);
 await page.getByRole('button',{name:'Motion paused'}).click();
 await page.getByRole('link',{name:'Enter through the lens',exact:false}).click();
 const samples=[];
 for(let i=0;i<4;i++){await page.waitForTimeout(130);samples.push({progress:Number(await root.getAttribute('data-progress')),cameraDistance:Number(await root.getAttribute('data-camera-distance'))});if(i===2)await page.screenshot({path:output+'/screenshots/portal-destination.png'});}
 expect(samples.every(s=>s.cameraDistance>.003)).toBe(true);
 const portal=page.locator('[data-portal]');await expect(portal).toHaveAttribute('inert','');
 const text=await portal.locator('h2').textContent();expect(text).toBe(await page.locator('.tme-world h2').textContent());
 await writeFile(output+'/performance-and-continuity.json',JSON.stringify({sampleWindowMs:Date.now()-stamp,idleFramesInOneSecond:frameDelta,frameCapDesktop:30,triangles:await root.getAttribute('data-triangles'),drawCalls:await root.getAttribute('data-draw-calls'),samples},null,2));
});
test('hidden rendering stops and context loss restores direct navigation',async({page})=>{
 await page.goto(route);const root=page.locator('[data-tme]');await expect(root).toHaveAttribute('data-ready','true');
 await page.getByRole('link',{name:'D2L, without motion'}).click();await page.waitForTimeout(250);const count=await root.getAttribute('data-render-count');await page.waitForTimeout(400);expect(await root.getAttribute('data-render-count')).toBe(count);
 await page.getByRole('link',{name:'Return to the character',exact:false}).click();await expect(root).toHaveAttribute('data-phase','intro');
 await page.evaluate(()=>{const canvas=document.querySelector<HTMLCanvasElement>('[data-canvas]')!;canvas.getContext('webgl2')!.getExtension('WEBGL_lose_context')!.loseContext();});
 await expect(page.locator('[data-status]')).toContainText('3D is unavailable');await expect(page.getByRole('link',{name:'Read D2L case study'})).toBeVisible();
 await page.getByRole('link',{name:'Enter through the lens',exact:false}).click();await expect(page.locator('#d2l-world')).toBeInViewport();await expect(page.getByRole('button',{name:'Review selected file'})).toBeVisible();
});
test('high-DPI touch framing and measured pointer response',async({browser,page})=>{
 const context=await browser.newContext({baseURL:test.info().project.use.baseURL,viewport:{width:375,height:812},deviceScaleFactor:2,isMobile:true,hasTouch:true});const mobile=await context.newPage();
 await mobile.goto(route);await expect(mobile.locator('[data-tme]')).toHaveAttribute('data-ready','true');
 const density=await mobile.evaluate(()=>({deviceDpr:devicePixelRatio,effectiveDpr:Number(document.querySelector<HTMLElement>('[data-tme]')!.dataset.effectiveDpr),buffer:[document.querySelector<HTMLCanvasElement>('[data-canvas]')!.width,document.querySelector<HTMLCanvasElement>('[data-canvas]')!.height]}));expect(density.effectiveDpr).toBeLessThanOrEqual(1.25);expect(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);await mobile.screenshot({path:output+'/screenshots/mobile-dpr2.png'});await mobile.setViewportSize({width:1024,height:768});await mobile.waitForTimeout(100);expect(Number(await mobile.locator('[data-tme]').getAttribute('data-effective-dpr'))).toBeLessThanOrEqual(1.5);await mobile.setViewportSize({width:375,height:812});await mobile.waitForTimeout(100);expect(Number(await mobile.locator('[data-tme]').getAttribute('data-effective-dpr'))).toBeLessThanOrEqual(1.25);await context.close();
 await page.goto(route);await expect(page.locator('[data-tme]')).toHaveAttribute('data-ready','true');
 const response=await page.evaluate(()=>new Promise<number>(resolve=>{const root=document.querySelector<HTMLElement>('[data-tme]')!,stage=document.querySelector<HTMLElement>('[data-stage]')!,old=root.dataset.gazeX,start=performance.now();const observer=new MutationObserver(()=>{if(root.dataset.gazeX!==old){observer.disconnect();clearTimeout(timer);resolve(performance.now()-start);}});observer.observe(root,{attributes:true,attributeFilter:['data-gaze-x']});const timer=setTimeout(()=>{observer.disconnect();resolve(-1);},3000);stage.dispatchEvent(new PointerEvent('pointermove',{pointerType:'mouse',clientX:1300,clientY:350,bubbles:true}));}));expect(response).toBeGreaterThanOrEqual(0);await writeFile(output+'/response-and-density.json',JSON.stringify({density,eventToFirstGazeUpdateMs:response,note:'One synthetic event-to-DOM-update sample; excludes physical input, display scanout and protocol latency.'},null,2));
});
