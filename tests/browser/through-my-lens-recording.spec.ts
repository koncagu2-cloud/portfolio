import {writeFile} from 'node:fs/promises';
import {test,expect} from '@playwright/test';
const route='/experiments/through-my-lens/';
test.use({video:{mode:'on',size:{width:1440,height:1000}}});
 test('capture the native scroll narrative and local performance observations',async({page},testInfo)=>{
  test.setTimeout(60000);
  await page.goto(route);const root=page.locator('[data-lens-experience]');await expect(root).toHaveAttribute('data-enhanced','true');
  await page.waitForTimeout(250);
  const observations=await page.evaluate(()=>({viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},navigation:performance.getEntriesByType('navigation').map(e=>({duration:e.duration,domContentLoaded:(e as PerformanceNavigationTiming).domContentLoadedEventEnd})),resources:performance.getEntriesByType('resource').filter(e=>/three\.|through-my-lens|file-review|lens/.test(e.name)).map(e=>({name:e.name.split('/').slice(-2).join('/'),durationMs:Math.round(e.duration),transferBytes:(e as PerformanceResourceTiming).transferSize})),renderCount:document.querySelector('[data-lens-experience]')?.getAttribute('data-render-count'),triangles:document.querySelector('[data-lens-experience]')?.getAttribute('data-triangles'),drawCalls:document.querySelector('[data-lens-experience]')?.getAttribute('data-draw-calls')}));
  await writeFile(testInfo.outputPath('local-performance.json'),JSON.stringify(observations,null,2));
  await testInfo.attach('local-performance.json',{path:testInfo.outputPath('local-performance.json'),contentType:'application/json'});
  const entryDistance=await page.locator('#projects').evaluate(el=>el.getBoundingClientRect().top+scrollY);
  for(let i=0;i<40;i++){await page.mouse.wheel(0,entryDistance/40);await page.waitForTimeout(45);}
  await page.waitForTimeout(250);
  const exitY=await page.locator('.d2l-exit').evaluate(el=>el.getBoundingClientRect().top+scrollY+180);
  const remaining=exitY-await page.evaluate(()=>scrollY);
  for(let i=0;i<40;i++){await page.mouse.wheel(0,remaining/40);await page.waitForTimeout(45);}
  await expect(root).toHaveAttribute('data-phase','return');await page.waitForTimeout(350);

 });
