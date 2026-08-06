# Architecture

## Runtime model

ShelfSketch is a static website. Astro prerenders every route at build time. The planner is loaded as a client-side React island only on `/tool/`, `/example/`, and selected guide pages where an embedded example is justified.

## Data flow

```text
User input
   ↓
Validation and unit normalization
   ↓
Project state in React
   ↓
Depth eligibility check
   ↓
Expanded object instances
   ↓
Candidate order generation
   ↓
Multiple 2D packing heuristics
   ↓
Candidate scoring by mode
   ↓
Three selected layouts
   ↓
SVG visualization + text explanation
   ↓
Local save / image export / JSON export
```

## Client/server split

### Build time

- Content pages
- SEO metadata
- structured data
- navigation
- guide indexes
- example project seed

### Browser only

- Project editing
- layout generation
- SVG interaction
- local persistence
- import/export
- analytics consent and event emission

### Server

None in the MVP.

## Hydration policy

- Homepage demo: non-interactive CSS/SVG animation by default.
- Planner: React island loaded only when visible or immediately on tool routes.
- Consent manager: minimal vanilla client script or tiny hydrated component.
- Content pages: zero React unless they embed a real planner example.

## State architecture

Use a reducer-based state model with explicit actions:

- `SET_PROJECT_NAME`
- `SET_UNIT_SYSTEM`
- `UPDATE_SPACE`
- `ADD_ITEM_DEFINITION`
- `UPDATE_ITEM_DEFINITION`
- `REMOVE_ITEM_DEFINITION`
- `GENERATE_LAYOUTS`
- `SELECT_LAYOUT_MODE`
- `SELECT_PLACED_ITEM`
- `MOVE_PLACED_ITEM`
- `ROTATE_PLACED_ITEM`
- `REMOVE_PLACED_ITEM`
- `UNDO`
- `REDO`
- `RESET_TO_GENERATED`
- `LOAD_EXAMPLE`
- `IMPORT_PROJECT`
- `CLEAR_PROJECT`

Generated layouts are derived data and should not be persisted as the canonical project source. Persist inputs and optionally the last manual adjustment snapshot.

## Error boundaries

- React error boundary around the planner.
- Import parsing errors shown inline without destroying current state.
- Packing failure returns an empty but valid result with explanations.
- Export failures preserve the project and offer text-copy fallback.

## Performance budget

Initial targets:

- Content pages: under 100 KB compressed JS, ideally near zero.
- Tool route: under 250 KB compressed first-party JS before optional test/debug code.
- No heavy UI, charting, 3D, or image-processing library.
- Candidate generation capped by deterministic limits to prevent UI freezes.
- Packing work may move to a Web Worker later only if profiling proves necessary.
