# ADR-003: Use SVG for visualization

## Status

Accepted for the MVP.

## Decision

Render the shelf, object rectangles, labels, dimensions, and selection state in SVG.

## Rationale

- Crisp scaling
- Natural rectangle geometry
- Straightforward labels and measurement lines
- Better inspectability and export than a pixel canvas
- Accessibility metadata support

## Consequences

- Very large item counts require careful DOM limits.
- Interaction must still have equivalent HTML controls.
