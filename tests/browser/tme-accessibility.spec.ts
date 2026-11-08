import{test,expect}from'@playwright/test';import AxeBuilder from'@axe-core/playwright';
const route='/experiments/through-my-eyes-live/';
test('readable scene typography and caption contrast on desktop and mobile',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of[375,1440]){await page.setViewportSize({width,height:width===375?812:1000});for(const id of['d2l-world','chapter-ring','chapter-community','chapter-align','beyond-the-screen']){await page.goto(route+'?a11y='+width+id+'#'+id);await expect(page.locator('[data-tme]')).toHaveAttribute('data-scene',id);
  const small=await page.locator('#'+id).evaluate(e=>[...e.querySelectorAll('p,figcaption,small,button,a')].filter(n=>n.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})&&!n.closest('[hidden],.sr-only')).filter(n=>parseFloat(getComputedStyle(n).fontSize)<16).map(n=>n.textContent?.slice(0,60)));expect(small).toEqual([]);
  const results=await new AxeBuilder({page}).include('[data-tme]').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(results.violations).toEqual([]);
 }}
});
test('200 percent text scaling keeps hero, scanner and chapter controls reachable without horizontal overflow',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:375,height:812});await page.goto(route+'#perspective');await page.evaluate(()=>document.documentElement.style.fontSize='200%');
 const launcher=page.locator('[data-scanner-toggle]');await launcher.focus();await page.keyboard.press('Enter');await expect(page.locator('[data-tme]')).toHaveAttribute('data-scanner','pinned');await expect(page.locator('.tme-type')).toHaveAttribute('inert','');
 const last=page.locator('[data-hero-preview=d2l-world] .tme-scanner-direct');await last.scrollIntoViewIfNeeded();await expect(last).toBeInViewport();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.keyboard.press('Escape');await expect(launcher).toBeFocused();await expect(launcher).toBeInViewport();await page.getByRole('button',{name:'Chapter index',exact:true}).focus();await page.keyboard.press('Enter');await expect(page.locator('.tme-scene-index[open]')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Chapter index',exact:true})).toBeFocused();
});
test('recordings offer a larger view and captions retain focus visibility',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(route);await page.locator('[data-scanner-toggle]').click();await page.locator('[data-hero-preview=d2l-world] .tme-supporting-recording>summary').click();const large=page.locator('[data-hero-preview=d2l-world]').getByRole('link',{name:'View larger recording',exact:false});await expect(large).toHaveAttribute('href',/d2l-prototype.mp4$/);await expect(large).toHaveAttribute('target','_blank');await large.focus();expect(await large.evaluate(e=>parseFloat(getComputedStyle(e).outlineWidth))).toBeGreaterThanOrEqual(3);
});
test('closing scene uses the real portrait, contact links and a quiet Michigan clock',async({page})=>{
 await page.clock.install({time:new Date('2026-11-04T09:15:00Z')});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/experiments/through-my-eyes-live/#beyond-the-screen');
 const scene=page.locator('.tme-ending-scene'),clock=scene.locator('[data-michigan-time]');await expect(clock).toHaveText('4:15 AM EST');await page.clock.runFor(60_000);await expect(clock).toHaveText('4:16 AM EST');await expect(clock).not.toHaveAttribute('aria-live');
 await expect(scene.locator('img')).toHaveJSProperty('complete',true);await expect(scene.getByRole('link',{name:'Email me',exact:false})).toHaveAttribute('href','mailto:koncagusuleyman@gmail.com');const resume=scene.getByRole('link',{name:'View résumé',exact:false});await expect(resume).toHaveAttribute('href','/resume/suleyman-koncagul-resume.pdf');expect((await page.request.get('/resume/suleyman-koncagul-resume.pdf')).ok()).toBe(true);
 await scene.getByRole('link',{name:'Email me',exact:false}).focus();await expect(scene.getByRole('link',{name:'Email me',exact:false})).toBeFocused();
 await page.setViewportSize({width:375,height:812});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await resume.scrollIntoViewIfNeeded();await expect(resume).toBeInViewport();
});

test('expanded text and WCAG text spacing reflow in every chapter without losing project actions',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of[320,375,768,1280,1440])for(const id of['d2l-world','chapter-ring','chapter-community','chapter-align']){
  await page.setViewportSize({width,height:width===1280?720:812});await page.goto(route+'?type='+width+id+'#'+id);
  await page.addStyleTag({content:'html{font-size:200%!important}.tme :is(p,a,button,summary,h1,h2,h3,h4,label,li,dd,dt,figcaption){line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}.tme p{margin-bottom:2em!important}'});
  const scene=page.locator('#'+id),action=scene.locator('.tme-opening-actions').getByRole('link',{name:'Try the prototype',exact:false});await action.focus();await expect(action).toBeInViewport();await expect(action).toBeFocused();
  expect(await scene.evaluate(e=>e.scrollWidth-e.clientWidth)).toBeLessThan(2);expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThan(2);
  const detail=scene.locator('.tme-opening-detail summary');await detail.click();await expect(scene.locator('.tme-opening-detail')).toHaveAttribute('open','');await expect(scene.locator('.tme-opening-role')).toBeVisible();
 }
});

test('case-study reader applies isolated readable styles, preserves themes and exposes keyboard exit',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:375,height:812});
 for(const id of['d2l-world','chapter-ring','chapter-community','chapter-align']){
  await page.goto(route+'#'+id);await page.locator('#'+id+' .tme-opening-actions [data-reader=case]').click();const reader=page.locator('.tme-project-reader');await expect(reader).toHaveAttribute('data-state','ready');
  const frame=page.frameLocator('.tme-project-reader iframe');await expect(frame.locator('style[data-tme-reading]')).toBeAttached();
  const metrics=await frame.locator('main').evaluate(e=>({body:parseFloat(getComputedStyle(e.querySelector('p:not(.micro)')!).fontSize),width:e.ownerDocument.documentElement.scrollWidth,viewport:e.ownerDocument.documentElement.clientWidth}));expect(metrics.body).toBeGreaterThanOrEqual(16);expect(metrics.width).toBeLessThanOrEqual(metrics.viewport+1);
  await frame.locator('[data-theme-toggle]').click();await expect(frame.locator('html')).toHaveAttribute('data-theme','dark');await frame.locator('[data-theme-toggle]').click();await expect(frame.locator('html')).toHaveAttribute('data-theme','light');
  const result=await new AxeBuilder({page}).include('.tme-project-reader').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(result.violations).toEqual([]);
  await frame.locator('html').evaluate(e=>{(e as HTMLElement).style.fontSize='200%';const style=e.ownerDocument.createElement('style');style.textContent='main :is(p,a,button,summary,li,dd,dt,figcaption){line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}main p{margin-bottom:2em!important}';e.ownerDocument.head.append(style);});
  expect(await frame.locator('html').evaluate(e=>e.scrollWidth-e.clientWidth)).toBeLessThan(2);
  await frame.locator('main a').first().focus();await page.keyboard.press('Escape');await expect(reader).not.toBeVisible();await expect(page.locator('#'+id+' .tme-opening-actions [data-reader=case]')).toBeFocused();
 }
 // The standalone approved case study has no experiment-only reader stylesheet.
 await page.goto('/work/community-spaces/');await expect(page.locator('style[data-tme-reading]')).toHaveCount(0);
});

test('hero supporting type scales with wide scenes while entry actions remain in the initial view',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const [width,height]of[[320,812],[375,812],[768,1000],[1280,720],[1440,1000],[1920,1080],[2560,1440]]){
  await page.setViewportSize({width,height});await page.goto(route+'?heroType='+width);const copy=page.locator('.tme-type');
  const size=await copy.locator('.tme-intro').evaluate(e=>parseFloat(getComputedStyle(e).fontSize));expect(size).toBeGreaterThanOrEqual(width>=1101?22:18);
  await expect(copy.locator('[data-scanner-toggle]')).toBeInViewport();await expect(copy.locator('[data-enter]')).toBeInViewport();
  const action=await copy.locator('[data-enter]').boundingBox(),nav=await page.locator('.tme-scene-nav').boundingBox();expect(action!.y+action!.height).toBeLessThanOrEqual(nav!.y+1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThan(2);
 }
});
