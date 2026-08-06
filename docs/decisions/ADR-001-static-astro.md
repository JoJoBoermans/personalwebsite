# ADR-001: Use Astro static output

## Status

Accepted for the MVP.

## Decision

Use Astro with static output for all routes.

## Rationale

- Most pages are content and should ship as HTML with minimal JavaScript.
- The MVP requires no server rendering, accounts, live data, or API endpoints.
- Static output is simple to host on Netlify.
- It reduces operational and privacy complexity.

## Consequences

- Public share links and cloud projects are postponed.
- Any future server feature requires a deliberate new architecture decision.
