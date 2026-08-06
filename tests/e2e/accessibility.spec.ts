import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { reachExampleLayouts, rejectAnalytics } from './helpers';

const publicPages = ['/', '/tool/', '/measurement-guide/', '/guides/', '/privacy/', '/cookies/'];

for (const route of publicPages) {
  test(`has no serious or critical axe violations: ${route}`, async ({ page }) => {
    await page.goto(route);
    await rejectAnalytics(page);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    const blocking = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
}

test('generated SVG editor has no serious or critical axe violations', async ({ page }) => {
  await reachExampleLayouts(page);
  const results = await new AxeBuilder({ page }).include('.planner-app').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  const blocking = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
});
