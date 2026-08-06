# Phase 0 summary

## Product decision

ShelfSketch will launch as a static, English-first website whose core tool runs entirely in the browser. It will calculate practical two-dimensional front-view layouts for rectangular objects, while depth is checked as a hard constraint.

## Architectural decision

- Astro generates the static website and content pages.
- React powers only the interactive planner.
- SVG renders the shelf and objects.
- No backend, database, accounts, product catalog, scraping, camera features, AI API, AR, or 3D is included.
- `localStorage` stores one recent project and preferences in the MVP.
- JSON files provide explicit user-controlled backup and restore.
- Netlify serves the static `dist` output.

## Algorithm decision

The engine will generate multiple candidate layouts with deterministic heuristics rather than claim a mathematically optimal solution. Candidate generation will combine several orderings and packing strategies. Each candidate will be scored separately for Compact, Easy Access, and Balanced modes.

## Product constraint

The MVP must prove that users will measure a space, enter object dimensions, generate a layout, compare alternatives, and save or export the result. Features that do not help validate that chain are postponed.

## Key implementation risk

The main technical risk is not rendering but producing layouts that feel practical. The engine therefore needs transparent explanations, deterministic results, manual correction, and extensive edge-case tests.
