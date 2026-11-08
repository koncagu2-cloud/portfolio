import {test,expect} from '@playwright/test';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const route='/experiments/through-my-eyes-live/';
const output=process.env.TME_OUTPUT ? process.env.TME_OUTPUT+'/tme-perf' : '/Users/suleymankoncagul/Documents/ChatGPT/Apple portfolio Piece/Through My Eyes Experience/real-browser-test';
test('development overlay hidden by default, toggle, renderer, full density and partial export',async({page})=>{
 await mkdir(output,{recursive:true});await page.goto(route);await expect(page.locator('[data-tme]')).toHaveAttribute('data-presented','true');await expect(page.locator('#tme-performance')).toBeHidden();
 await page.keyboard.press('Alt+KeyP');await expect(page.locator('#tme-performance')).toBeVisible();await expect(page.locator('[data-renderer]')).not.toContainText('Waiting');await page.waitForTimeout(600);await page.screenshot({path:output+'/overlay.png'});
 await page.locator('#tme-performance [data-quality]').selectOption('full');await expect(page.locator('[data-tme]')).toHaveAttribute('data-quality','1');
 const download=page.waitForEvent('download');await page.locator('[data-export]').click();const file=await download;await file.saveAs(output+'/partial-export.json');const json=JSON.parse(await readFile(output+'/partial-export.json','utf8'));expect(json.complete).toBe(false);expect(json.qualityMode).toBe('full');expect(json.renderer.classification).toMatch(/software|hardware|unknown/);expect(json.manualAccelerationVerification).toBe('not-verified');
 await page.locator('[data-close]').click();await expect(page.locator('#tme-performance')).toBeHidden();await page.getByRole('button',{name:'Performance',exact:true}).click();await expect(page.locator('#tme-performance')).toBeVisible();
});
test('three-round guided protocol and stage export using a synthetic clock, not performance evidence',async({page})=>{
 await page.goto(route+'?perf=1');await expect(page.locator('[data-tme]')).toHaveAttribute('data-presented','true');await expect(page.locator('#tme-performance')).toBeVisible();
 await page.clock.install();await page.locator('[data-start]').click();
 for(let round=1;round<=3;round++){
  await expect(page.locator('[data-instruction]')).toContainText(`Round ${round}/3`);await page.clock.fastForward(15010);await expect(page.locator('[data-instruction]')).toContainText('Move the mouse');await page.clock.fastForward(15010);await expect(page.locator('[data-instruction]')).toContainText('Choose Enter through the lens');
  if(round===1)await page.keyboard.press('Alt+KeyP');
  await page.getByRole('link',{name:'Enter through the lens',exact:false}).click();await page.clock.fastForward(3100);await page.clock.runFor(80);await expect(page.locator('[data-instruction]')).toContainText('Complete the sample');
  if(round>1)await page.getByRole('button',{name:'Try another selection'}).click();
  await page.getByRole('radio',{name:'Assignment-01.pdf PDF document · Final draft'}).check();await page.getByRole('button',{name:'Review selected file'}).click();await page.getByRole('button',{name:'Submit demo'}).click();await expect(page.locator('[data-instruction]')).toContainText('Submission complete');
  await page.getByRole('link',{name:'Return to the character',exact:false}).click();await page.clock.fastForward(2300);await page.clock.runFor(80);
 }
 await expect(page.locator('[data-instruction]')).toContainText('Three rounds complete');await page.keyboard.press('Alt+KeyP');await page.screenshot({path:output+'/completed-protocol-TEST-ONLY.png'});
 const waiting=page.waitForEvent('download');await page.locator('[data-export]').click();const download=await waiting;const file=await download.path();const data=JSON.parse(await readFile(file!,'utf8'));expect(data.complete).toBe(true);expect(data.protocolValid).toBe(true);expect(data.stages).toHaveLength(15);expect(data.stages.filter((s:{stage:string})=>s.stage==='d2l')).toHaveLength(3);data.TEST_ONLY_SYNTHETIC_CLOCK=true;await writeFile(output+'/protocol-TEST-ONLY.json',JSON.stringify(data,null,2));
});
test('full device DPR comparison is distinct from capped adaptive mode',async({browser})=>{
 const context=await browser.newContext({baseURL:test.info().project.use.baseURL,viewport:{width:375,height:812},deviceScaleFactor:2});const page=await context.newPage();await page.goto(route+'?perf=1');const root=page.locator('[data-tme]');await expect(root).toHaveAttribute('data-presented','true');await page.locator('#tme-performance [data-quality]').selectOption('full');await expect(root).toHaveAttribute('data-effective-dpr','2.00');await page.locator('#tme-performance [data-quality]').selectOption('adaptive');await expect(root).toHaveAttribute('data-effective-dpr','1.25');await context.close();
});
