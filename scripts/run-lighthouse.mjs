import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

const url = process.env.LIGHTHOUSE_URL ?? 'http://127.0.0.1:4321/';
const outDir = resolve(process.cwd(), 'reports/lighthouse');
await mkdir(outDir, { recursive: true });
const chrome = await launch({ chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'] });
try {
  const result = await lighthouse(url, {
    port: chrome.port,
    output: ['json', 'html'],
    logLevel: 'info',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'mobile',
    screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 3, disabled: false },
  });
  if (!result?.lhr || !result.report) throw new Error('Lighthouse did not return a report.');
  const reports = Array.isArray(result.report) ? result.report : [result.report];
  await writeFile(resolve(outDir, 'report.json'), reports[0] ?? '', 'utf8');
  await writeFile(resolve(outDir, 'report.html'), reports[1] ?? '', 'utf8');
  const thresholds = { performance: 0.75, accessibility: 0.95, 'best-practices': 0.90, seo: 0.95 };
  const failures = [];
  for (const [category, threshold] of Object.entries(thresholds)) {
    const score = result.lhr.categories[category]?.score ?? 0;
    console.log(`${category}: ${Math.round(score * 100)}`);
    if (score < threshold) failures.push(`${category} ${Math.round(score * 100)} is below ${Math.round(threshold * 100)}`);
  }
  if (failures.length) throw new Error(failures.join('; '));
} finally {
  await chrome.kill();
}
