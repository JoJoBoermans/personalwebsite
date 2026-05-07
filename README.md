# joshuaboermans.com

Premium dark-mode personal brand site for **Joshua Boermans**.

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (subtle reveal only)
- Static export (`output: 'export'`) for GitHub Pages

## Local dev
```bash
npm install
npm run dev
```

## Configure Calendly
Edit:
- `src/lib/site.ts` → `site.calendly.url`

## Deploy to GitHub Pages
This repo is set up for static export.

### Recommended: GitHub Actions
Create `.github/workflows/deploy.yml` with a build that runs:
- `npm ci`
- `npm run build`
- upload `out/` directory

Or manually:
```bash
npm install
npm run export
```
Then publish the `out/` folder.

## Notes
- **Do not modify `CNAME`** (required for `joshuaboermans.com`).
- Hidden-ready routes exist at `/blog`, `/resources`, `/cases` (not in navigation).
- SEO: sitemap + robots are included via `src/app/sitemap.ts` and `src/app/robots.ts`.
