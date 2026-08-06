import { expect, test } from '@playwright/test';
import { reachExampleLayouts, rejectAnalytics } from './helpers';

test('homepage exposes the primary paths and no broken top-level navigation', async ({ page }) => {
  await page.goto('/');
  await rejectAnalytics(page);
  await expect(page.getByRole('heading', { name: 'See what fits before you buy.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Start planning' }).first()).toHaveAttribute('href', '/tool/');
  await expect(page.getByRole('link', { name: 'Try an example' }).first()).toHaveAttribute('href', '/example/');
  await page.getByRole('link', { name: 'Try an example' }).first().click();
  await expect(page).toHaveURL(/\/example\/$/);
});

test('prefilled project generates three editable layouts', async ({ page }) => {
  await reachExampleLayouts(page);
  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveCount(3);
  await expect(page.getByRole('tab', { name: /Compact/ })).toBeVisible();
  await page.getByRole('tab', { name: /Easy Access/ }).click();
  await expect(page.getByRole('tab', { name: /Easy Access/ })).toHaveAttribute('aria-selected', 'true');

  const objects = page.locator('svg [role="button"]');
  await expect(objects.first()).toBeVisible();
  await objects.first().focus();
  await objects.first().press('ArrowRight');
  await expect(page.getByText(/moved|cannot|blocked|overlap|outside/i).last()).toBeVisible();

  await expect(page.getByRole('button', { name: 'Save project and layouts' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download SVG' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download PNG' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy measurements' })).toBeVisible();
});

test('blank planner validates inputs and supports local save', async ({ page }) => {
  await page.goto('/tool/');
  await rejectAnalytics(page);
  await page.getByLabel('Project name').fill('QA cabinet');
  await page.getByLabel('Inside width').fill('80');
  await page.getByLabel('Inside height').fill('42');
  await page.getByLabel('Usable depth').fill('36');
  await page.getByRole('button', { name: /Continue to items/i }).click();
  await page.getByLabel('Item name').fill('QA bin');
  await page.getByLabel('Width').fill('30');
  await page.getByLabel('Height').fill('20');
  await page.getByLabel('Depth').fill('30');
  await page.getByRole('button', { name: /Continue to preferences/i }).click();
  await page.getByRole('button', { name: /Continue to review/i }).click();
  await page.getByRole('button', { name: 'Save on this device' }).first().click();
  await expect(page.getByText(/Saved locally on this device/)).toBeVisible();
});

test('project JSON downloads and can be imported without a server', async ({ page }) => {
  await page.goto('/example/');
  await rejectAnalytics(page);
  await page.getByRole('button', { name: /Continue to items/i }).click();
  await page.getByRole('button', { name: /Continue to preferences/i }).click();
  await page.getByRole('button', { name: /Continue to review/i }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download project JSON' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.json$/);

  const input = page.getByLabel('Choose a ShelfSketch JSON project file');
  const downloadedPath = await download.path();
  expect(downloadedPath).not.toBeNull();
  await input.setInputFiles(downloadedPath!);
  await expect(page.getByText(/imported|loaded/i).last()).toBeVisible();
});
