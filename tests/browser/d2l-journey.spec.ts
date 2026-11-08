import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const path = '/work/d2l-redesign/';

test('guided steps preserve focus, expose one original state, and offer a complete reading mode', async ({ page }) => {
  await page.goto(path);
  const steps = page.locator('[data-step-target]');
  await expect(page.locator('[data-step]:visible')).toHaveCount(1);
  for (let index = 0; index < 3; index++) {
    const button = steps.nth(index);
    await button.focus(); await page.keyboard.press(index === 1 ? 'Space' : 'Enter');
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute('aria-current', 'step');
    await expect(page.locator('[data-step-target][aria-current]')).toHaveCount(1);
    await expect(page.locator('[data-step]:visible')).toHaveCount(1);
    await expect(page.locator('[data-step]').nth(index)).toBeVisible();
    await expect(page.locator('[data-progress]')).toContainText(`Step ${index + 1} of 3`);
  }
  const all = page.getByRole('button', { name: 'Read all steps', exact: true });
  await all.focus(); await page.keyboard.press('Space');
  await expect(all).toBeFocused(); await expect(all).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-step]:visible')).toHaveCount(3);
  await expect(page.locator('[data-progress]')).toHaveText('All 3 original interface states');
  await all.click(); await expect(page.locator('#journey-record')).toBeVisible();
  await expect(page.locator('#journey-file')).toBeHidden();
});

test('finding links and direct fragments reveal the correct state rather than a hidden target', async ({ page }) => {
  await page.goto(path);
  await page.locator('#finding-file .finding-target').click();
  await expect(page).toHaveURL(/#journey-file$/);
  await expect(page.locator('#journey-file h3')).toBeFocused();
  await expect(page.locator('#journey-file')).toBeVisible();
  await expect(page.locator('[data-progress]')).toContainText('Step 2 of 3');
  await page.goto(`${path}#journey-record`);
  await expect(page.locator('#journey-record')).toBeVisible();
  await expect(page.locator('[data-step-target="record"]')).toHaveAttribute('aria-current', 'step');
});

test('optional annotations leave original image sources intact and work on touch-size layouts', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 }); await page.goto(path);
    await page.getByRole('button', { name: 'Review selected file', exact: true }).click();
    const panel = page.locator('#journey-file'); const image = panel.locator('img');
    const source = await image.getAttribute('src');
    const summary = panel.locator('summary');
    await summary.focus(); await page.keyboard.press('Enter');
    await expect(panel.locator('details')).toHaveAttribute('open', '');
    await expect(panel.getByText('Name the chosen file.', { exact: false })).toBeVisible();
    await expect(image).toHaveAttribute('src', source!);
    if (width === 1440) await expect(panel.locator('.journey-markers')).toBeVisible();
    await page.keyboard.press('Enter'); await expect(panel.locator('.journey-markers')).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('every state and annotation remains accessible without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false }); const page = await context.newPage();
  await page.goto(`http://127.0.0.1:4322${path}`);
  await expect(page.locator('[data-guided-controls]')).toBeHidden();
  await expect(page.locator('[data-step]:visible')).toHaveCount(3);
  await page.getByRole('navigation', { name: 'Student journey steps' }).getByRole('link', { name: /Review selected file/ }).click();
  await expect(page).toHaveURL(/#journey-file$/);
  await page.locator('#journey-file summary').click();
  await expect(page.locator('#journey-file details')).toHaveAttribute('open', '');
  await expect(page.locator('#journey-file')).toContainText('not evidence of replacing an already-submitted file');
  await context.close();
});

test('all states, reading mode and annotations pass automated audits with reduced motion and enlarged text', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 }); await page.goto(path);
    for (const dark of [false, true]) {
      const toggle = page.getByRole('button', { name: 'Dark mode', exact: true });
      if ((await toggle.getAttribute('aria-pressed')) !== String(dark)) await toggle.click();
      for (const button of await page.locator('[data-step-target]').all()) {
        await button.click();
        const panel = page.locator('[data-step]:visible');
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

test('touch controls select states and reveal annotation text without requiring hover', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:4322${path}`);
  await page.getByRole('button', { name: 'Review selected file', exact: true }).tap();
  await expect(page.locator('#journey-file')).toBeVisible();
  await page.locator('#journey-file summary').tap();
  await expect(page.locator('#journey-file details ol')).toBeVisible();
  await page.getByRole('button', { name: 'Read all steps', exact: true }).tap();
  await expect(page.locator('[data-step]:visible')).toHaveCount(3);
  await context.close();
});
