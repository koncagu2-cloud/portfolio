import { test, expect } from '@playwright/test';

const paths = ['/', '/work/d2l-redesign/', '/work/community-spaces/', '/work/apple-ring/', '/work/align/'];

test('the portfolio reflows with enlarged text and preserves usable navigation', async ({ page }) => {
  for (const path of paths) {
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} at ${width}px with enlarged text`).toBe(true);
      const contact = page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Contact', exact: true });
      await contact.focus();
      await expect(contact).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/#contact$/);
      await expect(page.locator('#contact h2')).toBeInViewport();
    }
  }
});

test('case studies expose accurate decision states and inspectable evidence', async ({ page }) => {
  await page.goto('/work/d2l-redesign/');
  const findings = await page.locator('#evaluation').boundingBox();
  const journey = await page.locator('#experience').boundingBox();
  expect(findings!.y).toBeLessThan(journey!.y);
  await expect(page.locator('.d2l-decision-preview')).toHaveCount(0);
  await page.getByRole('button', { name: 'Review selected file', exact: true }).click();
  await expect(page.locator('#journey-file img')).toHaveAttribute('alt', /named PDF/);
  await expect(page.locator('.d2l-status')).toContainText('does not establish a fully connected prototype');
  await page.goto('/work/community-spaces/');
  await expect(page.locator('#concept .process-copy')).toContainText('Explore four original KIBS interface states.');
  await expect(page.locator('.service-journey li')).toHaveText(['Discover an event', 'Review the details', 'Register to attend', 'Intended visit to the proposed space']);
  await expect(page.locator('#research')).toContainText('not a population-level statistic');
  const links = page.locator('.artifact-figure figcaption a');
  const labels = await links.allTextContents();
  expect(new Set(labels).size).toBe(labels.length);
});

test('project actions give hover feedback without changing layout height', async ({ page }) => {
  await page.goto('/');
  const link = page.getByRole('link', { name: 'Selected work' });
  const before = await link.boundingBox();
  await link.hover();
  const after = await link.boundingBox();
  expect(after!.height).toBe(before!.height);
});
