# Packing and scoring strategy

## Goal

Return three useful and meaningfully different front-view layouts without claiming global optimality.

## Normalization

1. Convert dimensions to integer millimetres.
2. Subtract configured outer margins from available width and height.
3. Reject non-positive usable dimensions.
4. Expand each object definition into stable item instances.
5. Generate allowed orientations per instance.
6. Exclude orientations whose depth exceeds usable depth.

## Candidate generation

Generate candidate sequences using deterministic orderings:

- descending area
- descending height
- descending width
- descending depth
- access-priority first
- largest quantity groups first
- mixed stable shuffles derived from a project fingerprint

Run each order through at least two packers:

- MaxRects-style best short side fit
- Shelf-packing with height-aware rows

Phase 3 may add a guillotine variant only if tests show meaningful gains.

## Candidate limits

Initial hard limits:

- 20 item definitions
- 100 expanded item instances
- 60 candidate attempts
- 50 ms target for ordinary projects on a mid-range device
- 250 ms soft ceiling before showing a progress state

If limits are exceeded, return a validated message rather than freezing the interface.

## Compact score

Priorities, in order:

1. Number of placed objects
2. Total placed front area
3. Fewer fragmented empty rectangles
4. Lower bounding-box waste
5. Fewer rotations when otherwise equal

## Easy Access score

Priorities:

1. Number of placed access-priority objects
2. Number of total placed objects
3. Lower stacking/overlap risk
4. More clearance above priority objects
5. Priority objects closer to the lower/front-accessible region
6. Simpler rows and fewer trapped gaps

The MVP has no true depth stacking. “Easy Access” therefore evaluates front-view access and configured clearance, not whether one object physically blocks another in depth.

## Balanced score

Weighted normalized combination of Compact and Easy Access, with a diversity penalty so the selected result is not visually identical to either.

## Diversity

Two layouts are considered near-duplicates when most instances share equivalent positions and orientations within a small tolerance. Select the highest scoring candidate first, then prefer diverse candidates for the other modes.

## Explanations

Explanations are generated from measurable facts:

- depth excess in millimetres
- width or height excess
- placed count and requested count
- rotation count
- remaining horizontal/vertical clearance
- whether a smaller configured gap would place one additional object, tested with a bounded secondary run

Never generate speculative explanations that are not proven by the calculation.

## Manual edits

Manual edits do not automatically repack the full layout. Every move is validated for:

- boundaries
- overlap
- depth eligibility
- allowed orientation

A separate “Recalculate layouts” action generates new automatic candidates from source inputs.
