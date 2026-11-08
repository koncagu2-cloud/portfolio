import { test, expect } from '@playwright/test';
const routes = ['/', '/work/d2l-redesign/', '/work/community-spaces/', '/work/apple-ring/', '/work/align/'];
const indexable = process.env.SITE_INDEXABLE === 'true';

test('canonical URLs, unique metadata and local social previews use the intended domain', async ({ page, request }) => {
  const titles = new Set(), descriptions = new Set(), images = new Set();
  for (const path of routes) {
    await page.goto(path);
    titles.add(await page.title());
    descriptions.add(await page.locator('meta[name="description"]').getAttribute('content'));
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://suleymankoncagul.com${path}`);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `https://suleymankoncagul.com${path}`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', indexable ? 'index, follow' : 'noindex, nofollow');
    const image = (await page.locator('meta[property="og:image"]').getAttribute('content'))!;
    images.add(image);
    const response = await request.get(new URL(image).pathname);
    expect(response.status()).toBe(200);
    const bytes = await response.body();
    expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
    const icon = await request.get('/favicon.svg'); expect(icon.status()).toBe(200);
    expect(await icon.text()).toContain('<svg');
  }
  expect(titles.size).toBe(5); expect(descriptions.size).toBe(5); expect(images.size).toBe(5);
});

test('indexing is opt-in, sitemap excludes demos and errors, and 404 remains noindex', async ({ page, request }) => {
  const robots = await request.get('/robots.txt'); expect(robots.status()).toBe(200);
  const sitemap = await request.get('/sitemap.xml'); expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  if (indexable) {
    expect(await robots.text()).toContain('Sitemap: https://suleymankoncagul.com/sitemap.xml');
    expect(await robots.text()).not.toContain('Disallow: /prototypes/');
    for (const path of routes) expect(xml).toContain(`<loc>https://suleymankoncagul.com${path}</loc>`);
  } else { expect(await robots.text()).toContain('Disallow: /'); expect(xml).not.toContain('<loc>'); }
  expect(xml).not.toContain('/prototypes/'); expect(xml).not.toContain('404');
  const missing = await page.goto('/this-address-does-not-exist/'); expect(missing?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found.');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await page.goto('/prototypes/apple-ring/index.html');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /independent.*speculative/);
});

test('prepared host security policy permits the portfolio and interactive demo', async ({ page }) => {
  const { readFile } = await import('node:fs/promises');
  const headers = JSON.parse(await readFile('docs/deployment/security-headers.json', 'utf8'));
  const violations: string[] = [];
  await page.exposeFunction('recordPolicyViolation', (directive: string) => violations.push(directive));
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', event => {
      (window as unknown as { recordPolicyViolation: (value: string) => void }).recordPolicyViolation(event.violatedDirective);
    });
  });
  await page.route('**/*', async route => {
    if (route.request().resourceType() !== 'document') return route.continue();
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), ...headers } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.goto('/work/community-spaces/');
  await page.locator('[data-step-target="reserve"]').click();
  await expect(page.locator('#journey-reserve')).toBeVisible();
  await page.goto('/prototypes/apple-ring/index.html');
  await page.locator('.local [data-open-try]').click();
  await page.locator('#try-day-tab').click();
  await page.locator('[data-day-stage="afternoon"]').click();
  await expect(page.locator('#day-phone-title')).toHaveText('Movement');
  await page.keyboard.press('Escape');
  expect(violations).toEqual([]);
});

test('existing portfolio routes find their new case-study and homepage destinations', async ({ page }) => {
  for (const [legacy, destination] of [
    ['/projects/', /#work$/],
    ['/projects/d2l-redesign/', /\/work\/d2l-redesign\/$/],
    ['/about/', /#about$/],
    ['/contact/', /#contact$/],
    ['/resume/', /#resume$/],
    ['/about/strengths/accessible-interaction-design/', /#capabilities$/],
  ] as const) {
    await page.goto(legacy);
    await expect(page).toHaveURL(destination);
  }
});
