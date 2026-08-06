import { expect, test } from '@playwright/test';
import { rejectAnalytics } from './helpers';

test('planner does not create page-level horizontal overflow', async ({ page }) => {
  await page.goto('/example/');
  await rejectAnalytics(page);
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  await expect(page.getByRole('heading', { name: 'Measure the usable space' })).toBeVisible();
});

test('skip link reaches main content', async ({ page }) => {
  await page.goto('/');
  await rejectAnalytics(page);
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to main content' });
  await expect(skip).toBeFocused();
  await skip.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
});
