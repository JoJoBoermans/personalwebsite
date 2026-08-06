# Technology baseline

This baseline is locked for Phase 1 unless package compatibility requires a documented adjustment.

## Runtime and package manager

- Node.js 22.16.0 LTS
- npm
- `.nvmrc` pins Node 22.16.0, matching the implementation and Netlify runtime.

## Application stack

- Astro 7.x with static output
- React 19.x through the official Astro React integration
- TypeScript in strict mode
- SVG for planner visualization
- Plain CSS with design tokens

## Testing

- Vitest for pure TypeScript and component-level tests
- Playwright for end-to-end tests in Chromium, Firefox, and WebKit

## Deployment

- Netlify static deployment
- Build command: `npm run build`
- Publish directory: `dist`
- No Netlify adapter initially because the MVP has no server-rendered routes or Netlify image-transform requirement

## Upgrade policy

- Pin exact dependency versions in the lockfile.
- Apply security patches within the selected major versions.
- Do not perform major framework upgrades during the validation period unless a security or platform requirement makes it necessary.
