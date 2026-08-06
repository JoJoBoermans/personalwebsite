# Production deployment checklist

## Configuration

- [ ] Set `PUBLIC_SITE_URL` to the final HTTPS origin.
- [ ] Set operator name, address and registration number where applicable.
- [ ] Set public contact and privacy email addresses.
- [ ] Decide whether GA4 is needed; leave `PUBLIC_GA4_ID` blank when it is not.
- [ ] Review privacy and cookie text against the real Netlify, analytics and email configuration.

## Dependencies and source

- [ ] Run `npm install` against a trusted registry.
- [ ] Review and commit the generated `package-lock.json`.
- [ ] Run `npm audit` and resolve relevant production findings.
- [ ] Confirm Node 22.16.0 is used locally and on Netlify.

## Release QA

- [ ] Run `npx playwright install --with-deps`.
- [ ] Run `npm run qa` successfully.
- [ ] Start the production preview and run `npm run lighthouse`.
- [ ] Review Playwright traces/screenshots for failures.
- [ ] Confirm there are no serious or critical axe violations.
- [ ] Test keyboard-only use through every planner step.
- [ ] Test touch dragging and button-based movement on a real phone.
- [ ] Verify SVG, PNG, JSON, print and clipboard outputs.
- [ ] Test corrupted and oversized JSON imports.
- [ ] Test with local storage blocked and full.
- [ ] Test analytics rejection and acceptance with the real GA4 property.
- [ ] Confirm no exact dimensions or labels appear in analytics debug events.

## SEO and public URL

- [ ] Run `npm run check:dist` after setting the real public URL.
- [ ] Verify canonical URLs, Open Graph image and social preview.
- [ ] Validate rendered structured data.
- [ ] Open `/sitemap.xml` and `/robots.txt` on production.
- [ ] Check all routes and the 404 page.
- [ ] Add the site to Google Search Console after domain verification.

## Netlify and security

- [ ] Confirm HTTPS and the primary-domain redirect.
- [ ] Inspect Content Security Policy and other response headers.
- [ ] Verify immutable caching on `/_astro/*` assets.
- [ ] Ensure deploy previews are not accidentally indexed.
- [ ] Recheck CSP before adding any new third-party script.

## Launch decision

- [ ] No unresolved critical, serious or high-severity issues.
- [ ] Legal/operator details are complete.
- [ ] The main planner flow works in Chromium, WebKit and Firefox/Safari manual checks.
- [ ] Mobile performance and accessibility meet the documented release thresholds.
