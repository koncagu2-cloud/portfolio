import {test,expect as baseExpect} from '@playwright/test';
const expect=baseExpect.configure({timeout:15000});
import AxeBuilder from '@axe-core/playwright';
const route='/experiments/through-my-eyes/';
test.setTimeout(60000);

test('character placeholder is disclosed and its pause/reduced-motion controls work by keyboard',async({page})=>{
 await page.goto(route);const root=page.locator('[data-eyes-experience]');await expect(root).toHaveAttribute('data-character','non-likeness-placeholder');
 await expect(page.getByRole('complementary',{name:'Character production status'})).toContainText('not a finished representation of Suleyman');
 await page.getByRole('button',{name:'Pause character',exact:true}).focus();await page.keyboard.press('Space');await expect(page.getByRole('button',{name:'Character paused',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.waitForTimeout(150);const count=await root.getAttribute('data-render-count');await page.waitForTimeout(200);expect(await root.getAttribute('data-render-count')).toBe(count);
 await page.getByRole('button',{name:'Reduce motion',exact:true}).press('Enter');await expect(root).toHaveAttribute('data-motion','reduced');await expect(page.locator('.eyes-world')).toHaveAttribute('data-pinned','false');
 await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex, nofollow');
});

test('head makes eye contact, glasses stay attached, and camera stops before the eye at the match',async({page})=>{
 await page.goto(route);const root=page.locator('[data-eyes-experience]');await expect(root).toHaveAttribute('data-character','non-likeness-placeholder');await page.getByRole('button',{name:'Pause character',exact:true}).click();
 const separation=Number(await root.getAttribute('data-lens-eye-separation'));
 const distance=await page.locator('#eyes-project').evaluate(el=>el.getBoundingClientRect().top+scrollY);
 await page.mouse.wheel(0,distance*.3);await expect(root).toHaveAttribute('data-phase','eye-contact');expect(Math.abs(Number(await root.getAttribute('data-head-yaw')))).toBeLessThan(.005);
 expect(Math.abs(Number(await root.getAttribute('data-lens-eye-separation'))-separation)).toBeLessThan(.002);
 await page.mouse.wheel(0,distance*.25);await expect(root).toHaveAttribute('data-phase','close-up');
 await page.mouse.wheel(0,distance*.2);await expect(root).toHaveAttribute('data-phase','eye-match');
 expect(Number(await root.getAttribute('data-camera-z'))).toBeGreaterThan(Number(await root.getAttribute('data-eye-z'))+.15);await expect(page.locator('.eyes-world')).toHaveCSS('clip-path','none');
 await page.goto(route);await page.getByRole('link',{name:'View D2L',exact:false}).click();await expect(page.locator('.eyes-world')).toHaveAttribute('data-pinned','false');await expect(page.getByRole('heading',{name:'Which file will count?',exact:true})).toBeInViewport();
});

test('skip and existing case/prototype paths remain native and truthful',async({page})=>{
 await page.goto(route);await page.getByRole('link',{name:'Skip introduction',exact:true}).click();await expect(page.locator('#eyes-project')).toBeInViewport();
 await expect(page.locator('#eyes-project')).toContainText('Usability improvements remain unvalidated');await expect(page.locator('#eyes-project')).toContainText('academic project team');
 await expect(page.getByRole('link',{name:/Open D2L prototype/})).toHaveAttribute('href',/^https:\/\/www\.figma\.com\/proto\//);
 await page.getByRole('link',{name:'Read the D2L case study ↗',exact:true}).click();await expect(page).toHaveURL(/\/work\/d2l-redesign\/$/);
 await page.goto(route);await page.getByRole('link',{name:'Glasses study ↗',exact:true}).click();await expect(page).toHaveURL(/\/experiments\/through-my-lens\/$/);
});

test('responsive and reduced-motion reading remains accessible across five viewport widths',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(route);await expect(page.locator('[data-eyes-experience]')).toHaveAttribute('data-motion','reduced');
 for(const width of [320,375,768,1024,1440]){
  await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await expect(page.getByRole('button',{name:'Character paused',exact:true})).toBeDisabled();
 }
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
 await page.goto(route+'#eyes-project');expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
});

test('runtime failure uses the original reference photo and exposes readable project content',async({page})=>{
 await page.route('**/vendor/three.module.js',route=>route.abort());await page.goto(route);
 await expect(page.locator('[data-character-status]')).toContainText('3D unavailable');await expect(page.locator('.eyes-reference img')).toBeVisible();await expect(page.getByRole('complementary',{name:'Character production status'})).not.toBeVisible();
 await page.getByRole('link',{name:'Skip introduction',exact:true}).click();await expect(page.getByRole('heading',{name:'Which file will count?',exact:true})).toBeInViewport();
});

test('no-JavaScript and emulated touch visitors can reach the work without animation',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,hasTouch:true,isMobile:true,viewport:{width:375,height:900}});const page=await context.newPage();await page.goto('http://127.0.0.1:4322'+route);
 await expect(page.locator('.eyes-reference img')).toBeVisible();await page.getByRole('link',{name:'View D2L',exact:false}).tap();await expect(page.locator('#eyes-project')).toBeInViewport();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await context.close();
});

test('touch pause and vertical swipe leave the native scroll journey usable',async({browser})=>{
 const context=await browser.newContext({hasTouch:true,isMobile:true,viewport:{width:375,height:900}});const page=await context.newPage();await page.goto('http://127.0.0.1:4322'+route);
 const root=page.locator('[data-eyes-experience]');await expect(root).toHaveAttribute('data-character','non-likeness-placeholder');await page.getByRole('button',{name:'Pause character',exact:true}).tap();await expect(page.getByRole('button',{name:'Character paused',exact:true})).toHaveAttribute('aria-pressed','true');
 const cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:610}]});
 for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y:610-i*35}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(100);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await context.close();
});
