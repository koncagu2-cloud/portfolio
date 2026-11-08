import { test, expect } from '@playwright/test';

test('portrait crown responds to hover, keyboard, and persistent selection', async ({ page }) => {
  await page.goto('/#about');
  const button = page.getByRole('button', { name: 'Keep crown visible' });
  const crown = page.locator('.portrait-crown');
  await expect(button).toBeEnabled();
  await page.mouse.move(0, 0);
  await expect(crown).toHaveCSS('opacity', '0');
  await button.hover();
  await expect(crown).toHaveCSS('opacity', '1');
  await page.mouse.move(0, 0);
  await expect(crown).toHaveCSS('opacity', '0');
  await button.focus();
  await expect(crown).toHaveCSS('opacity', '1');
  await expect(button).toHaveCSS('outline-style', 'solid');
  await button.press('Enter');
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await button.press('Escape');
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await expect(crown).toHaveCSS('opacity', '0');
  await expect(button).toBeFocused();
  await button.press('Space');
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Tab');
  await expect(crown).toHaveCSS('opacity', '1');
  await button.hover();
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await expect(crown).toHaveCSS('opacity', '0');
});

test('pointer feedback keeps native cursor and respects motion preference changes', async ({ page }) => {
  await page.goto('/');
  const glow = page.locator('pointer-glow');
  await page.mouse.move(250, 180);
  await expect(glow).toHaveAttribute('data-active', '');
  await expect(glow).toHaveCSS('display', 'block');
  await expect(glow).toHaveCSS('pointer-events', 'none');
  expect(await page.locator('body').evaluate(el => getComputedStyle(el).cursor)).not.toBe('none');
  await page.keyboard.press('Tab');
  await expect(glow).not.toHaveAttribute('data-active');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.mouse.move(300, 200);
  await expect(glow).toHaveCSS('display', 'none');
  await expect(page.locator('.portrait-crown')).toHaveCSS('transition-duration', '0s');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.mouse.move(350, 220);
  await expect(glow).toHaveCSS('display', 'block');
});

test('portrait works on small touch screens in both themes without a mouse glow', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 800 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4322/#about');
  const button = page.getByRole('button', { name: 'Keep crown visible' });
  for (const dark of [false, true]) {
    if (dark) await page.getByRole('button', { name: 'Dark mode' }).click();
    await button.tap();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.portrait-crown')).toHaveCSS('opacity', '1');
    await button.tap();
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('.portrait-crown')).toHaveCSS('opacity', '0');
    await expect(page.locator('pointer-glow')).toHaveCSS('display', 'none');
    const image = button.locator('img');
    await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    const ratios = await image.evaluate((el: HTMLImageElement) => ({ rendered: el.width / el.height, original: el.naturalWidth / el.naturalHeight }));
    expect(ratios.rendered).toBeCloseTo(ratios.original, 2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await context.close();
});

test('portrait remains visible without JavaScript and does not promise unavailable interaction', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4322/#about');
  await expect(page.locator('.portrait-play')).toBeDisabled();
  await expect(page.locator('.portrait-static')).toBeVisible();
  await expect(page.locator('.portrait-instruction')).toBeHidden();
  await expect(page.locator('.portrait-play img')).toBeVisible();
  await context.close();
});
