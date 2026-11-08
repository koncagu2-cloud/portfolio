import { test, expect } from '@playwright/test';

test('homepage work action has keyboard feedback, stable hover geometry and reduced-motion support', async ({ page }) => {
  await page.goto('/');
  const action = page.getByRole('link', { name: 'Selected work' });
  const before = await action.boundingBox();
  await action.hover();
  expect(await action.boundingBox()).toEqual(before);
  await page.keyboard.press('Tab');
  await action.focus();
  await expect(action).toBeFocused();
  expect(await action.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await action.evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#work$/);
  await expect(page.locator('#work-heading')).toBeInViewport();
});

test('homepage refinements remain isolated from all three case-study shells', async ({ page }) => {
  for (const path of ['/work/d2l-redesign/', '/work/community-spaces/', '/work/apple-ring/']) {
    await page.goto(path);
    await expect(page.locator('.homepage')).toHaveCount(0);
    expect(await page.evaluate(() => [...document.styleSheets].some(sheet => {
      try { return [...sheet.cssRules].some(rule => rule.cssText.includes('--home-feedback')); }
      catch { return false; }
    }))).toBe(false);
  }
});

test('work-first composition stays readable across breakpoints and both themes', async ({ page }) => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    for (const dark of [false, true]) {
      if (dark) await page.getByRole('button', { name: 'Dark mode' }).click();
      await page.evaluate(() => scrollTo(0, 0));
      const primary = page.locator('.d2l-feature .primary-artifact');
      const box = (await primary.boundingBox())!;
      // Meaningful project imagery starts within a normal viewport, rather than after the old 1,030px introduction.
      expect(box.y).toBeLessThan(900);
      if (width === 375) {
        expect(box.y).toBeLessThan(700);
        expect(box.width).toBeGreaterThan(280);
      }
      for (const image of await page.locator('.project-visual img:visible').all()) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
        const proportions = await image.evaluate((el: HTMLImageElement) => {
          const b = el.getBoundingClientRect();
          return { actual: b.width / b.height, original: el.naturalWidth / el.naturalHeight };
        });
        expect(proportions.actual).toBeCloseTo(proportions.original, 2);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});

test('Ring grouping remains compact through laptop breakpoints in both themes', async ({ page }) => {
  for (const width of [769, 900, 960, 1024, 1025, 1050, 1100, 1200, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    for (const theme of ['light', 'dark']) {
      if (theme === 'dark') await page.getByRole('button', { name: 'Dark mode' }).click();
      const gap = await page.locator('.ring-feature').evaluate(el => {
        const title = el.querySelector('.feature-heading')!.getBoundingClientRect();
        const story = el.querySelector('.feature-story')!.getBoundingClientRect();
        const details = el.querySelector('.feature-details')!.getBoundingClientRect();
        return { titleToStory: story.top - title.bottom, storyToDetails: details.top - story.bottom };
      });
      expect(gap.titleToStory).toBeCloseTo(24, 0);
      expect(gap.storyToDetails).toBeCloseTo(24, 0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});

test('mobile previews explain the project before one uncropped primary artifact', async ({ page }) => {
  for (const width of [320, 375, 640]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    for (const selector of ['.ring-feature', '.community-feature']) {
      const chapter = page.locator(selector);
      const sequence = await chapter.evaluate(el => [...el.children].map(child => child.className));
      expect(sequence).toEqual(['feature-heading', 'feature-story', 'project-visual', 'feature-details feature-footer']);
      await expect(chapter.locator('.project-visual img:visible')).toHaveCount(1);
      const image = chapter.locator('.primary-artifact');
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
      const size = await image.evaluate((el: HTMLImageElement) => ({ width: el.width, ratio: el.width / el.height, original: el.naturalWidth / el.naturalHeight }));
      expect(size.width).toBeGreaterThanOrEqual(240);
      expect(size.ratio).toBeCloseTo(size.original, 2);
    }
  }
});

test('tablet portrait accompanies the biography and meaningful metadata stays legible', async ({ page }) => {
  for (const width of [320, 375, 641, 700, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const styles = await page.evaluate(() => {
      const portrait = document.querySelector('personal-portrait')!.getBoundingClientRect();
      const bio = document.querySelector('.about-introduction')!.getBoundingClientRect();
      return { portrait: { width: portrait.width, top: portrait.top, right: portrait.right }, bio: { left: bio.left, top: bio.top }, metadata: [...document.querySelectorAll('.feature-heading .micro,.feature-contribution dt,.site-footer,.section-note,.strip-inner')].map(el => parseFloat(getComputedStyle(el).fontSize)) };
    });
    expect(Math.min(...styles.metadata)).toBeGreaterThanOrEqual(12);
    if (width > 640) {
      expect(styles.portrait.top).toBeCloseTo(styles.bio.top, 0);
      expect(styles.bio.left - styles.portrait.right).toBeGreaterThanOrEqual(24);
    }
    if (width === 768) expect(styles.portrait.width).toBe(240);
  }
});

test('editorial questions and primary artifact hierarchy stay distinct from supporting evidence', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  for (const question of await page.locator('.feature-story h4').all()) {
    expect(await question.evaluate(el => getComputedStyle(el).fontFamily)).toContain('Georgia');
    expect(parseFloat(await question.evaluate(el => getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(36);
  }
  const d2l = page.locator('.d2l-feature');
  expect((await d2l.locator('.primary-artifact').boundingBox())!.width).toBeGreaterThan((await d2l.locator('.supporting-artifact').boundingBox())!.width * 1.7);
  const ring = page.locator('.ring-feature');
  expect((await ring.locator('.primary-artifact').boundingBox())!.width).toBeGreaterThan((await ring.locator('.supporting-artifact').boundingBox())!.width * 1.7);
  const community = page.locator('.community-feature');
  expect((await community.locator('.primary-artifact').boundingBox())!.width).toBeGreaterThan((await community.locator('.spatial-artifact img').boundingBox())!.width);
  // Wide study → render on left → event screen on right; no additional motion is involved.
  expect((await ring.locator('.project-visual').boundingBox())!.x).toBeLessThan((await ring.locator('.feature-heading').boundingBox())!.x);
  expect((await community.locator('.project-visual').boundingBox())!.x).toBeGreaterThan((await community.locator('.feature-heading').boundingBox())!.x);
});
