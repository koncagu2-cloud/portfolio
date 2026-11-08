import {test,expect as baseExpect} from '@playwright/test';
const expect=baseExpect.configure({timeout:15000});
import {writeFile} from 'node:fs/promises';
test.use({video:{mode:'on',size:{width:1440,height:1000}}});
test('record the character/eye match study and local renderer observations',async({page},testInfo)=>{
 test.setTimeout(60000);await page.goto('/experiments/through-my-eyes/');const root=page.locator('[data-eyes-experience]');await expect(root).toHaveAttribute('data-character','non-likeness-placeholder');
 await page.waitForTimeout(3800);
 const observations=await page.evaluate(()=>({viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},navigation:performance.getEntriesByType('navigation').map(e=>({domContentLoaded:(e as PerformanceNavigationTiming).domContentLoadedEventEnd})),resources:performance.getEntriesByType('resource').filter(e=>/three\.|through-my-eyes|file-review/.test(e.name)).map(e=>({name:e.name.split('/').slice(-2).join('/'),durationMs:Math.round(e.duration),transferBytes:(e as PerformanceResourceTiming).transferSize})),triangles:document.querySelector('[data-eyes-experience]')?.getAttribute('data-triangles'),drawCalls:document.querySelector('[data-eyes-experience]')?.getAttribute('data-draw-calls'),character:document.querySelector('[data-eyes-experience]')?.getAttribute('data-character')}));
 await writeFile(testInfo.outputPath('eyes-performance.json'),JSON.stringify(observations,null,2));await testInfo.attach('eyes-performance.json',{path:testInfo.outputPath('eyes-performance.json'),contentType:'application/json'});
 const distance=await page.locator('#eyes-project').evaluate(el=>el.getBoundingClientRect().top+scrollY);
 for(let i=0;i<50;i++){await page.mouse.wheel(0,distance/50);await page.waitForTimeout(50);}await expect(root).toHaveAttribute('data-phase','clarity');await page.waitForTimeout(400);
});
