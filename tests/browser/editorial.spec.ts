import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = ['/', '/work/d2l-redesign/', '/work/community-spaces/', '/work/apple-ring/', '/work/align/'];

test('homepage introduces the specialty and four differentiated contributions before deeper reading', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero-bottom')).toContainText('information architecture and accessible interactions');
  await expect(page.locator('.project-feature')).toHaveCount(4);
  await expect(page.locator('.feature-contribution')).toHaveCount(4);
  const contributions = await page.locator('.feature-contribution dd').allTextContents();
  expect(new Set(contributions).size).toBe(4);
  await page.setViewportSize({ width: 1440, height: 1000 });
  const firstArtifact = await page.locator('main img').first().boundingBox();
  expect(firstArtifact!.y).toBeLessThan(1000);
  await expect(page.getByRole('link', { name: 'Explore the Ring prototype' })).toHaveAttribute('href', '/prototypes/apple-ring/index.html');
});

test('each case study names the intended users and contribution, with a direct experience entry', async ({ page }) => {
  for (const [path, entry, target] of [
    ['/work/d2l-redesign/', 'Explore the student walkthrough', 'experience'],
    ['/work/community-spaces/', 'Explore the event journey', 'concept'],
    ['/work/apple-ring/', 'Explore the scrolling prototype', ''],
  ]) {
    await page.goto(path);
    await expect(page.locator('.case-role')).toContainText('My contribution');
    await expect(page.locator('.project-metadata dt').filter({ hasText: 'Intended users' })).toHaveCount(1);
    const link = page.getByRole('link', { name: entry });
    if (target) {
      await link.click();
      await expect(page).toHaveURL(new RegExp(`#${target}$`));
      await expect(page.locator(`#${target}`)).toBeInViewport();
    } else await expect(link).toHaveAttribute('href', '/prototypes/apple-ring/index.html');
  }
});

test('editorial layouts preserve proportions and reflow in both themes with enlarged text', async ({ page }) => {
  for (const path of pages) {
    await page.goto(path);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const fontSize of ['100%', '200%']) {
        await page.evaluate(value => document.documentElement.style.fontSize = value, fontSize);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${path}, ${width}, ${fontSize}`).toBe(true);
      }
    }
    await page.evaluate(() => document.documentElement.style.fontSize = '100%');
    for (const dark of [false, true]) {
      const toggle = page.getByRole('button', { name: 'Dark mode' });
      if ((await toggle.getAttribute('aria-pressed')) !== String(dark)) await toggle.click();
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
    }
  }
});
