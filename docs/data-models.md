# Data models

## Measurement policy

All calculations use millimetres internally as integers. This avoids floating-point drift and makes 0.1 cm comparisons exact. User-facing centimetres and inches are converted at the boundary.

## Canonical entities

### Project

- schema version
- unique local identifier
- project name
- preferred display unit
- available space
- object definitions
- planner preferences
- timestamps

### Space

- inner width
- inner height
- usable depth
- horizontal gap
- vertical gap

### Object definition

A reusable description with dimensions, quantity, allowed base rotation, stacking preference, and access priority.

### Object instance

One expanded physical item derived from a definition quantity. Instances receive stable IDs so manual edits and explanations can identify them.

### Orientation

- Normal: front width = width, front height = height, depth = depth.
- Base rotated: front width = depth, front height = height, depth = width.

Height never changes in the MVP.

### Layout result

Contains placements, unplaced items, utilization metrics, warnings, explanations, and a deterministic fingerprint.

## Versioning

The import/export file begins at schema version `1`. Import code must reject unknown major versions and preserve the current project when import fails.
