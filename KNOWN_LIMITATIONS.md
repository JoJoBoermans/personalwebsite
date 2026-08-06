# Known limitations

## Geometry

- ShelfSketch models a rectangular front opening with one available depth.
- Objects are upright rectangular cuboids.
- Base rotation swaps width and depth only.
- Irregular shapes, diagonal placement, pipes, hinges, doors and sloping surfaces are not modelled in version 1.0.
- The engine is heuristic. It finds useful candidate layouts but does not prove mathematical optimality.

## Physical accuracy

- Users must enter usable inside furniture dimensions and maximum outside object dimensions.
- Handles, lids, wheels, rims, rounded corners and product-manufacturing tolerances may make a technically valid layout impractical.
- The result is a planning aid, not an installation or purchasing guarantee.

## Browser storage

- Saved projects remain in the current browser profile only.
- Clearing browser storage, private-browsing cleanup or browser policies may remove data.
- There is no account, cloud backup or cross-device synchronization.
- Portable JSON exports contain project inputs and preferences, not the generated layout history.

## Sharing and collaboration

- There are no public share links or simultaneous editing features.
- Users can share exported JSON, SVG, PNG or printed files themselves.

## Data and integrations

- There is no retailer catalogue, live price, stock, barcode or product-data integration.
- No automatic camera measurement, image recognition, AR or 3D modelling is included.
- No advertising or affiliate tracking is included in the MVP.

## Release verification

The implementation container could not install the pinned npm dependencies. Therefore the following checks are implemented but not executed in this environment:

- official `astro check`
- Astro production build
- official Vitest suite
- desktop Chromium and mobile WebKit Playwright suites
- axe browser accessibility scan
- Lighthouse
- npm audit
- final rendered structured-data and link checks

They are mandatory before public production launch.
