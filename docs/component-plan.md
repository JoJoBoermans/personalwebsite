# Component plan

## Astro components

### `SeoHead.astro`

Receives title, description, canonical path, image, robots directive, and JSON-LD blocks.

### `SiteHeader.astro`

Static navigation with a mobile disclosure menu. No framework hydration unless accessibility testing proves native behavior insufficient.

### `SiteFooter.astro`

Static navigation, privacy links, and a button that opens cookie settings.

### `Breadcrumbs.astro`

Visible breadcrumb navigation plus matching `BreadcrumbList` JSON-LD.

### `GuideCard.astro`

Reusable guide summary with descriptive link text.

## React planner hierarchy

```text
ShelfSketchApp
├── PlannerHeader
├── ProjectWizard
│   ├── SpaceForm
│   ├── ItemList
│   │   └── ItemEditor
│   └── PreferencesForm
├── LayoutWorkspace
│   ├── LayoutTabs
│   ├── LayoutCanvas
│   │   └── PlacedObject
│   ├── ObjectControls
│   └── ResultSummary
├── ProjectActions
│   ├── ExportPanel
│   ├── ImportPanel
│   └── LocalDataPanel
└── LiveRegion
```

## Responsibility rules

- Forms validate and dispatch actions; they do not run packing algorithms.
- The engine receives immutable normalized input and returns immutable layout results.
- SVG rendering does not recompute layout geometry.
- Explanations are generated in the engine layer and displayed by result components.
- Accessible text summaries are generated from the same result object as the SVG.

## Mobile composition

Mobile uses sequential panels with a persistent progress indicator. Desktop presents input and visualization side by side. Both use the same components and state.
