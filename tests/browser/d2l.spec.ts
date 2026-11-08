import { tabKey } from './keyboard';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const path = '/work/d2l-redesign/';
const chapters = ['Overview', 'UX findings', 'Student journey', 'Instructor experience', 'Exploration', 'Reflection', 'Resources'];

test('D2L is reachable from selected work with confirmed shared attribution and honest review status', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Read the D2L case study' }).click();
  await expect(page).toHaveURL(new RegExp(`${path}$`));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('D2L Redesign');
  await expect(page.locator('.project-metadata')).toContainText('Four-person collaborative team');
  await expect(page.locator('.case-sources')).toContainText('Suleyman Koncagul, Gabe Bustillo, Benji Fajardo, and Alana Alexander');
  await expect(page.locator('.case-role')).toContainText('Shared team work');
  await expect(page.locator('.d2l-status')).toContainText('not an official D2L release');
  await expect(page.locator('.d2l-status')).toContainText(/usability validation and measured improvements are not established/i);
  await expect(page.locator('#reflection')).toContainText('replacement after submission remains unresolved');
  await expect(page.locator('.journey-panel > .journey-panel-heading > .micro')).toHaveText(['01 / Understand requirements', '02 / Review selected file', '03 / Check submission record']);
  await expect(page.locator('.d2l-status')).toContainText('does not establish a fully connected prototype');
  await expect(page.locator('.d2l-limits')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.getByRole('navigation', { name: 'Case study sections' }).getByRole('link')).toHaveText(chapters);
});

test('D2L originals load at native proportions and every local destination resolves', async ({ page, request }) => {
  await page.goto(path);
  await page.getByRole('button', { name: 'Read all steps', exact: true }).click();
  for (const summary of await page.locator('.d2l-supporting-flow > summary').all()) await summary.click();
  await expect(page.locator('main img')).toHaveCount(16);
  for (const image of await page.locator('main img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveJSProperty('complete', true);
    expect((await image.getAttribute('alt'))!.length).toBeGreaterThan(40);
    expect(await image.evaluate((node: HTMLImageElement) => { const rect = node.getBoundingClientRect(); return rect.width >= 100 && rect.height >= 100; })).toBe(true);
    expect(await image.evaluate((node: HTMLImageElement) => node.naturalWidth > 0 && Math.abs(node.clientWidth / node.clientHeight - node.naturalWidth / node.naturalHeight) < .02)).toBe(true);
    const response = await request.get((await image.getAttribute('src'))!);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/webp');
  }
  const hrefs = await page.locator('a[href]').evaluateAll(links => [...new Set(links.map(a => a.getAttribute('href')!))]);
  for (const href of hrefs.filter(href => href.startsWith('/'))) {
    const url = new URL(href, 'http://127.0.0.1:4322');
    const response = await request.get(url.pathname);
    expect(response.status(), href).toBe(200);
    if (url.hash) expect(await response.text()).toContain(`id="${url.hash.slice(1)}"`);
  }
  expect(await page.locator('body').textContent()).not.toContain('/api/mcp/asset/');
});

test('D2L responsive compositions and full-page review captures', async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(path);
    await page.getByRole('button', { name: 'Read all steps', exact: true }).click();
    for (const summary of await page.locator('.d2l-supporting-flow > summary').all()) await summary.click();
    for (const image of await page.locator('main img').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect(image).toHaveJSProperty('complete', true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const intro = page.locator('.editorial-opening');
    const title = await intro.locator('.case-hero').boundingBox();
    const artifact = await intro.locator('.opening-artifact').boundingBox();
    if (width <= 768) expect(artifact!.y).toBeGreaterThan(title!.y + title!.height);
    else expect(artifact!.x).toBeGreaterThan(title!.x + title!.width);
    await page.evaluate(() => scrollTo(0, 0));
    if (width !== 768) {
      await page.screenshot({ path: `test-results/d2l-full-${width}.png`, fullPage: true });
      await page.locator('.student-journey').screenshot({ path: `test-results/d2l-journey-${width}.jpg`, quality: 70 });
      await page.locator('.d2l-sketch-grid').screenshot({ path: `test-results/d2l-sketches-${width}.jpg`, quality: 70 });
      await page.locator('.case-intro').screenshot({ path: `test-results/d2l-hero-${width}.jpg`, quality: 70 });
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      const stripHeight = width === 1440 ? 1200 : 2000;
      for (let y = 0, part = 1; y < height; y += stripHeight, part++) {
        await page.screenshot({ path: `test-results/d2l-${width}-part-${String(part).padStart(2, '0')}.jpg`, fullPage: true, quality: 60, clip: { x: 0, y, width, height: Math.min(stripHeight, height - y) } });
      }
    }
  }
});

test('D2L keyboard focus, chapter anchors, and mobile traversal work', async ({ page, browserName }) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(path);
    await page.keyboard.press(tabKey(browserName));
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
    const toc = page.getByRole('navigation', { name: 'Case study sections' });
    for (const link of await toc.getByRole('link').all()) {
      await link.focus();
      expect(await link.evaluate(node => getComputedStyle(node).outlineStyle)).not.toBe('none');
      await page.keyboard.press('Enter');
      const target = await link.getAttribute('href');
      await expect(page.locator(`${target} ${target === '#challenge' ? 'h1' : 'h2'}`)).toBeInViewport();
    }
    await page.goto(path);
    const count = await page.locator('a[href], button, summary').filter({ visible: true }).count();
    for (let i = 0; i < count; i++) {
      await page.keyboard.press(tabKey(browserName));
      expect(await page.evaluate(() => {
        const node = document.activeElement as HTMLElement;
        const rect = node.getBoundingClientRect();
        return /^(A|BUTTON|SUMMARY)$/.test(node.tagName) && getComputedStyle(node).outlineStyle !== 'none' && rect.left >= 0 && rect.right <= innerWidth;
      })).toBe(true);
    }
  }
});

test('D2L automated accessibility in light and dark at all four widths', async ({ page }) => {
  await page.goto(path);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    for (const dark of [false, true]) {
      const toggle = page.getByRole('button', { name: 'Dark mode', exact: true });
      if ((await toggle.getAttribute('aria-pressed')) !== String(dark)) await toggle.click();
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
    }
  }
});

test('D2L core content works without scripts and does not require motion', async ({ browser, page }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const plain = await context.newPage();
  await plain.goto(`http://127.0.0.1:4322${path}`);
  await expect(plain.getByRole('heading', { level: 1 })).toHaveText('D2L Redesign');
  await plain.getByRole('navigation', { name: 'Case study sections' }).getByRole('link', { name: 'Reflection', exact: true }).click();
  await expect(plain).toHaveURL(/#reflection$/);
  await expect(plain.getByRole('button', { name: 'Dark mode' })).toBeHidden();
  await context.close();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(path);
  expect(await page.locator('.editorial-opening').evaluate(node => getComputedStyle(node).animationName)).toBe('none');
});
