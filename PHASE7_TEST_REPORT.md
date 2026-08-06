# ShelfSketch Phase 7 test report

**Date:** 6 August 2026  
**Version:** 1.0.0 release candidate

## Result

The final source QA and all executable dependency-free fallback tests pass. The repository contains the official Astro, Vitest, Playwright, axe and Lighthouse test configuration required for a production release.

The project cannot honestly be labelled fully browser-tested or production-built in this environment because npm dependency installation is blocked.

## Passed in this environment

### Phase validators

- Phase 1 route, file, internal-link, JSON and Netlify source validation
- Phase 2 inputs, imports, project state, local storage and validation limits
- Phase 3 packing-engine source and runtime validation
- Phase 4 SVG editor source and runtime validation
- Phase 5 import/export, session persistence and output source/runtime validation
- Phase 6 content, consent, analytics, structured data, sitemap and robots validation
- Phase 7 release scripts, security configuration, metadata, assets, privacy configuration, motion and contrast validation

### Executable packing scenarios

Seventeen scenarios pass, including exact fit, depth excess, rotation, rotation disabled, partial quantity, gaps, 0.1 cm oversize, unit equivalence, no-fit results, identical items, safety limits, invalid items, stackability, determinism and geometric integrity.

### Executable editor scenarios

Ten scenarios pass, including valid movement, boundary, collision, gap, rotation, depth rejection, disabled rotation, stackability protection, removal, undo/redo and coordinate snapping.

### Executable I/O scenarios

Project roundtrips, invalid input rejection, schema rejection, safe filenames, standalone SVG output, measurement copy text, complete local session persistence, restoration and deletion pass.

### Strict fallback checks

- Planner React components and core utilities pass strict TypeScript checks with local test-only type shims.
- Final Playwright test files and configuration pass TypeScript syntax transpilation.
- Production source contains no debug statements or unexpected application network clients.
- The social image is a valid 1200 × 630 PNG.
- Required normal-text colour pairs meet a 4.5:1 contrast threshold.
- The web manifest, CSP, security headers and Astro asset-cache path are present.

## Issues found and fixed during Phase 7

1. Motion preference was stored but not applied.
2. Local session restoration did not use the complete strict project-file parser.
3. Browser storage availability was not fully guarded by try/catch.
4. Interactive SVG used an image role despite containing focusable controls.
5. The skip link target was not programmatically focusable.
6. Small unit labels used a low-contrast text token.
7. Explicit browser/accessibility/Lighthouse QA dependencies and scripts were missing.
8. Netlify’s immutable asset rule targeted `/assets/*` instead of Astro’s `/_astro/*` output.
9. The web manifest had no icon.
10. Social-image alternative metadata was missing.
11. Contact/operator details needed environment-variable configuration.

## Implemented but not executable here

The following tests are present in the repository but were not run:

- `npm install`
- `npm audit`
- `npm run check`
- `npm run build`
- `npm run check:dist`
- official Vitest run
- desktop Chromium Playwright run
- desktop Firefox Playwright run
- mobile WebKit Playwright run
- axe browser scan
- Lighthouse
- rendered structured-data inspection
- real-browser export and print inspection

## Exact environment blocker

The internal npm registry returned:

```text
E404 Not Found: @astrojs/check@0.9.9 is not in this registry
```

A direct public-registry installation attempt could not complete because outbound registry access is unavailable in the container.

## Release status

**Release candidate, not production-certified.**

Before public launch, run the complete checklist in `DEPLOYMENT_CHECKLIST.md` in a normal networked Node 22 environment. A failed build, browser test, axe scan or critical Lighthouse/accessibility issue must block production deployment.
