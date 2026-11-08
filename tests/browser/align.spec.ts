import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('ALIGN has an attributed case study and explicit historical/simulated evidence',async({page})=>{
 await page.goto('/work/align/');
 await expect(page.getByRole('heading',{level:1})).toHaveText('ALIGN');
 await expect(page.locator('.case-role')).toContainText('AI-assisted');
 await expect(page.locator('.align-hero figcaption')).toContainText('Historical design artifact');
 await expect(page.locator('#premise')).toContainText('synthetic exploration');
 await expect(page.locator('#iterations')).toContainText('no independent participants');
 await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex, nofollow');
 for(const link of await page.getByRole('navigation',{name:'Case study sections'}).getByRole('link').all()){
  await link.focus();await page.keyboard.press('Enter');
  await expect(page.locator((await link.getAttribute('href'))!)).toBeInViewport();
 }
 await page.locator('.align-alternative').first().locator('summary').press('Enter');
 await expect(page.locator('.align-alternative').first()).toHaveAttribute('open','');
});

test('ALIGN case reflows across five widths and both themes without distorting images',async({page})=>{
 await page.goto('/work/align/');await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [320,375,768,1024,1440]){
  await page.setViewportSize({width,height:1000});
  for(const dark of [false,true]){
   const toggle=page.getByRole('button',{name:'Dark mode',exact:true});if(await toggle.getAttribute('aria-pressed')!==String(dark))await toggle.click();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
   expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
  }
 }
 for(const img of await page.locator('main img:visible').all()){
  await img.scrollIntoViewIfNeeded();await expect(img).toHaveJSProperty('complete',true);
  expect(await img.evaluate((el:HTMLImageElement)=>el.naturalWidth>0&&Math.abs(el.clientWidth/el.clientHeight-el.naturalWidth/el.naturalHeight)<.02)).toBe(true);
 }
});

test('ALIGN demo supports saving and simulated confirmation, resets on reload, and returns to its case',async({page})=>{
 await page.goto('/work/align/');await page.getByRole('link',{name:'Explore the ALIGN prototype',exact:true}).click();
 const frame=page.frameLocator('iframe');await expect(frame.getByRole('heading',{name:'Discover',exact:true})).toBeVisible();
 await expect(frame.locator('.demo-strip')).toContainText('resets on reload');
 await frame.getByRole('link',{name:'View details',exact:true}).click();
 await frame.getByRole('button',{name:'Save role',exact:true}).click();
 await frame.getByRole('link',{name:'Review demo application',exact:true}).click();
 await expect(frame.getByRole('heading',{name:'Review demo application',exact:true})).toBeVisible();
 await frame.locator('#acknowledged').check();
 await frame.getByRole('button',{name:'Save demo in this browser',exact:true}).click();
 await expect(frame.locator('main')).toContainText('Employer delivery');
 await expect(frame.locator('main')).toContainText('Not sent');
 await page.reload();await expect(frame.getByRole('heading',{name:'Discover',exact:true})).toBeVisible();
 await page.getByRole('navigation',{name:'Portfolio context'}).getByRole('link',{name:'Back to ALIGN case study'}).click();
 await expect(page).toHaveURL(/\/work\/align\/$/);
});
