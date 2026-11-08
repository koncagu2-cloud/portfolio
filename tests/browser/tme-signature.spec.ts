import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const route='/experiments/through-my-eyes-live/';
test('readiness-driven glasses land once and release the temporary renderer',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(route);const root=page.locator('[data-tme]');
 await expect(root).toHaveAttribute('data-opening','complete',{timeout:45000});
 await expect(root).toHaveAttribute('data-opening-geometry','imported-glasses');
 await expect(root).toHaveAttribute('data-opening-landed','true');
 await expect(page.locator('.tme-signature-canvas')).toHaveCount(0);
 await expect(page.locator('.tme-enter')).toBeVisible();
 await page.getByRole('button',{name:'Next chapter',exact:true}).click();
 await page.getByRole('button',{name:'Previous chapter',exact:true}).click();
 await expect(root).toHaveAttribute('data-opening','complete');
 expect(errors).toEqual([]);
});
test('Skip works while the actual model request is still pending',async({page})=>{
 let release!:()=>void;const gate=new Promise<void>(r=>release=r);
 await page.route('**/temporary-head.glb',async route=>{await gate;await route.continue();});
 try{
 await page.goto(route);const root=page.locator('[data-tme]');
 await expect(root).toHaveAttribute('data-opening','loading');
 await page.getByRole('button',{name:'Skip intro'}).click();
 await expect(root).toHaveAttribute('data-opening','complete');
 await expect(page.locator('.tme-enter')).toBeFocused();
 await page.getByRole('button',{name:'Chapter index',exact:true}).click();
 await expect(page.locator('.tme-scene-index[open]')).toBeVisible();
 }finally{release();}
});
test('reduced motion and direct chapter visits bypass the opening',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(route);
 await expect(page.locator('[data-tme]')).toHaveAttribute('data-opening','complete');
 await expect(page.locator('[data-signature-opening]')).toBeHidden();
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(route+'#chapter-ring');
 await expect(page.locator('[data-tme]')).toHaveAttribute('data-opening','complete');
 await expect(page.locator('[data-tme]')).toHaveAttribute('data-scene','chapter-ring');
 await expect(page.locator('.tme-signature-canvas')).toHaveCount(0);
});
test('touch-size opening can be skipped with Escape without overflow',async({page})=>{
 await page.setViewportSize({width:375,height:812});
 let release!:()=>void;const gate=new Promise<void>(r=>release=r);
 await page.route('**/temporary-head.glb',async route=>{await gate;await route.continue();});
 try{await page.goto(route);await expect(page.getByRole('button',{name:'Skip intro'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.keyboard.press('Escape');await expect(page.locator('[data-signature-opening]')).toBeHidden();
 await expect(page.locator('.tme-enter')).toBeVisible();
 }finally{release();}
});


test('scanner focuses and previews every perspective, with direct chapter recovery',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const id of ['d2l-world','chapter-ring','chapter-community','chapter-align']){
  await page.goto(route);await page.locator('[data-scanner-toggle]').click();
  const choice=page.locator(`[data-hero-project="${id}"]`);await choice.focus();
  await expect(choice).toHaveAttribute('aria-pressed','true');
  await expect(page.locator(`[data-hero-preview="${id}"]`)).toBeVisible();
  await expect(page.locator('[data-hero-preview]:visible')).toHaveCount(1);
  await page.locator(`[data-hero-preview="${id}"] [data-scan-enter]`).click();
  await expect(page.locator('[data-tme]')).toHaveAttribute('data-scene',id);
  await page.getByRole('link',{name:'Through My Eyes introduction',exact:true}).click();
  await expect(page.locator('#hero-projects')).toBeHidden();
 }
});
test('touch users open the scanner, select details, and enter the chosen chapter',async({browser})=>{
 const context=await browser.newContext({viewport:{width:375,height:812},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const page=await context.newPage();await page.goto(route);await page.locator('[data-scanner-toggle]').tap();
 await page.locator('[data-hero-project="chapter-align"]').tap();
 await expect(page.locator('[data-hero-preview="chapter-align"]')).toBeVisible();
 await page.locator('[data-hero-preview="chapter-align"] [data-scan-enter]').tap();
 await expect(page.locator('[data-tme]')).toHaveAttribute('data-scene','chapter-align');await context.close();
});
test('open scanner passes automated accessibility checks',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(route);await page.locator('[data-scanner-toggle]').click();
 const result=await new AxeBuilder({page}).include('.tme-hero-perspectives').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(result.violations).toEqual([]);
});
test('actual lens-shaped targets preview, pin, and close with correct keyboard focus',async({page})=>{
 await page.goto(route);await expect(page.locator('[data-tme]')).toHaveAttribute('data-opening','complete',{timeout:45000});
 const glasses=page.locator('[data-scanner-target]').first();await expect(glasses).toHaveAttribute('data-hit-geometry','projected-lens-mesh');
 await glasses.hover();await expect(page.locator('[data-tme]')).toHaveAttribute('data-scanner','preview');
 await page.locator('#hero-projects').hover();await expect(page.locator('#hero-projects')).toBeVisible();
 await page.locator('[data-hero-project="chapter-ring"]').focus();await expect(page.locator('[data-tme]')).toHaveAttribute('data-scanner','pinned');
 await page.keyboard.press('Escape');await expect(page.locator('#hero-projects')).toBeHidden();await expect(glasses).toBeFocused();
});
test('all perspectives use the real camera and the selected project opening',async({page})=>{
 for(const id of ['chapter-ring','chapter-community','chapter-align','d2l-world']){
  await page.goto(route);await expect(page.locator('[data-tme]')).toHaveAttribute('data-opening','complete',{timeout:45000});
  await page.locator('[data-scanner-toggle]').click();await page.locator(`[data-hero-project="${id}"]`).click();
  await page.locator(`[data-hero-preview="${id}"] [data-scan-enter]`).click();
  await expect(page.locator('[data-tme]')).toHaveAttribute('data-lens-project',id,{timeout:15000});
  await expect(page.locator('[data-tme]')).toHaveAttribute('data-scene',id,{timeout:15000});
  expect(Number(await page.locator('[data-tme]').getAttribute('data-camera-z'))).toBeLessThan(2);
 }
});
test('scanner remains in bounds at five viewport widths',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [320,375,768,1024,1440]){
  await page.setViewportSize({width,height:width<700?812:1000});await page.goto(route);await page.locator('[data-scanner-toggle]').click();
  const box=await page.locator('#hero-projects').boundingBox();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(width);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});

test('scanner case reader returns focus to a visible launcher',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(route);await page.locator('[data-scanner-toggle]').click();
 await page.locator('[data-hero-project="chapter-ring"]').click();await page.locator('[data-hero-preview="chapter-ring"] [data-reader=case]').click();
 const reader=page.locator('[data-project-reader]');await expect(reader).toHaveAttribute('data-state','ready');await expect(reader.frameLocator('iframe').locator('h1')).toContainText('Apple Ring');
 await reader.getByRole('button',{name:'Close reader'}).click();await expect(page.locator('[data-scanner-toggle]')).toBeFocused();await expect(page.locator('#hero-projects')).toBeHidden();
});

test('scanner transforms the hero and restores it without leaving dimmed typography',async({page})=>{
 await page.goto(route);await expect(page.locator('[data-tme]')).toHaveAttribute('data-opening','complete',{timeout:45000});
 await page.locator('[data-scanner-toggle]').click();
 await expect.poll(()=>page.locator('.tme-type').evaluate(e=>getComputedStyle(e).opacity)).toBe('0');
 expect(await page.locator('.tme-type').evaluate(e=>e.hasAttribute('inert'))).toBe(true);
 const box=await page.locator('#hero-projects').boundingBox();expect(box!.width/1440).toBeCloseTo(.46,2);
 expect((await page.locator('[data-hero-preview="d2l-world"] .tme-curated-art').boundingBox())!.height).toBeGreaterThanOrEqual(300);
 await page.keyboard.press('Escape');await expect(page.locator('#hero-projects')).toBeHidden();
 await expect.poll(()=>page.locator('.tme-type').evaluate(e=>getComputedStyle(e).opacity)).toBe('1');
 expect(await page.locator('.tme-type').evaluate(e=>e.hasAttribute('inert'))).toBe(false);
 await expect(page.locator('[data-tme]')).toHaveAttribute('data-scanner-reframed','false');
});

test('scanner uses the original spatial artifact and a capture of the current ALIGN product',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(route);await page.locator('[data-scanner-toggle]').click();
 await page.locator('[data-hero-project="chapter-community"]').click();
 await expect(page.locator('[data-hero-preview="chapter-community"] .tme-curated-art svg')).toHaveAttribute('viewBox','49 97 296 621');
 await expect(page.locator('[data-hero-preview="chapter-community"] .tme-curated-art svg')).toBeVisible();
 await page.locator('[data-hero-project="chapter-align"]').click();
 const image=page.locator('[data-hero-preview="chapter-align"] .tme-curated-art img');await expect(image).toHaveAttribute('src',/align-current-product/);
 await expect.poll(()=>image.evaluate((e:HTMLImageElement)=>e.complete&&e.naturalWidth===1100)).toBe(true);
});

test('anatomical neck fade follows reframing while retaining the greeting smile and paired earrings',async({page})=>{
 await page.goto(route);await expect(page.locator('[data-tme]')).toHaveAttribute('data-opening','complete',{timeout:45000});const root=page.locator('[data-tme]');
 await expect(root).toHaveAttribute('data-earrings','paired-gunmetal-hoops');
 await expect.poll(async()=>Number(await root.getAttribute('data-smile'))).toBeGreaterThan(.2);
 const framing=()=>page.locator('[data-stage]').evaluate(e=>({start:parseFloat((e as HTMLElement).style.getPropertyValue('--portrait-fade-start')),end:parseFloat((e as HTMLElement).style.getPropertyValue('--portrait-fade-end')),mask:getComputedStyle(e.querySelector('.tme-character')!).maskImage}));
 const before=await framing();expect(before.mask).not.toBe('none');expect(before.end-before.start).toBeGreaterThan(80);
 await page.locator('[data-scanner-toggle]').click();await expect(root).toHaveAttribute('data-scanner','pinned');
 await expect.poll(async()=>{const f=await framing();return f.end-f.start;}).toBeGreaterThan(80);
 await page.keyboard.press('Escape');await expect(root).toHaveAttribute('data-scanner-reframed','false');expect(Math.abs((await framing()).end-before.end)).toBeLessThan(8);
});

test('D2L original artifact leads directly into the existing interaction',async({page})=>{
 await page.goto(route+'#d2l-world');const source=page.locator('.tme-d2l-evidence');await expect(source.locator('img')).toHaveAttribute('data-reflection-image','');
 await source.getByRole('link',{name:'Try the submission sequence',exact:false}).click();await expect(page.locator('.tme-scene-evidence[open] [data-demo]')).toBeVisible();
});
test('Community Spaces leads with its original prototype recording and retains original screens',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(route+'#chapter-community');
 const preview=page.locator('[data-chapter-video="chapter-community"]');await expect(preview.locator('img')).toBeVisible();await expect(preview.locator('video')).not.toHaveAttribute('src');
 await expect(page.locator('#community-place')).toHaveCount(0);await expect(page.getByRole('link',{name:'View the space sketch',exact:false})).toHaveCount(0);
 expect(await preview.evaluate(e=>getComputedStyle(e).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
 await page.setViewportSize({width:375,height:812});await expect(preview).toBeVisible();
 await preview.getByRole('link',{name:'Explore original event screens',exact:false}).click();await expect(page.locator('#community-capture-events')).toBeVisible();await expect(page.locator('#community-experience [data-artifact="community-capture-events"]')).toHaveAttribute('aria-pressed','true');
 const controls=await page.locator('#community-experience [data-artifact]').evaluateAll(elements=>elements.map(e=>e.getBoundingClientRect().height));expect(controls.every(h=>h>=44)).toBe(true);
});
test('fitted cap accessory loads with short hair and survives scanner and lens travel',async({page})=>{
 const asset=page.waitForResponse(r=>r.url().endsWith('/studio-cap-fit.glb'));await page.goto(route);expect((await asset).ok()).toBe(true);const root=page.locator('[data-tme]');await expect(root).toHaveAttribute('data-ready','true',{timeout:45000});await expect(root).toHaveAttribute('data-hair','fitted-short-hair');
 await page.locator('[data-scanner-toggle]').click();await expect(root).toHaveAttribute('data-scanner','pinned');await page.keyboard.press('Escape');await expect(root).toHaveAttribute('data-scanner','closed');await page.locator('[data-enter]').click();await expect(root).toHaveAttribute('data-scene','d2l-world');await expect(root).toHaveAttribute('data-hair','fitted-short-hair');
});
test('cap load failure retains the original hair fallback and working project access',async({page})=>{
 await page.route('**/studio-cap-fit.glb',r=>r.fulfill({status:503,body:'Test accessory failure'}));await page.goto(route);const root=page.locator('[data-tme]');await expect(root).toHaveAttribute('data-ready','true',{timeout:45000});await expect(root).toHaveAttribute('data-headwear','unavailable');await page.getByRole('button',{name:'Chapter index',exact:true}).click();await page.getByRole('link',{name:'02 / Clarity',exact:true}).click();await expect(root).toHaveAttribute('data-scene','d2l-world');
});
