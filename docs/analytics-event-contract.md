# Analytics event contract

Analytics is disabled until the user has explicitly granted analytics consent and a valid `PUBLIC_GA4_ID` exists.

## Allowed event parameters

Only non-identifying, broad operational properties may be sent.

| Event | Implemented parameters |
|---|---|
| `tool_viewed` | `route`, `viewport_category` |
| `tool_started` | `entry_source_category` |
| `space_dimensions_completed` | `unit_system`, `size_bucket` |
| `item_added` | `definition_count_bucket` |
| `layout_generated` | `mode_count`, `placed_ratio_bucket`, `duration_bucket` |
| `alternative_layout_viewed` | `layout_mode` |
| `item_rotated` | `layout_mode` |
| `layout_manually_edited` | `edit_type` |
| `layout_exported` | `export_type` |
| `project_saved` | `local_only` |
| `project_imported` | `schema_version`, `success` |
| `second_project_started` | `session_category` |
| `no_fit_result` | `reason_category` |
| `measurement_error_shown` | `validation_code` |
| `example_opened` | `preset_id` |

## Prohibited data

- Exact dimensions or coordinates
- Exact utilization when a broad bucket is sufficient
- Item labels
- Project names
- Free text
- Exported or imported file contents
- Contact data
- A persistent user identifier created by ShelfSketch

## Consent behavior

- The GA4 library is not inserted before consent.
- Rejecting analytics leaves the planner fully functional.
- Consent can be changed from the footer or cookie page.
- When no measurement ID is configured, no analytics library loads even after acceptance.
