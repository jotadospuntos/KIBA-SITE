# KIBA Landing Pages

KIBA's referral-partner and advisor booking pages, deployed on Vercel at
**https://go.kibadvisors.com**. See **`CLAUDE.md`** for the full guide (repo structure, the
config-driven template pattern, design system, GHL embed notes) — this file is a short pointer,
not a duplicate.

## Current state: mid-migration to Next.js

This is a Next.js 14 (App Router) project (`app/`), migrated incrementally from static HTML so
production never breaks mid-migration:

- **Unmigrated pages** are still their original static HTML files, now living under
  `public/legacy/...`, served at their original clean URLs via `rewrites()` in `next.config.js`.
- **Migrated pages** are real routes under `app/`.
- `public/legacy/partners/_template.html` and `public/legacy/advisors/_template.html` are the
  templates to copy when adding a new partner/advisor page — see `CLAUDE.md` for the full
  add-a-page steps.
- `dev/` (currently empty) is where one-off dev/diagnostic HTML goes — kept out of `public/` on
  purpose so it isn't publicly reachable.

## Homepage

The Fundwell-inspired redesign **is** the homepage of go.kibadvisors.com:

- **`/`** — `app/page.tsx` (route + metadata) and `app/HomePage.tsx` (the page itself), styled by
  `app/home.css`. It was built at `/v3` as a React port of the old static draft and promoted to the
  root once every behavior was a real component: `SplitText`, `HeroReveal`, `SiteNav`, `SiteFooter`,
  `Reveal`, `Counter`, `TestimonialCarousel`, `HeroBlobs`, `TrustMarquee`, `GradientBlob`. `/v3` now
  redirects to `/`. No vanilla DOM code is left.
- **`/v2`** (`public/legacy/v2.html`) — the original static draft, still served and still `noindex`.
  **Kept on purpose** as the visual reference to diff the homepage against; not cleanup.
- The homepage is **`noindex`** by decision: this subdomain is a landing/booking host, and
  `kibadvisors.com` (a separate WordPress site this repo never touches) stays the only indexable
  KIBA homepage. See `CLAUDE.md` before changing that or the divergence list.

## Removed: the border glow

The cursor-following card glow was removed from the whole repo by request — homepage, every legacy
page, both templates, and the `/v2` draft — along with `components/BorderGlow/` and the `dev/`
previews. It's a design decision, not lost work; see `CLAUDE.md` before re-adding anything like it.

## Build

```
npm install
npm run build
```

Run the build before every push — Vercel deploys `main` automatically.

## Deploy

Push to `main` → Vercel auto-deploys to go.kibadvisors.com. Redirects and rewrites live in
`next.config.js` (there is no `vercel.json`).
