import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const route='/experiments/through-my-lens/';

test('lens enhancement supports keyboard inspection, modes, reset and native project entry',async({page})=>{
 await page.goto(route);const root=page.locator('[data-lens-experience]');
 await expect(root).toHaveAttribute('data-enhanced','true');
 await page.getByRole('button',{name:'Rotate glasses right',exact:true}).focus();await page.keyboard.press('Enter');
 await expect.poll(async()=>Number(await root.getAttribute('data-yaw'))).toBeGreaterThan(.45);
 await page.getByRole('button',{name:'Sun',exact:true}).press('Space');await expect(root).toHaveAttribute('data-material','sun');
 await expect(page.getByRole('button',{name:'Sun',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.keyboard.press('Escape');await expect.poll(async()=>Math.abs(Number(await root.getAttribute('data-yaw')))).toBeLessThan(.01);
 await page.getByRole('link',{name:'Skip introduction',exact:true}).click();await expect(page.locator('#projects')).toBeInViewport();
 await page.getByRole('link',{name:'Read the D2L case study ↗',exact:true}).click();await expect(page).toHaveURL(/\/work\/d2l-redesign\/$/);
});

test('camera travels through the lens before the HTML artifact appears, with no mask or idle loop',async({page})=>{
 await page.goto(route);const root=page.locator('[data-lens-experience]');await expect(root).toHaveAttribute('data-enhanced','true');
 const scale=await root.getAttribute('data-model-scale');const distance=await page.locator('#projects').evaluate(el=>el.getBoundingClientRect().top+scrollY);
 await page.mouse.wheel(0,distance*.55);await expect.poll(async()=>Number(await root.getAttribute('data-progress'))).toBeGreaterThan(.5);
 expect(Number(await root.getAttribute('data-camera-z'))).toBeLessThan(8);await expect(root).toHaveAttribute('data-model-scale',scale!);
 await expect(page.locator('[data-entry]')).toHaveCSS('clip-path','none');await expect(page.locator('.d2l-selected')).toHaveCSS('opacity','0');
 await page.mouse.wheel(0,distance*.28);await expect.poll(async()=>Number(await root.getAttribute('data-progress'))).toBeGreaterThan(.8);
 expect(Number(await root.getAttribute('data-camera-z'))).toBeLessThan(Number(await root.getAttribute('data-lens-surface-z')));
 await page.mouse.wheel(0,distance*.17);await expect(root).toHaveAttribute('data-phase','clarity');await expect(page.locator('.d2l-selected')).toHaveCSS('opacity','1');
 const count=await root.getAttribute('data-render-count');await page.waitForTimeout(200);expect(await root.getAttribute('data-render-count')).toBe(count);
 await page.getByRole('link',{name:'The person',exact:true}).click();await expect(page.getByRole('heading',{name:'Now you know how I see things.',exact:true})).toBeInViewport();
});

test('five widths keep native content readable; reduced motion and axe sampling pass',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(route);
 for(const width of [320,375,768,1024,1440]){
  await page.setViewportSize({width,height:900});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await expect(page.locator('[data-lens-experience]')).toHaveAttribute('data-motion','reduced');
  expect(await page.locator('.lens-journey').evaluate(el=>el.clientHeight)).toBeLessThanOrEqual(1000);
 }
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
});

test('blocked WebGL runtime leaves a static illustration and functional links',async({page})=>{
 await page.route('**/vendor/three.module.js',route=>route.abort());await page.goto(route);
 await expect(page.locator('[data-scene-status]')).toContainText('could not load');
 await expect(page.getByRole('img',{name:'Thin metal glasses, a symbol of perspective',exact:true})).toBeVisible();
 await page.getByRole('link',{name:'View projects',exact:true}).click();await expect(page.locator('#projects')).toBeInViewport();
 await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex, nofollow');
});

test('without JavaScript all four perspectives and contact remain accessible',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:900}});const page=await context.newPage();await page.goto('http://127.0.0.1:4322'+route);
 await expect(page.getByRole('heading',{name:'Which file will count?',exact:true})).toBeVisible();
 await expect(page.locator('.lens-preview')).toHaveCount(3);await expect(page.getByRole('link',{name:'Resume (PDF)',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await context.close();
});

test('horizontal touch inspection preserves vertical page scrolling',async({browser})=>{
 const context=await browser.newContext({hasTouch:true,isMobile:true,viewport:{width:375,height:900}});const page=await context.newPage();await page.goto('http://127.0.0.1:4322'+route);
 const root=page.locator('[data-lens-experience]');await expect(root).toHaveAttribute('data-enhanced','true');const canvas=page.locator('[data-glasses-canvas]');
 await expect(canvas).toHaveCSS('touch-action','pan-y');
 const touch=await context.newCDPSession(page);
 await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:120,y:620}]});
 await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:200,y:622}]});
 await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await expect.poll(async()=>Number(await root.getAttribute('data-yaw'))).toBeGreaterThan(.5);
 await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:120,y:620}]});
 await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:122,y:530}]});
 await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:122,y:400}]});
 await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await expect.poll(async()=>page.evaluate(()=>scrollY)).toBeGreaterThan(80);await context.close();
});


test('one authentic D2L artifact hands off continuously into readable normal flow',async({page})=>{
 await page.goto(route);await expect(page.locator('[data-lens-experience]')).toHaveAttribute('data-enhanced','true');
 await expect(page.locator('main img[src*="file-review"]')).toHaveCount(1);
 const offset=await page.locator('#projects').evaluate(el=>el.getBoundingClientRect().top+scrollY);
 await page.evaluate(y=>scrollTo(0,y),offset-8);await expect(page.locator('[data-entry]')).toHaveAttribute('data-pinned','true');
 await expect.poll(async()=>Number(await page.locator('[data-lens-experience]').getAttribute('data-progress'))).toBeGreaterThan(.98);
 const before=await page.locator('.lens-d2l-primary img').boundingBox();
 await page.evaluate(y=>scrollTo(0,y),offset+8);await expect(page.locator('[data-entry]')).toHaveAttribute('data-pinned','false');
 const after=await page.locator('.lens-d2l-primary img').boundingBox();
 expect(Math.abs(after!.y-before!.y)).toBeLessThan(20);
 await expect(page.getByRole('heading',{name:'Which file will count?',exact:true})).toBeInViewport();
});

test('all four perspectives expose real case and prototype destinations with honest evidence labels',async({page})=>{
 await page.goto(route);
 const index=page.getByRole('navigation',{name:'Four design perspectives',exact:true});await expect(index.getByRole('link')).toHaveCount(4);
 for(const href of ['/work/d2l-redesign/','/work/apple-ring/','/work/community-spaces/','/work/align/','/prototypes/apple-ring/index.html','/prototypes/align/'])await expect(page.locator(`main a[href="${href}"]`)).toHaveCount(1);
 await expect(page.getByRole('link',{name:/Open D2L prototype/})).toHaveAttribute('href',/^https:\/\/www\.figma\.com\/proto\//);
 await expect(page.getByRole('link',{name:/Open Community prototype/})).toHaveAttribute('href',/^https:\/\/www\.figma\.com\/proto\//);
 await expect(page.locator('#continuity')).toContainText('not affiliated with Apple');
 await expect(page.locator('#judgment')).toContainText('Historical, not the current R05 demo');
 await expect(page.locator('#connection')).toContainText('Suleyman’s original spatial sketch');
 for(const width of [1440,1024,768,390,375]){
  await page.setViewportSize({width,height:1000});
  await page.locator('.lens-wordmark').click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  for(const id of ['projects','continuity','connection','judgment','person']){
   await page.locator(`#${id}`).scrollIntoViewIfNeeded();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
 }
 await page.goto(route+'#projects');
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
});

test('D2L returns to the glasses before the next static perspective and keeps its source boundaries',async({page})=>{
 await page.goto(route+'#between-perspectives');const root=page.locator('[data-lens-experience]');await expect(root).toHaveAttribute('data-phase','return');
 await expect(page.getByRole('heading',{name:'Clarity, before commitment.',exact:true})).toBeInViewport();
 await expect(page.locator('[data-exit-canvas]')).toBeVisible();
 await expect.poll(async()=>page.locator('[data-exit-canvas]').evaluate((el:HTMLCanvasElement)=>el.width)).toBeGreaterThan(1000);
 await page.getByRole('link',{name:'Next perspective: Continuity',exact:false}).click();await expect(page).toHaveURL(/#continuity$/);
 await expect(page.locator('#continuity')).toBeInViewport();
 await expect(page.locator('#projects')).toContainText('My shared contribution');await expect(page.locator('#projects')).toContainText('Usability improvements remain unvalidated');
 await expect(page.locator('.d2l-record-artifact')).toContainText('Illustrative data');
});
