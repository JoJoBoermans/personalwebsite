# Route plan

| Route | Purpose | Interactive planner | Indexing |
|---|---|---:|---:|
| `/` | Brand proposition and use cases | Demo only | Yes |
| `/tool/` | Primary planner | Full | Yes |
| `/example/` | Prefilled example | Full | Yes |
| `/how-it-works/` | Transparent calculation explanation | Optional embedded demo | Yes |
| `/measurement-guide/` | Measuring instructions | No | Yes |
| `/guides/` | Guide index | No | Yes |
| `/guides/shelf-space-calculator/` | Useful versus theoretical space | Optional preset | Yes |
| `/guides/pantry-bin-planner/` | Pantry use case | Optional preset | Yes |
| `/guides/how-many-storage-bins-fit/` | Fit examples | Optional preset | Yes |
| `/guides/storage-bin-size-guide/` | Handles, lids, tapering | No | Yes |
| `/guides/cabinet-storage-layout-planner/` | Cabinet use case | Optional preset | Yes |
| `/about/` | Product purpose and principles | No | Yes |
| `/privacy/` | Data and analytics explanation | No | Yes |
| `/cookies/` | Consent details and settings | Consent control | Yes |
| `/contact/` | Contact method | No | Yes |
| `/changelog/` | Product changes | No | Yes |
| `/404.html` | Static error page | No | No |

## URL rules

- Trailing slashes are canonical.
- No indexable user-result routes.
- No dimensions or item labels in query strings.
- Example state is selected by a fixed internal preset, not personal URL parameters.
- Future language routes will use explicit prefixes, e.g. `/nl/`, only after full translations exist.
