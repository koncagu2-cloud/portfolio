import {test,expect} from '@playwright/test';

test('right earcup control and accessible soundtrack button share real playback state',async({page})=>{
 await page.goto('/experiments/through-my-eyes-live/');
 const experience=page.locator('[data-tme]');
 const audio=page.locator('[data-soundtrack]');
 const button=page.getByRole('button',{name:'Play portfolio soundtrack'});
 await expect(experience).toHaveAttribute('data-neckwear','premium-3d-headphones');
 await expect(experience).toHaveAttribute('data-headphone-control','ready');
 await expect(experience).toHaveAttribute('data-headphone-control-x',/\d+/);
 await expect(experience).toHaveAttribute('data-headphone-control-y',/\d+/);
 await expect(button).toBeVisible();
 await expect(audio).toHaveAttribute('preload','none');
 await expect(audio).toHaveJSProperty('paused',true);
 await expect(button).toHaveAttribute('aria-pressed','false');
 expect(await audio.getAttribute('src')).toMatch(/^\/audio\/through-my-eyes-loop\.wav$/);

 const stage=page.locator('[data-stage]');
 const bounds=await stage.boundingBox();
 const x=Number(await experience.getAttribute('data-headphone-control-x'));
 const y=Number(await experience.getAttribute('data-headphone-control-y'));
 expect(bounds).not.toBeNull();
 await page.mouse.move(bounds!.x+x,bounds!.y+y);
 await page.waitForTimeout(120);
 await expect(experience).toHaveAttribute('data-headphone-hovered','true');
 expect(await stage.evaluate(element=>getComputedStyle(element).cursor)).toBe('pointer');
 await page.mouse.click(bounds!.x+x,bounds!.y+y);
 await expect.poll(()=>audio.evaluate((element:HTMLAudioElement)=>element.paused)).toBe(false);
 await expect(page.getByRole('button',{name:'Pause portfolio soundtrack'})).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('[data-soundtrack-status]')).toHaveText('Portfolio soundtrack playing.');

 const routeBeforeScanner=new URL(page.url());
 await page.getByRole('button',{name:/Scan perspectives/}).click();
 await expect(page.getByRole('heading',{name:'Perspective Scanner'})).toBeVisible();
 await expect(page.locator('[data-hero-project="d2l-world"]')).toHaveAttribute('aria-pressed','true');
 await expect(audio).toHaveJSProperty('paused',false);
 await page.locator('[data-hero-project="chapter-ring"]').click();
 await expect(page.locator('[data-hero-project="chapter-ring"]')).toHaveAttribute('aria-pressed','true');
 await expect(audio).toHaveJSProperty('paused',false);
 expect(new URL(page.url()).pathname).toBe(routeBeforeScanner.pathname);
});
