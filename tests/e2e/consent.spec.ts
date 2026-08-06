import { expect, test } from '@playwright/test';

test('rejecting analytics keeps the site usable and prevents Google Analytics requests', async ({ page }) => {
  const analyticsRequests: string[] = [];
  page.on('request', (request) => {
    if (/googletagmanager|google-analytics/.test(request.url())) analyticsRequests.push(request.url());
  });

  await page.goto('/tool/');
  await expect(page.getByText('Optional analytics')).toBeVisible();
  await page.getByRole('button', { name: 'Reject analytics' }).first().click();
  await expect(page.getByText('Optional analytics')).toBeHidden();
  await page.getByLabel('Project name').fill('No analytics project');
  await expect(page.getByLabel('Project name')).toHaveValue('No analytics project');
  expect(analyticsRequests).toEqual([]);
  await expect.poll(async () => page.evaluate(() => localStorage.getItem('shelfsketch.analytics-consent.v1'))).toBe('denied');
});

test('cookie preferences can be reopened from the footer', async ({ page }) => {
  await page.goto('/cookies/');
  const reject = page.getByRole('button', { name: 'Reject analytics' }).first();
  if (await reject.isVisible()) await reject.click();
  await page.getByRole('button', { name: /cookie settings|manage preferences/i }).last().click();
  await expect(page.getByRole('dialog', { name: 'Analytics preferences' })).toBeVisible();
  await expect(page.getByText('Functional storage')).toBeVisible();
});
