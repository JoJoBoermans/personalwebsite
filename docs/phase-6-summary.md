# Phase 6 summary — Content, SEO, privacy, consent, and analytics

Phase 6 turns the functional planner into a publication-ready content and measurement foundation, while deliberately stopping before final browser QA and production delivery.

## Implemented

### Substantive content

- Expanded measurement guide covering clear openings, depth, external product dimensions, tolerances, and removal clearance.
- Expanded transparent calculation explanation.
- Added detailed shelf-space, pantry, quantity, bin-size, and cabinet-planning guides.
- Updated About, Contact, Privacy, Cookies, Changelog, and tool support content.
- Removed obsolete copy suggesting that layout generation was still pending.

### Technical SEO

- Unique titles, descriptions, canonicals, Open Graph, and social-card metadata continue through the shared SEO component.
- Added static `/sitemap.xml` and `/robots.txt` endpoints based on `Astro.site`.
- Query-string URLs are discouraged from indexing through robots rules.
- Added `WebApplication`, `SoftwareApplication`, and `BreadcrumbList` JSON-LD to the calculator.
- Added `Article` and `BreadcrumbList` JSON-LD to guide pages.
- Added `CollectionPage` structured data to the guide index.
- Personal results remain in the browser and do not create public indexable URLs.

### Privacy and consent

- Added a global analytics-consent banner and modal.
- Accept and reject actions are both directly available.
- Consent can be reopened from the footer and cookie page.
- The planner remains fully functional when analytics is rejected.
- GA4 loads dynamically only after granted consent and only when `PUBLIC_GA4_ID` is configured.
- Functional local project storage remains separate from analytics consent.
- Added detailed privacy and browser-storage notices.
- Added explicit operator and contact placeholders that must be replaced before public launch.

### Analytics contract

Implemented broad events for:

- Tool views and starts
- Completed space input
- Item additions
- Generated layouts
- Alternative layout views
- Rotation and manual editing
- Exports and local saves
- Imports
- Second projects
- No-fit outcomes
- Validation errors
- Example opening

The implementation excludes exact dimensions, project names, item labels, free text, file contents, and persistent ShelfSketch account identifiers.

## Deliberately not included

- Advertising scripts
- Affiliate tracking
- User accounts
- Server-side analytics proxy
- Contact-form backend
- Public result URLs
- Automatic product data
- Final legal details for a real operator

## Launch blockers remaining

Before publishing publicly:

1. Replace `PUBLIC_SITE_URL` with the real HTTPS domain.
2. Replace all bracketed company, address, registration, contact, and privacy placeholders.
3. Configure or leave blank `PUBLIC_GA4_ID` after deciding whether analytics will be used.
4. Review the final privacy and cookie text against the real hosting and analytics settings.
5. Run Phase 7 browser, accessibility, performance, structured-data, link, and production-build checks in a network-connected environment.
