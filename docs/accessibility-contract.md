# Accessibility contract

## Target

WCAG 2.2 AA for the complete user journey.

## Interaction principles

- Dragging is optional enhancement only.
- Every draggable action has an equivalent button and keyboard command.
- The planner never relies on color alone.
- Generated results have a complete text summary.
- Changes are announced through a polite live region.
- Errors are associated with the exact field and summarized at submission.

## SVG semantics

- Root SVG has `role="img"` and an accessible name.
- A `<title>` states the selected layout mode and placement count.
- A `<desc>` summarizes space dimensions, utilization, and unplaced count.
- Interactive objects are represented by focusable controls in the DOM; SVG shapes alone are not the only control surface.
- Patterns, labels, and borders supplement color differences.

## Keyboard model

- Tab selects controls in logical order.
- Enter/Space selects a placed object.
- Arrow buttons move the selected object by a documented step.
- Shift plus move button uses a larger step if implemented.
- Rotate and Remove are explicit buttons.
- Escape clears selection.
- Undo and Redo are standard buttons and may also support platform shortcuts.

## Motion

When `prefers-reduced-motion: reduce` is active, layout objects appear without movement animation and transitions are near-instant.
