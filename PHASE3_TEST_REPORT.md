# ShelfSketch Phase 3 test report

Date: 2026-08-06

## Scope

Phase 3 implements the local packing engine, hard dimension checks, allowed base rotation, Compact/Easy Access/Balanced scoring, concrete explanations, and a result-selection interface.

## Automated source checks

Passed:

- 14 required Phase 3 implementation and test files present
- Relative imports resolved
- Planner wired to `packingEngine.generate`
- Fifth Layouts step available only after generation
- Compact, Easy Access, and Balanced modes present
- Both MaxRects-style and shelf-row algorithms present
- No fetch, Axios, XMLHttpRequest, or WebSocket usage in the engine
- Phase 1 and Phase 2 regression validators still pass

## Executable engine scenarios

Passed:

1. Exact fit fills the complete front area
2. Item exceeding depth by 1 mm reports the exact excess
3. Base rotation is used when it is the only fitting orientation
4. Rotation is not used when disabled
5. Partial quantities are reported correctly
6. Horizontal gaps can prevent an otherwise exact fit
7. A 0.1 cm oversize is preserved as a 1 mm failure
8. Equivalent centimetre and inch input normalizes to equal millimetres
9. All three modes return valid empty results when nothing fits
10. Identical item copies retain unique instance IDs
11. Large requests are constrained by the safety limit and reported
12. Invalid negative dimensions are rejected without throwing
13. A non-stackable lower item blocks vertical placement above it
14. A stackable lower item permits vertical placement
15. Equal-efficiency inputs remain deterministic across repeated runs
16. The supplied example generates all three modes
17. Every generated placement remains inside the usable space
18. Generated placements do not overlap
19. Configured horizontal and vertical gaps are respected

## Strict TypeScript checks

Passed with:

- `strict`
- `noUncheckedIndexedAccess`
- `exactOptionalPropertyTypes`
- DOM and ES2022 libraries for the React planner

The packing core was compiled to temporary CommonJS output and executed with Node.js, then removed.

## Example result

For the supplied 80 × 42 × 36 cm example with seven requested items:

- Compact placed 6/7 and used approximately 83% of the front area
- Easy Access placed 6/7 and retained all three important-priority items
- Balanced placed 6/7 with a different placement fingerprint

These figures validate the current example and are not product-performance guarantees for arbitrary inputs.

## Environment limitation

The environment still cannot download npm packages. Therefore:

- `npm install` was not run
- the official Vitest runner was not executed here
- `astro check` and `astro build` were not run

A Vitest 4.1.10 test suite is included for a normal networked environment. Equivalent executable engine scenarios were compiled and run locally with the available global TypeScript compiler and Node.js runtime.

## Commands for a networked environment

```bash
npm install
npm run validate:phase1
npm run validate:phase2
npm run validate:phase3
npm run test:packing
npm run check
npm run build
```
