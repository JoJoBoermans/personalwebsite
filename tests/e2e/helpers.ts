import { expect, type Page } from '@playwright/test';

export async function rejectAnalytics(page: Page): Promise<void> {
  const reject = page.getByRole('button', { name: 'Reject analytics' }).first();
  if (await reject.isVisible().catch(() => false)) await reject.click();
}

export async function reachExampleLayouts(page: Page): Promise<void> {
  await page.goto('/example/');
  await rejectAnalytics(page);
  await expect(page.getByRole('heading', { name: 'Measure the usable space' })).toBeVisible();
  await page.getByRole('button', { name: /Continue to items/i }).click();
  await page.getByRole('button', { name: /Continue to preferences/i }).click();
  await page.getByRole('button', { name: /Continue to review/i }).click();
  await page.getByRole('button', { name: 'Generate three layouts' }).click();
  await expect(page.getByRole('heading', { name: 'Compare and edit the layouts' })).toBeVisible();
}
