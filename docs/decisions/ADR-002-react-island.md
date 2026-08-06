# ADR-002: Use one React island for the planner

## Status

Accepted for the MVP.

## Decision

Use React only for the interactive planner and keep navigation/content in Astro.

## Rationale

- The planner has complex local state, undo/redo, dynamic forms, and SVG interaction.
- A single island limits the client bundle to routes that need it.
- Framework-independent packing code remains reusable and testable.

## Consequences

- React must not become a dependency of ordinary content pages without justification.
- The planner must expose accessible HTML controls around the SVG.
