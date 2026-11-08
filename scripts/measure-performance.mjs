// Local Chromium lab samples, not Lighthouse scores or field Core Web Vitals.
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
const output = process.argv[2];
if (!output) throw new Error('Provide a JSON output path.');
const origin = process.env.PERF_ORIGIN || 'http://127.0.0.1:4323';
const browser = await chromium.launch();
const samples = [];
try {
 for (const path of ['/', '/work/d2l-redesign/', '/work/community-spaces/', '/work/apple-ring/', '/prototypes/apple-ring/index.html']) {
  for (let run = 1; run <= 3; run++) {
   const context = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
   const page = await context.newPage();
   const errors = [];
   page.on('pageerror', error => errors.push(error.message));
   await page.addInitScript(() => {
    window.__lab = { lcp: 0, cls: 0, longTasks: [] };
    new PerformanceObserver(list => { for (const e of list.getEntries()) window.__lab.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__lab.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver(list => { for (const e of list.getEntries()) window.__lab.longTasks.push(e.duration); }).observe({ type: 'longtask', buffered: true });
   });
   const cdp = await context.newCDPSession(page);
   await cdp.send('Network.enable');
   await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
   await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 75000 });
   await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
   await page.goto(origin + path, { waitUntil: 'load', timeout: 60000 });
   await page.waitForTimeout(1200);
   const data = await page.evaluate(() => {
    const n = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource');
    return { ...window.__lab, fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null,
     ttfb: n.responseStart, domReady: n.domContentLoadedEventEnd,
     resourceDecodedBytes: resources.reduce((total, r) => total + r.decodedBodySize, 0),
     scriptDecodedBytes: resources.filter(r => r.initiatorType === 'script').reduce((total, r) => total + r.decodedBodySize, 0),
     inlineScripts: [...document.scripts].filter(s => !s.src).map(s => s.textContent),
     fontRequests: resources.filter(r => /\.(woff2?|ttf)(\?|$)/.test(r.name)).length,
     threeRequested: resources.some(r => /vendor\/three|ring-model\.js/.test(r.name)),
     overflow: document.documentElement.scrollWidth > innerWidth };
   });
   const inlineScriptGzipBytes = data.inlineScripts.reduce((total, s) => total + gzipSync(s).length, 0);
   delete data.inlineScripts;
   samples.push({ path, run, ...data, inlineScriptGzipBytes, errors });
   await context.close();
  }
 }
 const median = values => [...values].sort((a,b) => a-b)[Math.floor(values.length / 2)];
 const summary = [...new Set(samples.map(s => s.path))].map(path => {
  const rows = samples.filter(s => s.path === path);
  return { path, fcpMedianMs: median(rows.map(s => s.fcp)), lcpMedianMs: median(rows.map(s => s.lcp)),
   maxCls: Math.max(...rows.map(s => s.cls)), maxLongTaskMs: Math.max(0,...rows.flatMap(s => s.longTasks)),
   decodedResourceMedianBytes: median(rows.map(s => s.resourceDecodedBytes)),
   scriptMedianBytes: median(rows.map(s => s.scriptDecodedBytes)), initialThreeRequested: rows.some(s => s.threeRequested) };
 });
 await writeFile(output, JSON.stringify({ environment: { browser: browser.version(), viewport: '375x812', cpuSlowdown: 4, network: '150ms latency, 200000 bytes/s down, 75000 up', runs: 3, cache: 'disabled/new contexts', reducedMotion: true, observation: 'load + 1200ms; no scroll or interaction', compression: 'preview server delivery; decoded bytes, not CDN transfer estimates' }, summary, samples }, null, 2));
 console.log(JSON.stringify(summary));
} finally { await browser.close(); }
