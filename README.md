# KIBA Landing Pages

KIBA's referral-partner and advisor booking pages, deployed on Vercel at
**https://go.kibadvisors.com**. See **`CLAUDE.md`** for the full guide (repo structure, the
config-driven template pattern, design system, GHL embed notes) — this file is a short pointer,
not a duplicate.

## Current state: mid-migration to Next.js

This is now a Next.js (App Router) project (`app/`), migrated incrementally so production never
breaks mid-migration:

- **Unmigrated pages** are still their original static HTML files, now living under
  `public/legacy/...`, served at their original clean URLs via `rewrites()` in
  `next.config.js`. This is everything today except the placeholder homepage.
- **Migrated pages** are real routes under `app/`.
- `public/legacy/partners/_template.html` and `public/legacy/advisors/_template.html` are the
  templates to copy when adding a new partner/advisor page — see `CLAUDE.md` for the full
  add-a-page steps.
- `public/legacy/v2.html` is the Fundwell-inspired homepage redesign, served at **`/v2`** as a
  `noindex` preview. Not yet ported into `app/page.tsx`, and not linked from anywhere — once
  it's approved it becomes the real homepage and the root redirect gets revisited.
- `dev/` holds one-off dev/diagnostic HTML files (e.g. component previews) — not deployed,
  kept out of `public/` on purpose so they aren't publicly reachable.

## Build

```
npm install
npm run build
```

## Deploy

Push to `main` → Vercel auto-deploys to go.kibadvisors.com. Redirects and rewrites live in
`next.config.js` (there is no `vercel.json` anymore).
