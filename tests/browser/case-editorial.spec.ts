import { test, expect } from '@playwright/test';

const cases = ['d2l-redesign', 'apple-ring', 'community-spaces'];
test('case openings expose original evidence early and preserve proportions across themes and widths', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const slug of cases) for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/work/${slug}/`);
    for (const theme of ['light', 'dark']) {
      const toggle = page.getByRole('button', { name: 'Dark mode', exact: true });
      if (await toggle.getAttribute('aria-pressed') !== String(theme === 'dark')) await toggle.click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      const first = page.locator('.opening-artifact img').first();
      expect(await first.evaluate(el => el.getBoundingClientRect().top + scrollY)).toBeLessThan(850);
      await expect(first).toHaveJSProperty('complete', true);
      expect(await first.evaluate((el: HTMLImageElement) => Math.abs(el.clientWidth / el.clientHeight - el.naturalWidth / el.naturalHeight))).toBeLessThan(.02);
      await expect(page.locator('.case-role')).toBeVisible();
    }
  }
});

test('case prototype links match approved original entry points and remain distinct from walkthroughs', async ({ page }) => {
  for (const [slug, key] of [['d2l-redesign', 'piRHnDp4bwoVkKMo1mHSt7'], ['community-spaces', 'pWjqzjZD2HgayCk6pQg3Zk']]) {
    await page.goto(`/work/${slug}/`);
    const link = page.locator('.opening-actions a[href*="figma.com/proto"]');
    await expect(link).toHaveAttribute('href', new RegExp(`figma.com/proto/${key}/`));
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(link).toHaveAccessibleName(/opens in a new tab/);
    await expect(page.locator('.journey-instruction')).toContainText('Pictured controls are not interactive');
  }
});

test('Community prioritizes the final journey while preserving complete original sketches on demand', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/work/community-spaces/');
  const final = await page.locator('#concept').boundingBox();
  const evolution = await page.locator('#evolution').boundingBox();
  expect(final!.y).toBeLessThan(evolution!.y);
  expect(evolution!.height).toBeLessThan(1800);
  const sketch = page.locator('#evolution details');
  await sketch.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(sketch).toHaveAttribute('open', '');
  await expect(sketch.getByRole('img')).toBeVisible();
  await expect(sketch.getByRole('link')).toHaveAttribute('href', /\/_astro\//);
});
