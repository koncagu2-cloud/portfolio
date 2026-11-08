import{test,expect}from'@playwright/test';
import AxeBuilder from'@axe-core/playwright';
test('homepage reading text remains usable in both themes across phone, tablet and desktop',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of[320,375,768,1024,1440]){await page.setViewportSize({width,height:1000});await page.goto('/');
 for(const theme of['light','dark']){await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const sizes=await page.locator('.hero-bottom p,.feature-story>p,.feature-contribution dd,.about-introduction>p,.contact-bottom>p').evaluateAll(els=>els.map(el=>parseFloat(getComputedStyle(el).fontSize)));expect(sizes.every(n=>n>=16)).toBe(true);
 await expect(page.locator('.homepage')).toHaveAttribute('data-text-motion','reduced');
 }
 }
 await page.setViewportSize({width:375,height:812});await page.goto('/');const a=await new AxeBuilder({page}).include('.homepage').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(a.violations).toEqual([]);
});
test('text reveals play once, keep semantic HTML and stop immediately for reduced motion',async({page})=>{
 await page.goto('/');await expect(page.locator('.homepage')).toHaveAttribute('data-text-motion','enabled');
 const p=page.locator('#contact .contact-bottom>p');await p.scrollIntoViewIfNeeded();await expect(p).toBeVisible();await expect(p).toHaveAttribute('data-home-reveal','');
 await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('.homepage')).toHaveAttribute('data-text-motion','reduced');expect(await p.evaluate(e=>e.getAnimations().length)).toBe(0);expect(await p.evaluate(e=>getComputedStyle(e).opacity)).toBe('1');
 await page.getByRole('link',{name:'Back to top',exact:false}).click();await expect(page.locator('#hero-heading')).toBeInViewport();await page.getByRole('link',{name:'Selected work',exact:false}).focus();expect(await page.getByRole('link',{name:'Selected work',exact:false}).evaluate(e=>parseFloat(getComputedStyle(e).outlineWidth))).toBeGreaterThanOrEqual(3);
});
test('homepage text stays available without JavaScript and at enlarged text size',async({browser,page})=>{
 const c=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:812}});const p=await c.newPage();await p.goto('/');await expect(p.locator('#hero-heading')).toBeVisible();await p.locator('#contact').scrollIntoViewIfNeeded();await expect(p.locator('#contact-heading')).toBeVisible();await c.close();
 await page.setViewportSize({width:375,height:812});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.addStyleTag({content:'html{font-size:200%}'});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.locator('#contact').scrollIntoViewIfNeeded();await expect(page.locator('#contact-heading')).toBeVisible();
});
