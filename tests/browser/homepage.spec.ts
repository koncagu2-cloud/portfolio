import { tabKey } from './keyboard';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage hierarchy, navigation, and honest project review state', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link')).toHaveText(['Work', 'Approach', 'About', 'Resume', 'Contact']);
  expect(await page.locator('main > section').evaluateAll((sections) => sections.map((s) => s.getAttribute('aria-labelledby')))).toEqual(['hero-heading', 'work-heading', 'capabilities-heading', 'about-heading', 'contact-heading']);
  await expect(page.locator('#work article')).toHaveCount(4);
  await expect(page.locator('#work article h3')).toHaveText(['D2L Redesign', 'Community Spaces', 'Apple Ring', 'ALIGN']);
  await expect(page.getByText('Pure Michigan', { exact: true })).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await page.getByRole('navigation').getByRole('link', { name: 'Work', exact: true }).click();
  await expect(page).toHaveURL(/#work$/);
  await page.getByRole('navigation').getByRole('link', { name: 'Approach', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'What I bring to a problem' })).toBeInViewport();
  await page.getByRole('navigation').getByRole('link', { name: 'Resume', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Resume', exact: true })).toBeInViewport();
  await expect(page.locator('a[href="https://suleymankoncagul.com/contact"]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Email Suleyman Koncagul' })).toHaveAttribute('href', 'mailto:koncagusuleyman@gmail.com');
  await expect(page.getByRole('link', { name: 'LinkedIn', exact: true })).toHaveAttribute('href', 'https://www.linkedin.com/in/suleyman-koncagul-b3237b357/');
  // Every same-page navigation link has a real target.
  const missing = await page.locator('a[href^="#"]').evaluateAll((links) => links.map((a) => a.getAttribute('href')!).filter((href) => !document.getElementById(href.slice(1))));
  expect(missing).toEqual([]);
});

test('keyboard skip link, evidence disclosure, theme toggle, and persistence', async ({ page, browserName }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.keyboard.press(tabKey(browserName));
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  const summary = page.locator('summary').first();
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('details').first()).toHaveAttribute('open', '');
  const toggle = page.getByRole('button', { name: 'Dark mode' });
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Dark mode' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('responsive layouts stay within the viewport, including dark mode', async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('navigation')).toBeVisible();
    await page.screenshot({ path: `test-results/homepage-${width}.png`, fullPage: true });
  }
  await page.getByRole('button', { name: 'Dark mode' }).click();
  await page.screenshot({ path: 'test-results/homepage-dark.png', fullPage: true });
});

test('light and dark have no detected WCAG A/AA violations', async ({ page }) => {
  await page.goto('/');
  const audit = async () => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect((await audit()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Dark mode' }).click();
  expect((await audit()).violations).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  expect((await audit()).violations).toEqual([]);
});

test('core navigation and disclosures work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4322/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Dark mode' })).toBeHidden();
  await page.getByRole('navigation').getByRole('link', { name: 'About', exact: true }).click();
  await expect(page).toHaveURL(/#about$/);
  await page.locator('summary').first().click();
  await expect(page.locator('details').first()).toHaveAttribute('open', '');
  await context.close();
});

test('unavailable storage and reduced motion do not break interaction', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage disabled'); } });
  });
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('uncommissioned routes stay absent and the approved resume resolves', async ({ page, request }) => {
  const response = await request.get('/work/d2l/');
  expect(response.status()).toBe(404);
  await page.goto('/');
  const resume = page.getByRole('link', { name: 'Read the resume (PDF)' });
  await expect(resume).toHaveAttribute('href', '/resume/suleyman-koncagul-resume.pdf');
  const pdf = await request.get('/resume/suleyman-koncagul-resume.pdf');
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()['content-type']).toContain('application/pdf');
  expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
  const projectPaths = await page.locator('a[href^="/work/"]').evaluateAll(links =>
    [...new Set(links.map(a => new URL(a.getAttribute('href')!, location.href).pathname))]);
  expect(projectPaths).toEqual(['/work/d2l-redesign/', '/work/community-spaces/', '/work/apple-ring/', '/work/align/']);
});
