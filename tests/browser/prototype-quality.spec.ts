import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const widths = [320, 375, 768, 1024, 1440];

test('walkthrough selection survives reload and its current-result link supports keyboard navigation', async ({ page }) => {
  for (const slug of ['d2l-redesign', 'community-spaces']) {
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/work/${slug}/`);
      const last = page.locator('[data-step-target]').last();
      const id = await last.getAttribute('data-step-target');
      await last.click();
      await expect(page).toHaveURL(new RegExp(`#journey-${id}$`));
      await page.reload();
      await expect(page.locator(`[data-step-target="${id}"]`)).toHaveAttribute('aria-current', 'step');
      const result = page.getByRole('link', { name: 'View selected screen' });
      await page.keyboard.press('Tab'); await result.focus(); await page.keyboard.press('Enter');
      await expect(page.locator(`#journey-${id} h3`)).toBeFocused();
      await expect(page.locator(`#journey-${id} h3`)).toBeInViewport();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});

test('Ring phone and day selections reveal their results across all requested widths', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of widths) {
    await page.setViewportSize({ width, height: 812 });
    await page.goto('/prototypes/apple-ring/index.html');
    await page.locator('.feature-select [data-view="sleep"]').click();
    const phoneHeading = page.locator('#phone-sleep h3');
    await expect(phoneHeading).toBeInViewport({ ratio: 1 });
    await page.locator('.local [data-open-try]').click();
    await page.locator('#try-day-tab').click();
    for (const stage of ['afternoon', 'evening', 'morning']) {
      await page.locator(`[data-day-stage="${stage}"]`).click();
      await expect(page.locator('#day-phone-title')).toBeInViewport({ ratio: 1 });
      await expect(page.locator(`[data-day-stage="${stage}"]`)).toHaveAttribute('aria-pressed', 'true');
    }
    expect(await page.locator('#try-ring').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.locator('.local [data-open-try]')).toBeFocused();
  }
});

test('Ring settings synchronize, reset keeps text preference, and setup remains explicitly simulated', async ({ page }) => {
  await page.goto('/prototypes/apple-ring/index.html');
  await page.locator('#setup-connect').click();
  await page.locator('#setup-sleep').uncheck();
  await page.locator('#setup-continue').click();
  await expect(page.locator('#setup-result')).toContainText('heart rate');
  await expect(page.locator('#sleep-access')).not.toBeChecked();
  await page.locator('.local [data-open-try]').click();
  await page.locator('#try-day-tab').click();
  await expect(page.locator('#day-measure')).toHaveText('Preview off');
  await page.locator('#day-settings-button').click();
  await page.locator('#day-sleep-access').check();
  await page.locator('[data-day-text="large"]').click();
  await page.locator('#try-ring [data-reset-demo]').click();
  await expect(page.locator('[data-day-text="large"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#try-missing-night')).not.toBeChecked();
  await expect(page.locator('#day-sleep-access')).toBeChecked();
  await page.keyboard.press('Escape');
  await expect(page.locator('#sleep-access')).toBeChecked();
  await expect(page.locator('[data-phone-text="large"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#setup-connect')).toBeVisible();
});

test('Ring viewer failure preserves finish selection, sample day and keyboard escape', async ({ page }) => {
  await page.route('**/ring-model.js*', route => route.abort());
  await page.goto('/prototypes/apple-ring/index.html');
  await page.locator('.local [data-open-try]').click();
  await expect(page.locator('#viewer-status')).toContainText('3D is unavailable');
  await expect(page.locator('#viewer-fallback')).toBeVisible();
  await expect(page.locator('#ring-rotation')).toBeDisabled();
  await page.locator('[data-try-finish="1"]').click();
  await expect(page.locator('#try-finish-name')).toHaveText('Black Titanium');
  await page.locator('#try-day-shortcut').click();
  await expect(page.locator('#try-day-tab')).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Escape');
  await expect(page.locator('.local [data-open-try]')).toBeFocused();
  await expect(page.locator('#finish-name')).toHaveText('Black Titanium');
});

test('Ring dialog sample states pass automated accessibility sampling at all requested widths', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/prototypes/apple-ring/index.html');
    await page.locator('.local [data-open-try]').click();
    await page.locator('#try-day-tab').click();
    await page.locator('[data-day-stage="evening"]').click();
    await page.locator('[data-reflection="Rested"]').click();
    await expect(page.locator('#reflection-result')).toContainText('Sample reflection: Rested');
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(result.violations).toEqual([]);
    await page.keyboard.press('Escape');
  }
});

test('touch visitors can reach selected screens and day results without hover', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  for (const slug of ['d2l-redesign', 'community-spaces']) {
    await page.goto(`http://127.0.0.1:4322/work/${slug}/`);
    await page.locator('[data-step-target]').last().tap();
    await page.locator('[data-view-result]').tap();
    await expect(page.locator('[data-step]:visible h3')).toBeInViewport();
  }
  await page.goto('http://127.0.0.1:4322/prototypes/apple-ring/index.html');
  await page.locator('.local [data-open-try]').tap();
  await page.locator('#try-day-tab').tap();
  await page.locator('[data-day-stage="evening"]').tap();
  await expect(page.locator('#day-phone-title')).toBeInViewport({ ratio: 1 });
  await page.locator('#try-close').tap();
  await expect(page.locator('#try-ring')).not.toBeVisible();
  await context.close();
});
