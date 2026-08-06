# Test strategy

## Test pyramid

### Pure unit tests

Framework-independent TypeScript functions:

- unit conversion
- validation
- orientation generation
- depth checks
- rectangle overlap
- packer output invariants
- scoring
- explanation generation
- import schema validation

### Component tests

Focused browser tests for forms, tabs, accessible controls, and SVG selection behavior where unit tests are insufficient.

### End-to-end tests

Playwright across Chromium, Firefox, and WebKit for critical user journeys.

## Required unit scenarios

1. Everything fits exactly.
2. One item is too deep.
3. One item fits only after base rotation.
4. Requested quantity exceeds capacity.
5. Margins change the result.
6. An item is 1 mm too large.
7. Inch and centimetre inputs normalize equivalently.
8. Nothing fits.
9. Equal-efficiency layouts receive deterministic ordering.
10. Invalid import is rejected without state loss.
11. Rotation disabled.
12. Stackable preference changes Easy Access score but not geometry.
13. Identical item definitions create stable instance IDs.
14. Large allowed input remains within performance limits.
15. Empty, zero, negative, NaN, and extreme values are rejected.
16. Placements never overlap.
17. Placements never exceed boundaries.
18. Every placement refers to a known item instance.
19. Every unplaced instance has at least one machine-readable reason.
20. Repeated runs with identical input return identical results.

## End-to-end journeys

- Open example and generate layouts.
- Create a project from empty state.
- Add, edit, duplicate, and remove object definitions.
- Generate all three layout modes.
- Select and rotate an allowed object.
- Attempt an invalid move and receive an accessible error.
- Undo, redo, and reset to generated layout.
- Save locally and reload.
- Export and import JSON.
- Export SVG/PNG and open print view.
- Reject analytics and complete the full tool flow.
- Navigate core controls with keyboard only.

## Accessibility checks

- Automated axe checks as a supplement, not a replacement for manual review.
- Keyboard-only completion.
- Visible focus.
- Live-region announcement after layout generation.
- 200% browser zoom.
- Reduced-motion mode.
- Touch target review.
- SVG has title, description, and text alternative.

## Performance checks

- Packing benchmark fixtures.
- Bundle-size check.
- Lighthouse on homepage, tool, and one guide.
- No long task over 200 ms for ordinary example input.
