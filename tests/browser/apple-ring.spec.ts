import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { tabKey } from './keyboard';

test('Apple Ring is discoverable and uses the native case-study shell', async ({ page, request }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Read the Apple Ring case study', exact: true }).click();
  await expect(page).toHaveURL(/\/work\/apple-ring\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Apple Ring');
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
  await expect(page.locator('.opening-boundary')).toContainText('Not affiliated with Apple');
  await expect(page.locator('#implementation')).toContainText('Codex assisted');
  await expect(page.locator('#validation')).toContainText('Participant sessions');
  await expect(page.locator('a[href*="chatgpt.site"]')).toHaveCount(0);
  const images = await page.locator('main img').evaluateAll(images => images.map(image => ({
    alt: image.getAttribute('alt'), width: image.getAttribute('width'), height: image.getAttribute('height'), src: image.getAttribute('src'),
  })));
  expect(images.length).toBe(7);
  expect(images.every(image => image.alt && image.width && image.height && image.src?.startsWith('/_astro/'))).toBe(true);
  for (const image of images) expect((await request.get(image.src!)).status()).toBe(200);
  const evidence = await request.get('/evidence/apple-ring-validation.json');
  expect(evidence.status()).toBe(200);
  expect((await evidence.json()).scope).toContain('not participant research');
  await page.getByRole('navigation', { name: 'Case study sections' }).getByRole('link', { name: 'The Question', exact: true }).click();
  await expect(page).toHaveURL(/#question$/);
  await page.getByRole('link', { name: 'Back to selected work', exact: false }).last().click();
  await expect(page).toHaveURL(/\/#work$/);
});

test('Ring case study keyboard, themes, enlarged text and image comparisons', async ({ page, browserName }) => {
  await page.goto('/work/apple-ring/');
  await page.keyboard.press(tabKey(browserName));
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await expect(page.locator('#charging .design-comparison')).toHaveAttribute('aria-label', 'Earlier and revised charging concept comparison');
  await expect(page.locator('#charging .design-comparison img')).toHaveCount(2);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const fontSize of ['100%', '200%']) {
      await page.evaluate(value => document.documentElement.style.fontSize = value, fontSize);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    }
  }
  await page.evaluate(() => document.documentElement.style.fontSize = '100%');
  await page.getByRole('button', { name: 'Dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('Ring case study has no detected WCAG violations in both themes', async ({ page }) => {
  await page.goto('/work/apple-ring/');
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const dark of [false, true]) {
      const toggle = page.getByRole('button', { name: 'Dark mode' });
      if ((await toggle.getAttribute('aria-pressed')) !== String(dark)) await toggle.click();
      const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(audit.violations).toEqual([]);
    }
  }
});

test('Ring case study remains readable with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4322/work/apple-ring/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Apple Ring');
  await expect(page.getByRole('button', { name: 'Dark mode' })).toBeHidden();
  await page.getByRole('navigation', { name: 'Case study sections' }).getByRole('link', { name: 'Evidence & Next Steps' }).click();
  await expect(page).toHaveURL(/#validation$/);
  await expect(page.locator('#validation')).toContainText('usability protocol');
  await context.close();
});

test('the actual scrolling presentation opens from the case study with working controls and a return path', async ({ page, request }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/work/apple-ring/');
  await page.getByRole('link', { name: 'Explore the scrolling prototype' }).click();
  await expect(page).toHaveURL(/\/prototypes\/apple-ring\/index\.html$/);
  await expect(page.locator('.hero-title h1')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  for (const file of ['style.css', 'script.js', 'watch-handoff.js', 'experience-state.js', 'assets/ring-hero.webp', 'vendor/three.module.js', 'vendor/three-LICENSE.txt']) {
    expect((await request.get(`/prototypes/apple-ring/${file}`)).status()).toBe(200);
  }
  await page.locator('[data-finish="1"]').click();
  await expect(page.locator('#finish-name')).toHaveText('Black Titanium');
  await page.locator('[data-handoff-moment="morning"]').click();
  await expect(page.locator('#handoff-value')).toHaveText('7h 42m');
  await page.locator('#handoff-disconnected').check();
  await expect(page.locator('#handoff-value')).toHaveText('No new sync');
  await page.locator('.local [data-open-try]').click();
  await expect(page.locator('#try-ring')).toBeVisible();
  await expect(page.locator('#try-finish-name')).toHaveText('Black Titanium');
  await page.keyboard.press('Escape');
  await page.getByRole('navigation', { name: 'Portfolio context' }).getByRole('link', { name: 'Back to case study' }).click();
  await expect(page).toHaveURL(/\/work\/apple-ring\/$/);
  expect(errors).toEqual([]);
});

test('bundled presentation supports small screens, reduced motion and no-JavaScript reading', async ({ page, browser }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/prototypes/apple-ring/index.html');
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  await expect(page.locator('.hero-ring')).toHaveCSS('transform', 'none');
  const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(audit.violations).toEqual([]);
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const staticPage = await context.newPage();
  await staticPage.goto('http://127.0.0.1:4322/prototypes/apple-ring/index.html');
  await expect(staticPage.locator('.hero-title h1')).toBeVisible();
  await expect(staticPage.locator('.noscript-note')).toBeVisible();
  await staticPage.getByRole('navigation', { name: 'Portfolio context' }).getByRole('link').click();
  await expect(staticPage).toHaveURL(/\/work\/apple-ring\/$/);
  await context.close();
});
