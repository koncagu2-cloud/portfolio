import{test,expect}from'@playwright/test';
const route='/experiments/through-my-eyes-live/';
const scenes=['d2l-world','chapter-ring','chapter-community','chapter-align','beyond-the-screen'];
const state=(page:any)=>page.locator('[data-tme]');
test('every project boundary responds to forward and reverse wheel travel',async({page})=>{
 await page.goto(route+'#d2l-world');await page.mouse.move(700,400);
 for(const id of scenes.slice(1)){await page.locator('.tme-scene-panel[data-scene-active=true]').evaluate(e=>e.scrollTop=e.scrollHeight);await page.waitForTimeout(260);await page.mouse.wheel(0,180);await expect(state(page)).toHaveAttribute('data-scene',id);await page.waitForTimeout(250);}
 for(const id of [...scenes].reverse().slice(1)){await page.locator('.tme-scene-panel[data-scene-active=true]').evaluate(e=>e.scrollTop=0);await page.waitForTimeout(260);await page.mouse.wheel(0,-180);await expect(state(page)).toHaveAttribute('data-scene',id);await page.waitForTimeout(250);}
});
test('a partially travelled edge reverses without completing or changing history',async({page})=>{
 await page.goto(route+'#d2l-world');const initial=await page.evaluate(()=>history.length);await page.locator('#d2l-world').evaluate(e=>e.scrollTop=e.scrollHeight);await page.mouse.move(700,400);
 await page.mouse.wheel(0,300);await expect(state(page)).toHaveAttribute('data-scene-travel','scrubbing');
 await expect.poll(async()=>Number(await state(page).getAttribute('data-transition-progress'))).toBeGreaterThan(.05);
 const p=Number(await state(page).getAttribute('data-transition-progress'));expect(p).toBeLessThan(1);
 await page.mouse.wheel(0,-340);await expect(state(page)).toHaveAttribute('data-scene-travel','idle');await expect(state(page)).toHaveAttribute('data-scene','d2l-world');
 expect(await page.evaluate(()=>history.length)).toBe(initial);expect(await page.locator('.tme-scene-panel[data-scene-active=true]').count()).toBe(1);
});
test('reversal during automatic settling cancels the promoted target rather than committing a chapter',async({page})=>{
 await page.goto(route+'#d2l-world');await page.locator('#d2l-world').evaluate(e=>e.scrollTop=e.scrollHeight);const initial=await page.evaluate(()=>history.length);await page.mouse.move(700,400);await page.mouse.wheel(0,180);
 // One pulse contributes only .29 input. A visual progress above .4 proves the
 // 240ms settling timer has promoted the target; reverse that exact state.
 await expect.poll(async()=>Number(await state(page).getAttribute('data-transition-progress'))).toBeGreaterThan(.4);
 await expect(state(page)).toHaveAttribute('data-scene-travel','scrubbing');await page.mouse.wheel(0,-180);
 await expect(state(page)).toHaveAttribute('data-scene-travel','idle');await expect(state(page)).toHaveAttribute('data-scene','d2l-world');expect(await page.evaluate(()=>history.length)).toBe(initial);
});
test('reversing from an overflowing mobile chapter arrives at the previous reading boundary',async({page})=>{
 await page.setViewportSize({width:375,height:812});await page.goto(route+'#chapter-ring');
 await page.locator('.tme-scene-nav').hover();await page.mouse.wheel(0,-220);await expect(state(page)).toHaveAttribute('data-scene','d2l-world');
 const panel=page.locator('#d2l-world');expect(await panel.evaluate(e=>Math.abs(e.scrollHeight-e.clientHeight-e.scrollTop))).toBeLessThan(3);
 // Upward scrolling now reads the previous chapter instead of jumping past its evidence.
 await page.mouse.wheel(0,-120);await expect.poll(async()=>panel.evaluate(e=>e.scrollTop)).toBeLessThan(await panel.evaluate(e=>e.scrollHeight-e.clientHeight));await expect(state(page)).toHaveAttribute('data-scene','d2l-world');
});
test('browser history and refresh restore chapter and reading position',async({page})=>{
 await page.setViewportSize({width:375,height:812});await page.goto(route+'#d2l-world');const panel=page.locator('#d2l-world');await panel.evaluate(e=>e.scrollTop=120);await page.waitForTimeout(80);
 await page.getByRole('button',{name:'Next chapter',exact:true}).click();await expect(state(page)).toHaveAttribute('data-scene','chapter-ring');await page.goBack();await expect(state(page)).toHaveAttribute('data-scene','d2l-world');await expect.poll(async()=>panel.evaluate(e=>e.scrollTop)).toBeCloseTo(120,0);await page.reload();await expect.poll(async()=>panel.evaluate(e=>e.scrollTop)).toBeCloseTo(120,0);
});
test('case study reader owns wheel input and returns to the same scene position',async({page})=>{
 await page.goto(route+'#chapter-community');await page.locator('#chapter-community .tme-opening-detail summary').click();await page.getByRole('button',{name:'How this was designed',exact:false}).filter({visible:true}).click();await page.locator('.tme-scene-evidence[open] [data-reader=case]').first().click();
 const reader=page.locator('[data-project-reader]');await expect(reader).toHaveAttribute('data-state','ready');await reader.hover();await page.mouse.wheel(0,-800);await expect(state(page)).toHaveAttribute('data-scene','chapter-community');await reader.getByRole('button',{name:'Close reader'}).click();await expect(reader).not.toBeVisible();await expect(state(page)).toHaveAttribute('data-scene','chapter-community');
});
test('reverse lens travel resumes its camera position when the deferred model becomes ready',async({page})=>{
 await page.goto(route+'#d2l-world');await page.mouse.move(700,400);await page.mouse.wheel(0,-160);await expect(state(page)).toHaveAttribute('data-scene','through-lens');
 await expect(state(page)).toHaveAttribute('data-ready','true',{timeout:45000});await expect.poll(async()=>Number(await state(page).getAttribute('data-camera-z'))).toBeLessThan(4.5);
 await page.mouse.wheel(0,-1200);await expect(state(page)).toHaveAttribute('data-scene','perspective');await expect.poll(async()=>Number(await state(page).getAttribute('data-camera-z'))).toBeCloseTo(4.8,1);
});
test('full-motion touch gestures scrub project travel forward and backward',async({browser})=>{
 const context=await browser.newContext({viewport:{width:375,height:812},isMobile:true,hasTouch:true});const page=await context.newPage();await page.goto(route+'#d2l-world');const cdp=await context.newCDPSession(page);
 const swipe=async(from:number,to:number)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:12,y:from}]});for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:12,y:from+(to-from)*i/6}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
 await page.locator('#d2l-world').evaluate(e=>e.scrollTop=e.scrollHeight);await swipe(620,310);await expect(state(page)).toHaveAttribute('data-scene','chapter-ring');await page.locator('#chapter-ring').evaluate(e=>e.scrollTop=0);await swipe(250,580);await expect(state(page)).toHaveAttribute('data-scene','d2l-world');await context.close();
});
test('reducing motion cancels an in-flight edge and retains accessible direct navigation',async({page})=>{
 await page.goto(route+'#d2l-world');await page.locator('#d2l-world').evaluate(e=>e.scrollTop=e.scrollHeight);await page.locator('.tme-scene-nav').dispatchEvent('wheel',{deltaY:250,bubbles:true,cancelable:true});await expect(state(page)).toHaveAttribute('data-scene-travel','scrubbing');await page.emulateMedia({reducedMotion:'reduce'});await expect(state(page)).toHaveAttribute('data-scene-travel','idle');expect(await page.evaluate(()=>document.getAnimations().some(a=>a.playState==='running'))).toBe(false);await page.getByRole('button',{name:'Next chapter',exact:true}).focus();await page.keyboard.press('Enter');await expect(state(page)).toHaveAttribute('data-scene','chapter-ring');
});
test('one stationary page-level trackpad stream traverses the complete journey in both directions without clicks',async({page})=>{
 await page.goto(route);await expect(state(page)).toHaveAttribute('data-ready','true',{timeout:45000});
 const travel=async(direction:number,destination:string)=>page.evaluate(async({direction,destination})=>{
  const root=document.querySelector<HTMLElement>('[data-tme]')!,seen:string[]=[];const record=(e:Event)=>seen.push((e as CustomEvent<string>).detail);root.addEventListener('tme:scene',record);
  for(let i=0;i<400&&root.dataset.scene!==destination;i++){
   // Browser retargeting may land on body after the previous scene becomes inert.
   document.body.dispatchEvent(new WheelEvent('wheel',{deltaY:direction*85,bubbles:true,cancelable:true}));await new Promise(r=>setTimeout(r,20));
  }
  root.removeEventListener('tme:scene',record);return seen;
 },{direction,destination});
 const forward=await travel(1,'beyond-the-screen');await expect(state(page)).toHaveAttribute('data-scene','beyond-the-screen');expect(forward).toEqual(expect.arrayContaining(['through-lens',...scenes]));
 const backward=await travel(-1,'perspective');await expect(state(page)).toHaveAttribute('data-scene','perspective');expect(backward).toEqual(expect.arrayContaining(['chapter-align','chapter-community','chapter-ring','d2l-world','through-lens','perspective']));
});
test('scrolling past a hover-only scanner continues through the lens without a dismiss click',async({page})=>{
 await page.goto(route);await expect(state(page)).toHaveAttribute('data-ready','true',{timeout:45000});await page.locator('[data-scanner-target]').first().dispatchEvent('pointerover',{pointerType:'mouse'});await expect(state(page)).toHaveAttribute('data-scanner','preview');
 await page.locator('body').dispatchEvent('wheel',{deltaY:150,bubbles:true,cancelable:true});await expect(state(page)).toHaveAttribute('data-scanner','closed');await expect(state(page)).toHaveAttribute('data-scene','through-lens');
});
