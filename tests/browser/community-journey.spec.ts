import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const path = '/work/community-spaces/';

test('four original states retain keyboard focus, clear progress and complete reading mode', async ({ page }) => {
  await page.goto(path);
  await expect(page.locator('[data-step-target]')).toHaveCount(4);
  for (let index = 0; index < 4; index++) {
    const button = page.locator('[data-step-target]').nth(index);
    await button.focus(); await page.keyboard.press(index % 2 ? 'Space' : 'Enter');
    await expect(button).toBeFocused(); await expect(button).toHaveAttribute('aria-current', 'step');
    await expect(page.locator('[data-step]:visible')).toHaveCount(1);
    await expect(page.locator('[data-progress]')).toContainText(`Step ${index + 1} of 4`);
  }
  const all = page.getByRole('button', { name: 'Read all steps', exact: true });
  await all.focus(); await page.keyboard.press('Space');
  await expect(all).toBeFocused(); await expect(all).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-step]:visible')).toHaveCount(4);
  await expect(page.locator('[data-progress]')).toHaveText('All 4 original interface states');
  await all.click(); await expect(page.locator('#journey-confirmation')).toBeVisible();
});

test('research links and direct fragments reveal the appropriate concept', async ({ page }) => {
  await page.goto(path); await page.locator('#need-participation a').click();
  await expect(page).toHaveURL(/#journey-reserve$/);
  await expect(page.locator('#journey-reserve h3')).toBeFocused();
  await expect(page.locator('[data-progress]')).toContainText('Step 3 of 4');
  await page.goto(`${path}#journey-details`);
  await expect(page.locator('#journey-details')).toBeVisible();
  await expect(page.locator('[data-step-target="details"]')).toHaveAttribute('aria-current', 'step');
});

test('portrait screens use available mobile width and annotations preserve original sources', async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 }); await page.goto(path);
    await page.getByRole('button', { name: 'Reserve a place', exact: true }).click();
    const image = page.locator('#journey-reserve img'); const src = await image.getAttribute('src');
    await image.scrollIntoViewIfNeeded(); await expect(image).toHaveJSProperty('complete', true);
    const size = await image.boundingBox(); expect(size!.width).toBeLessThanOrEqual(393);
    if (width === 390) expect(size!.width).toBeGreaterThan(320);
    await page.locator('#journey-reserve summary').click();
    await expect(page.locator('#journey-reserve details ol')).toBeVisible();
    await expect(image).toHaveAttribute('src', src!);
    if (width === 1440) await expect(page.locator('#journey-reserve .journey-markers')).toBeVisible();
    else if (width <= 390) await expect(page.locator('#journey-reserve .journey-markers')).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('all four states and annotations work without JavaScript or hover', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false }); const page = await context.newPage();
  await page.goto(`http://127.0.0.1:4322${path}`);
  await expect(page.locator('[data-guided-controls]')).toBeHidden();
  await expect(page.locator('[data-step]:visible')).toHaveCount(4);
  await page.getByRole('navigation', { name: 'Community journey steps' }).getByRole('link', { name: /See confirmation/ }).click();
  await expect(page).toHaveURL(/#journey-confirmation$/);
  await page.locator('#journey-confirmation summary').click();
  await expect(page.locator('#journey-confirmation details')).toContainText('Continue Shopping label remains unchanged');
  await context.close();
});

test('every state and reading mode passes light/dark audits, reduced motion and enlarged text', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 }); await page.goto(path);
    for (const dark of [false, true]) {
      const toggle = page.getByRole('button', { name: 'Dark mode', exact: true });
      if ((await toggle.getAttribute('aria-pressed')) !== String(dark)) await toggle.click();
      for (const button of await page.locator('[data-step-target]').all()) {
        await button.click(); const panel = page.locator('[data-step]:visible');
        if ((await panel.locator('details').getAttribute('open')) === null) await panel.locator('summary').click();
        expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
      }
      await page.getByRole('button', { name: 'Read all steps', exact: true }).click();
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
    }
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('touch selection and original wording do not imply real booking or attendance', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); const page = await context.newPage();
  await page.goto(`http://127.0.0.1:4322${path}`);
  await page.getByRole('button', { name: 'See confirmation', exact: true }).tap();
  await page.locator('#journey-confirmation summary').tap();
  await expect(page.locator('#journey-confirmation details ol')).toBeVisible();
  await expect(page.locator('#journey-confirmation')).toContainText('not an operating registration result');
  await expect(page.locator('#reflection')).toContainText('“Continue Shopping” action');
  await expect(page.locator('.project-status')).toContainText('not verified prototype connections');
  await expect(page.locator('.service-journey')).toContainText('Intended visit to the proposed space');
  await context.close();
});
