import { test, expect } from '@playwright/test';

const cases = ['d2l-redesign', 'community-spaces', 'apple-ring'];

test('decision index links reveal their actual evidence, including hidden walkthrough steps', async ({ page }) => {
  for (const slug of cases) {
    await page.goto(`/work/${slug}/`);
    const index = page.getByRole('region', { name: 'Three decisions to explore.' });
    const links = index.getByRole('link');
    await expect(links).toHaveCount(3);
    for (const link of await links.all()) {
      const target = await link.getAttribute('href');
      await page.keyboard.press('Tab');
      await link.focus();
      expect(await link.evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none');
      await page.keyboard.press('Enter');
      await expect(page.locator(target!)).toBeVisible();
      await expect(page.locator(`${target} h2, ${target} h3`).first()).toBeInViewport();
    }
  }
});

test('case study navigation follows Selected Work order in both directions', async ({ page }) => {
  await page.goto('/work/d2l-redesign/');
  for (const slug of ['community-spaces', 'apple-ring', 'align']) {
    await page.getByRole('navigation', { name: 'More case studies' }).getByRole('link', { name: /Next project/ }).click();
    await expect(page).toHaveURL(new RegExp(`/work/${slug}/$`));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  }
  for (const slug of ['apple-ring', 'community-spaces', 'd2l-redesign']) {
    await page.getByRole('navigation', { name: 'More case studies' }).getByRole('link', { name: /Previous project/ }).click();
    await expect(page).toHaveURL(new RegExp(`/work/${slug}/$`));
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  }
});

test('Ring contextual entry opens the working handoff and preserves its return path', async ({ page }) => {
  await page.goto('/work/apple-ring/');
  await page.getByRole('link', { name: 'Explore the handoff interaction' }).click();
  await expect(page).toHaveURL(/\/prototypes\/apple-ring\/index\.html#continuity$/);
  await page.locator('[data-handoff-moment="morning"]').click();
  await expect(page.locator('#handoff-value')).toHaveText('7h 42m');
  await page.locator('#handoff-missing').check();
  await expect(page.locator('#handoff-value')).toHaveText('Not enough readings');
  await page.getByRole('navigation', { name: 'Portfolio context' }).getByRole('link').click();
  await expect(page).toHaveURL(/\/work\/apple-ring\/$/);
});

test('decision evidence and technical disclosure remain usable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  for (const slug of cases) {
    await page.goto(`http://127.0.0.1:4322/work/${slug}/`);
    const link = page.locator('.case-decisions a').nth(1);
    const target = await link.getAttribute('href');
    await link.click();
    await expect(page.locator(target!)).toBeInViewport();
  }
  const disclosure = page.locator('.ring-build-note details');
  await expect(page.locator('.ring-build-note > p')).toContainText('No native Watch app');
  await disclosure.locator('summary').click();
  await expect(disclosure).toHaveAttribute('open', '');
  await expect(disclosure).toContainText('static fallback');
  await context.close();
});
