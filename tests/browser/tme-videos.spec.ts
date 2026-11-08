import{test,expect}from'@playwright/test';
import AxeBuilder from'@axe-core/playwright';
const route='/experiments/through-my-eyes-live/';
const player=(page:any,id='d2l-world')=>page.locator(`[data-hero-preview="${id}"]`);
async function open(page:any){await page.emulateMedia({reducedMotion:'reduce'});await page.goto(route);await page.locator('[data-scanner-toggle]').click();}
test('curated scanner previews load no recordings before explicit disclosure',async({page})=>{
 const requests:string[]=[];page.on('request',r=>{if(r.url().endsWith('.mp4'))requests.push(r.url());});await open(page);
 for(const id of['d2l-world','chapter-ring','chapter-community','chapter-align']){await page.locator(`[data-hero-project="${id}"]`).click();await expect(player(page,id).locator('.tme-curated-art')).toBeVisible();await expect(player(page,id).locator('video')).not.toHaveAttribute('src');}expect(requests).toEqual([]);
});
for(const id of['d2l-world','chapter-ring','chapter-community','chapter-align'])test(`${id} disclosed recording plays actual frames, pauses on close and preserves prototype access`,async({page})=>{
 await open(page);await page.locator(`[data-hero-project="${id}"]`).click();const host=player(page,id),video=host.locator('video');await host.locator('.tme-supporting-recording>summary').click();await expect(video).not.toHaveAttribute('src');await host.locator('[data-video-play]').click();await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.2);
 expect(await video.evaluate((v:HTMLVideoElement)=>v.muted&&v.loop&&v.playsInline&&!v.controls&&v.videoWidth>600)).toBe(true);await host.locator('[data-video-play]').click();await expect(video).toHaveJSProperty('paused',true);await host.locator('[data-video-play]').click();await expect(video).toHaveJSProperty('paused',false);await host.locator('.tme-supporting-recording>summary').click();await expect(video).toHaveJSProperty('paused',true);await expect(host.locator('.tme-curated-art')).toBeVisible();await host.locator('.tme-supporting-recording>summary').click();await expect(host.getByRole('link',{name:/Try (original Figma|coded prototype)/})).toBeVisible();await page.keyboard.press('Escape');await expect(video).toHaveJSProperty('paused',true);
});
test('disclosed automatic recording handles denied autoplay and selection pause/resume',async({page})=>{
 await page.addInitScript(()=>{const play=HTMLMediaElement.prototype.play;let deny=true;HTMLMediaElement.prototype.play=function(){if(deny){deny=false;return Promise.reject(new DOMException('Test policy','NotAllowedError'));}return play.call(this);};});await page.goto(route);await page.locator('[data-opening-skip]').click();await page.locator('[data-scanner-toggle]').click();const host=player(page),video=host.locator('video');await host.locator('.tme-supporting-recording>summary').click();await expect(host.locator('[data-video-status]')).toContainText('Autoplay is unavailable');await host.locator('[data-video-play]').click();await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.2);await page.locator('[data-hero-project="chapter-ring"]').click();await expect(video).toHaveJSProperty('paused',true);const saved=await video.evaluate((v:HTMLVideoElement)=>v.currentTime);await expect(player(page,'chapter-ring').locator('video')).not.toHaveAttribute('src');await page.locator('[data-hero-project="d2l-world"]').click();await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(saved);
});
test('mobile keyboard playback, failure fallback and description remain accessible',async({page})=>{
 await page.setViewportSize({width:375,height:812});await page.route('**/d2l-prototype.mp4',r=>r.fulfill({status:503,body:'Test failure'}));await open(page);const host=player(page);await host.locator('.tme-supporting-recording>summary').focus();await page.keyboard.press('Enter');await host.locator('[data-video-play]').focus();await page.keyboard.press('Enter');await expect(host.locator('[data-video-status]')).toContainText('could not play');await expect(host.locator('.tme-scanner-image>img')).toBeVisible();await expect(host.locator('.tme-curated-art')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);const results=await new AxeBuilder({page}).include('#hero-projects').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(results.violations).toEqual([]);
});
test('D2L chapter reuses the recording, pauses for readers and chapter exits, and retains its frame',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(route+'#d2l-world');
 const host=page.locator('[data-chapter-video="d2l-world"]'),video=host.locator('video'),image=host.locator('.tme-chapter-video-image');
 await expect(video).not.toHaveAttribute('src');const before=await image.boundingBox();
 await host.locator('[data-video-play]').focus();await page.keyboard.press('Enter');await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.15);
 expect(await image.boundingBox()).toEqual(before);await expect(video).toHaveAttribute('src',/d2l-prototype.mp4$/);await expect(video).toHaveJSProperty('muted',true);await expect(video).toHaveJSProperty('controls',false);
 await host.locator('[data-video-play]').focus();await page.keyboard.press('Space');await expect(video).toHaveJSProperty('paused',true);
 await page.emulateMedia({reducedMotion:'no-preference'});await expect(video).toHaveJSProperty('paused',false);
 await page.getByRole('button',{name:'Explore original evidence',exact:false}).click();await expect(video).toHaveJSProperty('paused',true);
 await page.getByRole('button',{name:'Return to scene',exact:false}).click();await expect(video).toHaveJSProperty('paused',false);
 await page.getByRole('button',{name:'Next chapter',exact:true}).click();await expect(page.locator('[data-tme]')).toHaveAttribute('data-scene','chapter-ring');await expect(video).toHaveJSProperty('paused',true);
});
test('D2L chapter video preserves a manual reduced-motion fallback on mobile and media failure',async({page})=>{
 await page.setViewportSize({width:375,height:812});await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('**/d2l-prototype.mp4',r=>r.fulfill({status:503,body:'Unavailable test recording'}));await page.goto(route+'#d2l-world');
 const host=page.locator('[data-chapter-video="d2l-world"]');await expect(host.locator('video')).not.toHaveAttribute('src');await host.locator('[data-video-play]').click();
 await expect(host.locator('[data-video-status]')).toContainText('could not play');await expect(host.locator('img')).toBeVisible();await expect(host.locator('video')).toBeHidden();
 await expect(host.getByRole('link',{name:'View larger recording',exact:false})).toHaveAttribute('href',/d2l-prototype.mp4$/);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('Community chapter plays the original Figma recording only while visible and preserves its original-screen reader',async({page})=>{
 await page.goto(route+'#chapter-community');const host=page.locator('[data-chapter-video="chapter-community"]'),video=host.locator('video');await host.locator('.tme-chapter-video-image').scrollIntoViewIfNeeded();
 await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.15);await expect(video).toHaveAttribute('src',/community-original-figma.mp4$/);
 await expect(video).toHaveJSProperty('muted',true);await expect(video).toHaveJSProperty('loop',true);await expect(video).toHaveJSProperty('controls',false);await expect(page.locator('[data-chapter-video="d2l-world"] video')).not.toHaveAttribute('src');
 expect(await video.evaluate((v:HTMLVideoElement)=>v.videoHeight)).toBe(1368);
 await host.locator('[data-video-play]').click();await expect(video).toHaveJSProperty('paused',true);await host.locator('[data-video-play]').click();await expect(video).toHaveJSProperty('paused',false);
 await host.getByRole('link',{name:'Explore original event screens',exact:false}).click();await expect(page.locator('#community-capture-events')).toBeVisible();await expect(video).toHaveJSProperty('paused',true);
 await page.getByRole('button',{name:'Return to scene',exact:false}).click();await expect(video).toHaveJSProperty('paused',false);
 await page.getByRole('button',{name:'Next chapter',exact:true}).click();await expect(page.locator('[data-tme]')).toHaveAttribute('data-scene','chapter-align');await expect(video).toHaveJSProperty('paused',true);
});
test('Community chapter reduced-motion mobile preview keeps a stable poster and recovers from media failure',async({page})=>{
 await page.setViewportSize({width:375,height:812});await page.emulateMedia({reducedMotion:'reduce'});await page.route('**/community-original-figma.mp4',r=>r.fulfill({status:503,body:'Test media failure'}));await page.goto(route+'#chapter-community');
 const host=page.locator('[data-chapter-video="chapter-community"]'),video=host.locator('video');await expect(video).not.toHaveAttribute('src');await host.locator('[data-video-play]').focus();await page.keyboard.press('Enter');await expect(host.locator('[data-video-status]')).toContainText('could not play');await expect(host.locator('img')).toBeVisible();await expect(video).toBeHidden();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await host.locator('summary').click();await expect(host.locator('#community-chapter-recording-description')).toContainText('No real registration');
});
test('ALIGN chapter plays its current coded prototype and pauses while the real prototype reader is open',async({page})=>{
 await page.goto(route+'#chapter-align');const host=page.locator('[data-chapter-video="chapter-align"]'),video=host.locator('video');await host.locator('.tme-chapter-video-image').scrollIntoViewIfNeeded();
 await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.15);await expect(video).toHaveAttribute('src',/align-prototype.mp4$/);await expect(video).toHaveJSProperty('muted',true);await expect(video).toHaveJSProperty('controls',false);await expect(video).toHaveJSProperty('loop',true);
 expect(await video.evaluate((v:HTMLVideoElement)=>v.videoWidth/v.videoHeight)).toBeCloseTo(16/9);await expect(page.locator('[data-chapter-video="chapter-community"] video')).not.toHaveAttribute('src');
 await host.locator('[data-video-play]').focus();await page.keyboard.press('Space');await expect(video).toHaveJSProperty('paused',true);await page.keyboard.press('Enter');await expect(video).toHaveJSProperty('paused',false);
 await host.getByRole('link',{name:'Try the coded candidate journey',exact:false}).click();await expect(page.locator('[data-project-reader]')).toHaveAttribute('data-state','ready');await expect(page.locator('[data-project-reader]').frameLocator('iframe').getByRole('heading',{name:'Discover',exact:true})).toBeVisible();await expect(video).toHaveJSProperty('paused',true);
 await page.getByRole('button',{name:'Close reader',exact:true}).click();await expect(video).toHaveJSProperty('paused',false);await page.getByRole('button',{name:'Next chapter',exact:true}).click();await expect(video).toHaveJSProperty('paused',true);
});
test('ALIGN chapter reduced-motion mobile preview is stable and retains historical evidence on failure',async({page})=>{
 await page.setViewportSize({width:375,height:812});await page.emulateMedia({reducedMotion:'reduce'});await page.route('**/align-prototype.mp4',r=>r.fulfill({status:503,body:'Test media failure'}));await page.goto(route+'#chapter-align');const host=page.locator('[data-chapter-video="chapter-align"]'),image=host.locator('.tme-chapter-video-image');await expect(host.locator('video')).not.toHaveAttribute('src');
 await host.locator('[data-video-play]').scrollIntoViewIfNeeded();const before=await image.boundingBox();expect(before!.width).toBeGreaterThan(200);await host.locator('[data-video-play]').click();await expect(host.locator('[data-video-status]')).toContainText('could not play');await expect(host.locator('img')).toBeVisible();const after=await image.boundingBox();expect(after!.width).toBe(before!.width);expect(after!.height).toBe(before!.height);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('#chapter-align .tme-opening-detail summary').click();await page.getByRole('button',{name:'How this was designed',exact:false}).click();await page.locator('.tme-align-artifacts summary').click();await expect(page.locator('.tme-align-artifacts img[alt^="Historical M05"]')).toBeVisible();
});
test('Ring chapter plays the existing scroll recording and pauses for the coded prototype reader',async({page})=>{
 await page.goto(route+'#chapter-ring');const host=page.locator('[data-chapter-video="chapter-ring"]'),video=host.locator('video');await host.locator('.tme-chapter-video-image').scrollIntoViewIfNeeded();
 await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.2);await expect(video).toHaveAttribute('src',/ring-scroll-preview.mp4$/);
 expect(await video.evaluate((v:HTMLVideoElement)=>({width:v.videoWidth,height:v.videoHeight,muted:v.muted,loop:v.loop,controls:v.controls}))).toEqual({width:1280,height:720,muted:true,loop:true,controls:false});
 await host.locator('[data-video-play]').focus();await page.keyboard.press('Space');await expect(video).toHaveJSProperty('paused',true);await page.keyboard.press('Enter');await expect(video).toHaveJSProperty('paused',false);
 await page.locator('#chapter-ring .tme-opening-actions').getByRole('link',{name:'Try the prototype',exact:false}).click();await expect(page.locator('[data-project-reader]')).toHaveAttribute('data-state','ready');await expect(video).toHaveJSProperty('paused',true);
 await page.getByRole('button',{name:'Close reader',exact:true}).click();await expect(video).toHaveJSProperty('paused',false);
 await page.getByRole('button',{name:'Next chapter',exact:true}).click();await expect(video).toHaveJSProperty('paused',true);
});
test('Ring chapter respects reduced motion on mobile and retries a failed recording without resizing',async({page})=>{
 await page.setViewportSize({width:375,height:812});await page.emulateMedia({reducedMotion:'reduce'});await page.route('**/ring-scroll-preview.mp4',r=>r.fulfill({status:503,body:'Test media failure'}));await page.goto(route+'#chapter-ring');
 const host=page.locator('[data-chapter-video="chapter-ring"]'),video=host.locator('video'),frame=host.locator('.tme-chapter-video-image');await expect(video).not.toHaveAttribute('src');await host.locator('[data-video-play]').scrollIntoViewIfNeeded();const before=await frame.boundingBox();
 await host.locator('[data-video-play]').click();await expect(host.locator('[data-video-status]')).toContainText('could not play');await expect(host.locator('img')).toBeVisible();
 await page.unroute('**/ring-scroll-preview.mp4');await host.locator('[data-video-play]').click();await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.2);const after=await frame.boundingBox();expect(after!.height).toBe(before!.height);expect(after!.width).toBe(before!.width);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
