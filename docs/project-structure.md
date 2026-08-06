# Definitive project structure

The following structure will be created in Phase 1 and expanded in later phases.

```text
ShelfSketch/
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── social/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── astro/
│   │   │   ├── SiteHeader.astro
│   │   │   ├── SiteFooter.astro
│   │   │   ├── Breadcrumbs.astro
│   │   │   ├── SeoHead.astro
│   │   │   ├── GuideCard.astro
│   │   │   └── CookiePreferencesLink.astro
│   │   └── planner/
│   │       ├── ShelfSketchApp.tsx
│   │       ├── ProjectWizard.tsx
│   │       ├── SpaceForm.tsx
│   │       ├── ItemList.tsx
│   │       ├── ItemEditor.tsx
│   │       ├── PreferencesForm.tsx
│   │       ├── LayoutTabs.tsx
│   │       ├── LayoutCanvas.tsx
│   │       ├── ObjectControls.tsx
│   │       ├── ResultSummary.tsx
│   │       ├── ExportPanel.tsx
│   │       ├── ImportPanel.tsx
│   │       ├── LocalDataPanel.tsx
│   │       └── LiveRegion.tsx
│   ├── content/
│   │   └── guides/
│   ├── data/
│   │   ├── example-project.ts
│   │   ├── presets.ts
│   │   └── messages.ts
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── GuideLayout.astro
│   │   └── ToolLayout.astro
│   ├── lib/
│   │   ├── analytics/
│   │   │   ├── consent.ts
│   │   │   ├── events.ts
│   │   │   └── ga4.ts
│   │   ├── export/
│   │   │   ├── image.ts
│   │   │   ├── project-file.ts
│   │   │   └── text-list.ts
│   │   ├── packing/
│   │   │   ├── contracts.ts
│   │   │   ├── normalize.ts
│   │   │   ├── expand-items.ts
│   │   │   ├── depth-check.ts
│   │   │   ├── candidate-orders.ts
│   │   │   ├── maxrects.ts
│   │   │   ├── shelf-pack.ts
│   │   │   ├── score.ts
│   │   │   ├── explain.ts
│   │   │   └── generate-layouts.ts
│   │   ├── storage/
│   │   │   ├── local-project.ts
│   │   │   └── preferences.ts
│   │   ├── validation/
│   │   │   ├── project.ts
│   │   │   └── numbers.ts
│   │   └── units/
│   │       ├── convert.ts
│   │       └── format.ts
│   ├── pages/
│   │   ├── index.astro
│   │   ├── tool.astro
│   │   ├── example.astro
│   │   ├── how-it-works.astro
│   │   ├── measurement-guide.astro
│   │   ├── guides/
│   │   │   ├── index.astro
│   │   │   ├── shelf-space-calculator.astro
│   │   │   ├── pantry-bin-planner.astro
│   │   │   ├── how-many-storage-bins-fit.astro
│   │   │   ├── storage-bin-size-guide.astro
│   │   │   └── cabinet-storage-layout-planner.astro
│   │   ├── about.astro
│   │   ├── privacy.astro
│   │   ├── cookies.astro
│   │   ├── contact.astro
│   │   ├── changelog.astro
│   │   └── 404.astro
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── global.css
│   │   ├── utilities.css
│   │   └── print.css
│   ├── types/
│   │   └── domain.ts
│   └── env.d.ts
├── tests/
│   ├── unit/
│   ├── fixtures/
│   └── e2e/
├── docs/
├── schemas/
├── astro.config.mjs
├── netlify.toml
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Boundary rules

- Astro components may import static content and presentational data.
- The React planner owns only interactive project state.
- Packing functions remain framework-independent TypeScript.
- Browser APIs are isolated behind storage, export, and analytics modules.
- Exact user dimensions must never be sent to analytics.
- SEO pages must render as static HTML and must not depend on the React application.
