// Render local, typography-only share images using the established portfolio identity.
import { chromium } from '@playwright/test';
import { readFile, mkdir } from 'node:fs/promises';
const cards = JSON.parse(await readFile(new URL('../src/data/share-previews.json', import.meta.url), 'utf8'));
const escape = value => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
await mkdir(new URL('../public/social/', import.meta.url), { recursive: true });
const browser = await chromium.launch();
try {
 const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
 for (const card of cards) {
  await page.setContent(`<style>*{box-sizing:border-box}body{margin:0;background:#f8f8f6;color:#202020;padding:64px 72px;font-family:Arial,Helvetica,sans-serif}header{font:18px 'Courier New',monospace;letter-spacing:1px;text-transform:uppercase}h1{font-weight:400;font-size:88px;line-height:1.03;letter-spacing:-5px;margin:70px 0 24px;max-width:1000px}p{font:30px/1.4 Georgia,serif;max-width:950px;margin:0}footer{position:absolute;bottom:48px;left:72px;right:72px;padding-top:24px;border-top:1px solid #c9c9c5;font:19px 'Courier New',monospace;display:flex;justify-content:space-between}</style><header>Suleyman Koncagul / Design portfolio</header><h1>${escape(card.title)}</h1><p>${escape(card.summary)}</p><footer><span>suleymankoncagul.com</span><span>${card.image === 'portfolio' ? 'Selected work' : 'Case study'}</span></footer>`);
  await page.screenshot({ path: new URL(`../public/social/${card.image}.png`, import.meta.url).pathname });
 }
} finally { await browser.close(); }
