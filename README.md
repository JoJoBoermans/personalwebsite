# ShelfSketch

ShelfSketch is a privacy-first, browser-based visual fit planner for rectangular storage bins, boxes, and other objects inside an existing shelf, cabinet opening, or open cubby.

Users enter the usable inside dimensions of a space and the outside dimensions of their objects. ShelfSketch generates three practical candidate layouts, explains what does not fit, and lets users adjust and export the result without creating an account.

## Release status

**Version:** 1.0.0 release candidate  
**Application phases:** 0–7 implemented  
**Backend:** none  
**Deployment:** static Astro build on Netlify  
**Project data:** calculated and stored locally in the browser

The source validators, strict TypeScript fallback checks, packing tests, editor tests and I/O runtime checks pass in the implementation environment. A real Astro install/build, official Vitest run, Playwright browser run, axe scan and Lighthouse run remain mandatory before public production launch because the implementation environment could not download the npm dependencies. See [`PHASE7_TEST_REPORT.md`](PHASE7_TEST_REPORT.md).

## Implemented MVP

- Responsive five-step planner: Space, Items, Preferences, Review and Layouts
- Centimetre and inch input with integer-millimetre internal storage
- Deterministic Compact, Easy Access and Balanced packing modes
- Width, height, depth, gap, quantity, rotation and stackability validation
- Concrete explanations for items that do not fit
- Scale-accurate interactive SVG editor
- Mouse, touch, keyboard and explicit button controls
- Undo, redo, reset, zoom and textual layout summaries
- Full local session persistence, including manual edits
- Strictly validated JSON import and portable project export
- SVG, PNG, print and measurement-list output
- Original storage-measurement and planning guides
- Technical SEO, sitemap, robots and structured data
- Consent-gated optional GA4 analytics using broad event categories only
- Privacy, cookies, contact, changelog and accessible 404 pages
- No account, cloud project database, retailer catalogue, advertising or automatic product integration

## Technology

- Node.js 22.16.0 (`.nvmrc`)
- Astro 7.1.5, static output
- `@astrojs/react` 6.0.1
- React 19.2.8
- TypeScript 6.0.3 in strict mode
- Vitest 4.1.10
- Playwright 1.62.0
- `@axe-core/playwright` 4.12.1
- Lighthouse 13.4.1
- SVG for the interactive visualisation
- Netlify for static hosting

## Local installation

Requirements:

- Node.js 22.12 or newer; Node 22.16.0 is pinned in `.nvmrc`
- npm
- Internet access to the public npm registry or a mirror containing all pinned packages

```bash
nvm use
npm install
npx playwright install --with-deps
cp .env.example .env
npm run dev
```

Open the local URL printed by Astro.

A package lock is not included because the implementation environment could not complete the first dependency installation. Run `npm install` in a normal networked environment, review the generated `package-lock.json`, and commit it before production deployment.

## Environment variables

```dotenv
PUBLIC_SITE_URL=https://your-real-domain.example
PUBLIC_GA4_ID=
PUBLIC_OPERATOR_NAME=
PUBLIC_OPERATOR_ADDRESS=
PUBLIC_REGISTRATION_NUMBER=
PUBLIC_CONTACT_EMAIL=
PUBLIC_PRIVACY_EMAIL=
```

### Required before public launch

Set at minimum:

- `PUBLIC_SITE_URL`
- `PUBLIC_OPERATOR_NAME`
- `PUBLIC_OPERATOR_ADDRESS`
- `PUBLIC_CONTACT_EMAIL`
- `PUBLIC_PRIVACY_EMAIL`

Set `PUBLIC_REGISTRATION_NUMBER` when applicable.

Leave `PUBLIC_GA4_ID` blank to disable analytics. When it is present, GA4 is still loaded only after explicit analytics consent.

## Development commands

```bash
npm run dev                 # Astro development server
npm run check               # Astro and TypeScript checking
npm run build               # Static production build in dist/
npm run preview             # Preview the built site
npm run check:dist          # Validate built metadata, assets and internal links
```

### Unit and runtime tests

```bash
npm test
npm run test:packing
npm run test:editor
npm run test:io
```

Fallback runtime checks used during implementation:

```bash
npm run test:phase3-runtime
npm run test:phase4-runtime
npm run test:phase5-runtime
```

### Browser and accessibility tests

```bash
npm run test:e2e
npm run test:e2e:chromium
npm run test:a11y
```

Playwright builds and starts the site automatically unless `PLAYWRIGHT_BASE_URL` points to an already running deployment.

### Full release QA

```bash
npm run qa
```

This runs:

1. Astro checking
2. Production build
3. Built-site link and metadata validation
4. All source validators and unit tests
5. Desktop Chromium and mobile WebKit Playwright tests
6. axe accessibility checks included in the Playwright suite

### Lighthouse

Start the production preview in one terminal:

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4321
```

Then run in another terminal:

```bash
LIGHTHOUSE_URL=http://127.0.0.1:4321/ npm run lighthouse
```

Reports are written to `reports/lighthouse/`. Configured minimum scores are:

- Performance: 75
- Accessibility: 95
- Best Practices: 90
- SEO: 95

These thresholds are release gates, not claims about the current unbuilt source package.

## Netlify deployment

1. Push the project to a Git repository.
2. Create a new Netlify site from that repository.
3. Use Node 22.16.0.
4. Build command: `npm run build`.
5. Publish directory: `dist`.
6. Configure the public environment variables in Netlify.
7. Run `npm run qa` in CI before deploying production.
8. Connect the real domain and update `PUBLIC_SITE_URL`.
9. Verify the generated canonical URLs, sitemap, robots file, consent behavior and security headers on the public URL.

`netlify.toml` already includes static build settings, immutable caching for Astro assets and baseline security headers. Review the Content Security Policy whenever a new third-party service is introduced.

## Project structure

```text
ShelfSketch/
├── public/                 Static favicon, manifest and social image
├── schemas/                Portable project JSON schema
├── scripts/                Phase validators, fallback tests and release QA
├── src/
│   ├── components/
│   │   ├── astro/          Static shared UI and consent manager
│   │   └── planner/        React planner, SVG editor and export UI
│   ├── data/               Validated example project
│   ├── layouts/            Astro page layouts
│   ├── lib/
│   │   ├── editor/         Manual move, rotation and history logic
│   │   ├── io/             Strict import/export and generated outputs
│   │   └── packing/        Packing strategies, geometry and scoring
│   ├── pages/              Static routes and SEO guides
│   ├── styles/             Design tokens, global and print CSS
│   └── types/              Domain contracts
├── tests/e2e/              Playwright, responsive, consent and axe tests
├── playwright.config.ts
├── astro.config.mjs
├── netlify.toml
└── package.json
```

More technical detail is in [`docs/architecture.md`](docs/architecture.md), [`docs/packing-strategy.md`](docs/packing-strategy.md), and [`docs/test-strategy.md`](docs/test-strategy.md).

## Local storage and privacy behavior

ShelfSketch uses browser storage only for requested local functionality:

- latest project and complete planner session
- generated layouts and manual edits
- display unit and current step
- onboarding state
- analytics consent choice

The packing engine, editor, JSON validation, SVG generation and measurement copy are local. Exact dimensions, project names, item labels and file contents are excluded from analytics calls.

Users can remove project/session storage through **Delete local ShelfSketch data**. Browser settings may also remove all site data. Downloaded files must be deleted separately by the user.

## Analytics configuration

Planner events are routed through `src/lib/analytics.ts`. Tracking is ignored unless:

1. `PUBLIC_GA4_ID` is configured; and
2. the visitor accepted analytics.

Only broad categories, counts and status values may be sent. Do not add exact measurements, labels, names, free text or file contents to analytics parameters.

## Adding a second language

The current public content is English. Before adding Dutch or another language:

1. Move planner strings and shared navigation labels into typed locale dictionaries.
2. Add locale-aware routes such as `/nl/` while keeping a single canonical per language.
3. Translate complete pages rather than publishing partially translated pages.
4. Add `hreflang` alternates and locale-specific Open Graph metadata.
5. Localise decimal formatting, units and validation messages without changing internal millimetre values.
6. Run the complete Playwright and accessibility suite for each locale.

Do not duplicate thin pages solely to target translated keywords.

## Known limitations

- Only rectangular spaces and upright rectangular objects are supported.
- Base rotation swaps width and depth; arbitrary 3D rotations are not supported.
- The packing engine is heuristic and does not claim mathematical optimality.
- Handles, lids, wheels, rounded corners, sloped sides and measurement error must be included manually in outside dimensions.
- There is no cloud sync, account, collaboration, public share URL or product catalogue.
- Browser notification, camera, AR and 3D features are intentionally excluded.
- Operator, contact and domain environment variables must be configured before launch.
- The official dependency installation, Astro build, Playwright, axe and Lighthouse runs remain outstanding in this implementation environment.

See [`KNOWN_LIMITATIONS.md`](KNOWN_LIMITATIONS.md) and [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md).

## Release documents

- [`PHASE7_TEST_REPORT.md`](PHASE7_TEST_REPORT.md)
- [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md)
- [`KNOWN_LIMITATIONS.md`](KNOWN_LIMITATIONS.md)
- [`PHASE_STATUS.md`](PHASE_STATUS.md)
- [`ROADMAP.md`](ROADMAP.md)
