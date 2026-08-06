# ADR-004: Keep project data local

## Status

Accepted for the MVP.

## Decision

Store only the most recent project and preferences in `localStorage`; provide explicit JSON backup and restore.

## Rationale

- No account or backend required
- Strong privacy proposition
- Simple failure modes
- Sufficient for validation

## Consequences

- Projects do not sync across devices.
- Clearing browser data removes local projects unless exported.
- Multiple project storage may later move to IndexedDB after validation.
