import {test,expect as baseExpect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile} from 'node:fs/promises';
const expect=baseExpect.configure({timeout:15000}),route='/experiments/sk-character-studio/';
const fixture=(name:string)=>fileURLToPath(new URL('../../public/experiments/sk-character-studio/fixtures/'+name,import.meta.url));
test.setTimeout(60000);
async function openRig(page:any){await page.goto(route+'#studio-workbench');await expect(page.locator('[data-studio]')).toHaveAttribute('data-ready','true');await page.getByRole('button',{name:'Load validation rig',exact:true}).click();await expect(page.locator('[data-studio]')).toHaveAttribute('data-asset','gltf');}

test('real GLB import deforms a skinned mesh and detects clips, morphs and glasses socket',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await openRig(page);const root=page.locator('[data-studio]');
 await expect(page.locator('[data-report]')).toContainText('"skinnedMeshes": 1');await expect(page.locator('[data-report]')).toContainText('"blinkTargets": 2');await expect(root).toHaveAttribute('data-glasses-attached','true');await expect(page.locator('[data-asset-label]')).toContainText('not character art');
 const sample=await root.getAttribute('data-skin-sample');await expect.poll(()=>root.getAttribute('data-skin-sample')).not.toBe(sample);await page.getByRole('combobox',{name:'Animation clip',exact:true}).selectOption('EyeContact');await expect(root).toHaveAttribute('data-clip','EyeContact');
 await page.getByRole('button',{name:'Pause animation',exact:true}).click();await page.waitForTimeout(150);const time=await root.getAttribute('data-animation-time'),frames=await root.getAttribute('data-frames');await page.waitForTimeout(180);await expect(root).toHaveAttribute('data-animation-time',time!);await expect(root).toHaveAttribute('data-frames',frames!);expect(errors).toEqual([]);
});

test('head and eyes accept keyboard input; camera controls reframe and reset without a drag gesture',async({page})=>{
 await openRig(page);const root=page.locator('[data-studio]');await page.getByRole('button',{name:'Pause animation',exact:true}).click();await page.getByLabel('Head direction',{exact:true}).press('End');await expect.poll(async()=>Number(await root.getAttribute('data-head-yaw'))).toBeGreaterThan(.1);await page.getByLabel('Gaze horizontal',{exact:true}).press('End');await expect.poll(async()=>Number(await root.getAttribute('data-eye-yaw'))).toBeGreaterThan(.1);
 const distance=Number(await root.getAttribute('data-camera-distance'));await page.getByRole('button',{name:'Head close-up',exact:true}).click();await expect.poll(async()=>Number(await root.getAttribute('data-camera-distance'))).toBeLessThan(distance);await page.getByLabel('View angle',{exact:true}).press('End');await page.getByRole('button',{name:'Reset view',exact:true}).click();await expect(page.getByLabel('View angle',{exact:true})).toHaveValue('0');await expect(page.getByLabel('Head direction',{exact:true})).toHaveValue('0');
});

test('manual morph and material previews affect the loaded instance and restore values',async({page})=>{
 await openRig(page);await page.getByRole('button',{name:'Pause animation',exact:true}).click();await page.getByText('Facial and material inspection',{exact:true}).click();await page.getByLabel('Influence',{exact:true}).press('End');await expect(page.locator('[data-studio]')).toHaveAttribute('data-morph','1');await page.getByRole('button',{name:'Clear morph preview',exact:true}).click();await expect(page.locator('[data-studio]')).toHaveAttribute('data-morph','0');
 await page.getByLabel('Roughness',{exact:true}).press('End');await expect(page.locator('[data-studio]')).toHaveAttribute('data-material-roughness','1');await page.getByRole('button',{name:'Restore authored material',exact:true}).click();await expect(page.locator('[data-studio]')).toHaveAttribute('data-material-roughness','0.62');
});

test('local GLB, embedded glTF and external-buffer glTF load without an upload request',async({page})=>{
 const external:string[]=[];page.on('request',r=>{if(/^https?:/.test(r.url())&&(r.method()!=='GET'||!new URL(r.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/)))external.push(r.url());});await page.goto(route+'#studio-workbench');await expect(page.locator('[data-studio]')).toHaveAttribute('data-ready','true');
 for(const files of [[fixture('rig-validation.glb')],[fixture('rig-validation.gltf')],[fixture('rig-validation-external.gltf'),fixture('rig-validation.bin')]]){
  await page.locator('[data-files]').setInputFiles(files);await expect(page.locator('[data-studio]')).toHaveAttribute('data-source',files[0].split('/').pop()!);await expect(page.locator('[data-status]')).toContainText('loaded. 1 skinned mesh');await expect(page.locator('[data-studio]')).toHaveAttribute('data-asset','gltf');await expect(page.locator('[data-report]')).toContainText('"joints": 2');
 }
 expect(external).toEqual([]);
});

test('bad assets, missing resources and decoder-dependent files restore the unchanged fallback',async({page})=>{
 await openRig(page);
 await page.locator('[data-files]').setInputFiles({name:'invalid.glb',mimeType:'model/gltf-binary',buffer:Buffer.from('not a GLB')});await expect(page.locator('[data-status]')).toContainText('Could not load');await expect(page.locator('[data-studio]')).toHaveAttribute('data-asset','placeholder');
 await page.locator('[data-files]').setInputFiles(fixture('rig-validation-external.gltf'));await expect(page.locator('[data-status]')).toContainText('Missing local resource');
 await page.locator('[data-files]').setInputFiles({name:'compressed.gltf',mimeType:'model/gltf+json',buffer:Buffer.from(JSON.stringify({asset:{version:'2.0'},extensionsRequired:['KHR_draco_mesh_compression']}))});await expect(page.locator('[data-status]')).toContainText('decoder');
 await page.getByRole('button',{name:'Load validation rig',exact:true}).click();await expect(page.locator('[data-studio]')).toHaveAttribute('data-asset','gltf');
});

test('an older loading operation cannot replace a newer fallback choice',async({page})=>{
 let release!:()=>void;const gate=new Promise<void>(r=>release=r);await page.route('**/fixtures/rig-validation.glb',async route=>{await gate;await route.continue();});await page.goto(route+'#studio-workbench');await expect(page.locator('[data-studio]')).toHaveAttribute('data-ready','true');await page.getByRole('button',{name:'Load validation rig',exact:true}).click();await expect(page.locator('[data-status]')).toContainText('Loading Validation');await page.getByRole('button',{name:'Use existing fallback',exact:true}).click();release();await page.waitForTimeout(400);await expect(page.locator('[data-studio]')).toHaveAttribute('data-asset','placeholder');await expect(page.locator('[data-status]')).toContainText('No character geometry was changed');
});

test('five-width reduced-motion and automated accessibility inspection preserve native controls',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await openRig(page);const root=page.locator('[data-studio]');await expect(root).toHaveAttribute('data-motion','reduced');await expect(page.getByRole('button',{name:'Animation paused',exact:true})).toBeDisabled();
 for(const width of [320,375,768,1024,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await expect(page.getByLabel('Camera distance',{exact:true})).toBeEnabled();}
 const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(result.violations).toEqual([]);
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex, nofollow');
});

test('blocked runtime and absent JavaScript leave the original reference and navigation',async({browser,page})=>{
 await page.route('**/vendor/GLTFLoader.js',r=>r.abort());await page.goto(route);await expect(page.locator('[data-status]')).toContainText('3D unavailable');await expect(page.locator('.sk-static img')).toBeVisible();
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:900},hasTouch:true,isMobile:true});const p=await context.newPage();await p.goto('http://127.0.0.1:4322'+route);await expect(p.locator('.sk-static img')).toBeVisible();await p.getByRole('link',{name:'Production brief',exact:true}).tap();await expect(p.locator('#production')).toBeInViewport();await context.close();
});


test('missing rig capabilities stay explicit rather than inventing animation or floating glasses',async({page})=>{
 const json=JSON.parse(await readFile(fixture('rig-validation.gltf'),'utf8'));delete json.animations;delete json.skins;delete json.nodes[6].skin;for(const i of [2,3,4,5])json.nodes[i].name='Unmapped_'+i;
 await page.goto(route+'#studio-workbench');await expect(page.locator('[data-studio]')).toHaveAttribute('data-ready','true');await page.locator('[data-files]').setInputFiles({name:'static-unmapped.gltf',mimeType:'model/gltf+json',buffer:Buffer.from(JSON.stringify(json))});await expect(page.locator('[data-studio]')).toHaveAttribute('data-source','static-unmapped.gltf');
 await expect(page.locator('[data-report]')).toContainText('No skinned mesh');await expect(page.locator('[data-report]')).toContainText('Named Idle clip missing');await expect(page.locator('[data-report]')).toContainText('No glasses socket');await expect(page.getByRole('combobox',{name:'Animation clip',exact:true})).toBeDisabled();await expect(page.getByLabel('Head direction',{exact:true})).toBeDisabled();await expect(page.getByLabel('Gaze horizontal',{exact:true})).toBeDisabled();await expect(page.getByRole('button',{name:'Head close-up',exact:true})).toBeDisabled();await expect(page.locator('[data-studio]')).toHaveAttribute('data-glasses-attached','false');
});

test('deliberate blink preview drives the imported blink morphs even while idle playback is paused',async({page})=>{
 await openRig(page);await page.getByRole('button',{name:'Pause animation',exact:true}).click();await page.getByText('Facial and material inspection',{exact:true}).click();await page.getByLabel('Influence',{exact:true}).press('End');await page.getByRole('button',{name:'Clear morph preview',exact:true}).click();await page.getByRole('button',{name:'Blink preview',exact:true}).click();await expect.poll(async()=>Number(await page.locator('[data-studio]').getAttribute('data-morph')),{intervals:[20,30,40]}).toBeGreaterThan(.05);
});

test('mobile touch controls, camera and native swipe remain usable; collect local observations',async({browser},testInfo)=>{
 const context=await browser.newContext({hasTouch:true,isMobile:true,deviceScaleFactor:2,viewport:{width:375,height:900}});const page=await context.newPage();await page.goto('http://127.0.0.1:4322'+route+'#studio-workbench');await expect(page.locator('[data-studio]')).toHaveAttribute('data-ready','true');await page.getByRole('button',{name:'Load validation rig',exact:true}).tap();await expect(page.locator('[data-studio]')).toHaveAttribute('data-asset','gltf');await page.getByRole('button',{name:'Pause animation',exact:true}).tap();await expect(page.getByRole('button',{name:'Animation paused',exact:true})).toHaveAttribute('aria-pressed','true');await page.getByRole('button',{name:'Head close-up',exact:true}).tap();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.getByRole('link',{name:'Viewer',exact:true}).tap();const cdp=await context.newCDPSession(page),start=await page.evaluate(()=>scrollY);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:180,y:500}]});for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:180,y:500-i*30}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(start+70);
 const data=await page.evaluate(()=>({viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},report:document.querySelector('[data-report]')?.textContent,renderer:document.querySelector('[data-performance]')?.textContent,resources:performance.getEntriesByType('resource').filter(r=>/GLTFLoader|BufferGeometryUtils|three\.|sk-character|rig-validation/.test(r.name)).map(r=>({name:r.name.split('/').slice(-2).join('/'),durationMs:Math.round(r.duration),transferBytes:(r as PerformanceResourceTiming).transferSize}))}));await writeFile(testInfo.outputPath('studio-mobile-observations.json'),JSON.stringify(data,null,2));await context.close();
});


test('local raster textures survive import and per-material roughness overrides',async({page})=>{
 const json=JSON.parse(await readFile(fixture('rig-validation-external.gltf'),'utf8'));json.materials[0].pbrMetallicRoughness.baseColorTexture={index:0};json.images=[{uri:'pixel.png'}];json.textures=[{source:0}];
 await page.goto(route+'#studio-workbench');await expect(page.locator('[data-studio]')).toHaveAttribute('data-ready','true');
 await page.locator('[data-files]').setInputFiles([{name:'textured.gltf',mimeType:'model/gltf+json',buffer:Buffer.from(JSON.stringify(json))},{name:'rig-validation.bin',mimeType:'application/octet-stream',buffer:await readFile(fixture('rig-validation.bin'))},{name:'pixel.png',mimeType:'image/png',buffer:await readFile(fixture('pixel.png'))}]);
 await expect(page.locator('[data-studio]')).toHaveAttribute('data-source','textured.gltf');await expect(page.locator('[data-report]')).toContainText('"importedTextures": 1');await expect(page.locator('[data-studio]')).toHaveAttribute('data-material-maps','1');await page.getByText('Facial and material inspection',{exact:true}).click();await page.getByLabel('Roughness',{exact:true}).press('End');await expect(page.locator('[data-studio]')).toHaveAttribute('data-material-roughness','1');await expect(page.locator('[data-studio]')).toHaveAttribute('data-material-maps','1');
 await page.locator('[data-files]').setInputFiles([{name:'broken-texture.gltf',mimeType:'model/gltf+json',buffer:Buffer.from(JSON.stringify(json))},{name:'rig-validation.bin',mimeType:'application/octet-stream',buffer:await readFile(fixture('rig-validation.bin'))},{name:'pixel.png',mimeType:'image/png',buffer:Buffer.from('corrupt raster')}]);await expect(page.locator('[data-status]')).toContainText('could not be decoded');await expect(page.locator('[data-studio]')).toHaveAttribute('data-asset','placeholder');
});
