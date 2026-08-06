# ShelfSketch Phase 6 test report

Date: 6 August 2026

## Scope

Phase 6 covers substantive content, technical SEO, structured data, privacy and cookie information, analytics consent, broad GA4 events, contact guidance, changelog, sitemap, and robots output.

## Checks completed successfully

### Regression

- Phase 1 source validation
- Phase 2 source validation
- Phase 3 source validation and executable packing scenarios
- Phase 4 source validation and executable editor scenarios
- Phase 5 source validation and executable import/export/session scenarios

### Phase 6 source validation

- All required Phase 6 files exist.
- `package.json` includes version `0.6.0` and `validate:phase6`.
- The global layout includes the consent manager.
- Analytics accept, reject, and preference controls are present.
- The GA script URL appears only inside the consent-controlled dynamic loader.
- The inline consent script contains valid browser JavaScript rather than untranspiled TypeScript syntax.
- Cookie settings can be reopened from the footer and cookie page.
- All specified analytics events are defined and emitted.
- Analytics calls do not include exact dimensions, item labels, or project names.
- Required guides exceed the minimum substantive word-count checks.
- Privacy and cookie notices include local-storage and optional-analytics explanations.
- Calculator and guides include the required structured-data types.
- Sitemap and robots endpoints include the required routes and rules.
- Strict TypeScript checking passes for planner, analytics, packing, editor, and I/O code through the local component test configuration.
- Standalone TypeScript checking passes for analytics, sitemap, and robots endpoints.
- Inline consent JavaScript passes a runtime syntax compilation check.

## Commands executed successfully

```bash
node scripts/validate-phase1.mjs
node scripts/validate-phase2.mjs
node scripts/validate-phase3.mjs
node scripts/validate-phase4.mjs
node scripts/validate-phase5.mjs
node scripts/validate-phase6.mjs
tsc -p tsconfig.phase4-components.json
tsc --noEmit --target ES2022 --module ESNext --moduleResolution Bundler --lib ES2022,DOM src/lib/analytics.ts src/pages/sitemap.xml.ts src/pages/robots.txt.ts
```

The existing Phase 3, 4, and 5 executable runtime checks were also rerun successfully during this phase.

## Environment limitation

The official dependency installation and Astro toolchain could not run because the configured internal npm registry returns `404` for `@astrojs/react@6.0.1`. Therefore the following remain for Phase 7 in a network-connected environment:

```bash
npm install
npm run check
npm run build
npm run preview
npm run test
```

Real browser tests, rendered structured-data inspection, consent behavior in a browser, Lighthouse, and production HTML inspection are not claimed as complete.

## Launch placeholders

The privacy and contact content intentionally contains bracketed placeholders for the real operator, postal address, registration details, contact email, and privacy email. These must be replaced and reviewed before public deployment.
