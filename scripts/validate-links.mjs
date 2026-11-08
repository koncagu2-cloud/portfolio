import { chromium } from '@playwright/test';
import { writeFile, readFile } from 'node:fs/promises';
const origin = process.env.PERF_ORIGIN || 'http://127.0.0.1:4323';
const browser = await chromium.launch();
const page = await browser.newPage();
const urls = new Set(), fragments = [], errors = [], warnings = [];
page.on('pageerror', e => errors.push({ type: 'runtime', message: e.message }));
page.on('console', e => { if (e.type() === 'warning' || e.type() === 'error') warnings.push({ type: e.type(), text: e.text() }); });
try {
 for (const path of ['/', '/work/d2l-redesign/', '/work/community-spaces/', '/work/apple-ring/', '/prototypes/apple-ring/index.html']) {
  await page.goto(origin + path);
  const entries = await page.evaluate(() => [...document.querySelectorAll('a[href],img[src],script[src],link[href]')].map(el => ({
   url: new URL(el.getAttribute('href') || el.getAttribute('src'), location.href).href,
   tag: el.tagName,
  })));
  for (const entry of entries) {
   const url = new URL(entry.url);
   if (url.origin !== origin) continue;
   if (url.hash && entry.tag === 'A') fragments.push(new URL(url.href));
   url.hash = ''; urls.add(url.href);
  }
 }
 const manifest = JSON.parse(await readFile('docs/apple-ring/prototype-files.json', 'utf8'));
 for (const file of manifest.files) urls.add(new URL('/prototypes/apple-ring/' + file.file, origin).href);
 // CSS backgrounds are assets too, including the finish sprite and charging images.
 for (const url of [...urls].filter(url => new URL(url).pathname.endsWith('.css'))) {
  const text = await (await page.request.get(url)).text();
  for (const match of text.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)) {
   const asset = new URL(match[1], url); if (asset.origin === origin) urls.add(asset.href);
  }
 }
 const html = new Map();
 for (const url of urls) {
  const response = await page.request.get(url);
  if (!response.ok()) errors.push({ type: 'http', url, status: response.status() });
  if ((response.headers()['content-type'] || '').includes('text/html')) html.set(url, await response.text());
 }
 for (const url of fragments) {
  const id = decodeURIComponent(url.hash.slice(1)); const clean = new URL(url); clean.hash = '';
  const body = html.get(clean.href);
  if (!body || !(body.includes(`id="${id}"`) || body.includes(`id='${id}'`))) errors.push({ type: 'fragment', url: url.href });
 }
 const result = { origin, localUrlsChecked: urls.size, fragmentsChecked: fragments.length, errors, consoleMessages: warnings,
  limits: 'External URLs and email deliverability are not checked here. Browser console sampling is initial-load only; interaction regression tests run separately.' };
 await writeFile(process.argv[2] || 'docs/previews/production/link-validation.json', JSON.stringify(result, null, 2));
 console.log(JSON.stringify(result));
 if (errors.length) process.exitCode = 1;
} finally { await browser.close(); }
