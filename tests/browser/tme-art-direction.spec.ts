import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const output=process.env.TME_OUTPUT ? process.env.TME_OUTPUT+'/tme-art-direction' : '/Users/suleymankoncagul/Documents/ChatGPT/Apple portfolio Piece/Through My Eyes Experience/visual-polish';
const route='/experiments/through-my-eyes-live/';
const settle=async(page:any)=>page.evaluate(()=>Promise.all(document.getAnimations().filter(a=>a.playState==='running'&&a.effect?.getComputedTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{}))));
test('art-direction walkthrough with pointer and keyboard previews; record',async({page})=>{
 await mkdir(output+'/screenshots',{recursive:true});await page.goto(route);await expect(page.locator('[data-tme]')).toHaveAttribute('data-presented','true');await page.waitForTimeout(700);await page.screenshot({path:output+'/screenshots/hero-desktop.png'});
 await page.mouse.move(1050,350);await page.waitForTimeout(800);await page.screenshot({path:output+'/screenshots/character-attention.png'});
 await page.getByRole('link',{name:'All perspectives',exact:true}).click();await settle(page);await page.locator('#project-selection').screenshot({path:output+'/screenshots/selection-d2l.png'});
 await page.locator('[data-project-preview=chapter-ring]').hover();await settle(page);await expect(page.locator('[data-selection-visual=chapter-ring]')).toBeVisible();await page.locator('#project-selection').screenshot({path:output+'/screenshots/selection-ring.png'});await page.waitForTimeout(600);
 await page.locator('[data-project-preview=chapter-align] .tme-project-quicklinks [data-chapter-link]').focus();await settle(page);await expect(page.locator('[data-selection-visual=chapter-align]')).toBeVisible();await page.locator('#project-selection').screenshot({path:output+'/screenshots/selection-align.png'});
 for(const [id,title] of [['chapter-ring','Apple Ring'],['chapter-community','Community Spaces'],['chapter-align','ALIGN']]){
  await page.locator(`[data-project-preview=${id}] .tme-project-quicklinks [data-chapter-link]`).click();await settle(page);await page.screenshot({path:output+`/screenshots/${id}-opening.png`});await page.locator('#'+id).screenshot({path:output+`/screenshots/${id}.png`});await page.waitForTimeout(500);await page.locator('.tme-nav [data-selection]').click();await settle(page);
 }
});
test('responsive action spacing, touch composition and reduced-motion entrances',async({page})=>{
 for(const [width,height] of [[1440,900],[1024,768],[768,900],[375,812],[320,740]]){
  await page.setViewportSize({width,height});await page.goto(route);await expect(page.locator('[data-tme]')).toHaveAttribute('data-presented','true');expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  const enter=await page.locator('.tme-enter').boundingBox(),utility=await page.locator('.tme-utilities').boundingBox();expect(enter!.y+enter!.height).toBeLessThan(utility!.y);
  await page.screenshot({path:output+`/screenshots/hero-${width}.png`});await page.getByRole('link',{name:'All perspectives',exact:true}).click();await settle(page);if(width===375)await page.locator('#project-selection').screenshot({path:output+'/screenshots/selection-mobile.png'});
  if(width===375){for(const id of ['chapter-ring','chapter-community','chapter-align']){await page.locator(`.tme-project-index .tme-project-quicklinks a[href="#${id}"]`).click();await settle(page);await page.locator('#'+id).screenshot({path:output+`/screenshots/mobile-${id}.png`});await page.locator('.tme-nav [data-selection]').click();await settle(page);}}
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(route);await expect(page.locator('[data-tme]')).toHaveAttribute('data-presented','true');await page.getByRole('link',{name:'All perspectives',exact:true}).click();await page.locator('[data-project-preview=chapter-ring] .tme-project-quicklinks [data-chapter-link]').focus();expect(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length)).toBe(0);await page.locator('[data-project-preview=chapter-ring] .tme-project-quicklinks [data-chapter-link]').click();await expect(page.locator('#chapter-ring')).toBeFocused();expect(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length)).toBe(0);
});
