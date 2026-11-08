import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

test('recruiters can inspect evidence, see contact details and download the unchanged resume by keyboard', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'About', exact: true }).click();
  await expect(page.locator('#about')).toContainText('Interaction Designer, and Information Architect roles');
  for (const link of await page.locator('.capability-list a[href^="/work/"]').all()) {
    const href = (await link.getAttribute('href'))!;
    await page.goto(href);
    await expect(page.locator(href.slice(href.indexOf('#')))).toBeInViewport();
    await page.goto('/#about');
  }
  const downloadLink = page.getByRole('link', { name: 'Download resume', exact: true });
  await downloadLink.focus();
  const event = page.waitForEvent('download');
  await page.keyboard.press('Enter');
  const download = await event;
  expect(download.suggestedFilename()).toBe('suleyman-koncagul-resume.pdf');
  const bytes = await readFile((await download.path())!);
  const original = await readFile('public/resume/suleyman-koncagul-resume.pdf');
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(createHash('sha256').update(original).digest('hex'));
  await expect(page.locator('#contact a[href^="mailto:"]')).toContainText('koncagusuleyman@gmail.com');
  await expect(page.locator('#contact a[href^="mailto:"]')).toHaveAccessibleName(/koncagusuleyman@gmail.com/);
});

test('footer contact works from every case study, including mobile layouts', async ({ page }) => {
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const slug of ['d2l-redesign', 'community-spaces', 'apple-ring']) {
      await page.goto(`/work/${slug}/`);
      await page.locator('footer').getByRole('link', { name: 'Contact', exact: true }).click();
      await expect(page).toHaveURL(/\/#contact$/);
      await expect(page.locator('#contact-heading')).toBeInViewport();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});
