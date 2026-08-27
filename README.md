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
- `dev/` holds one-off dev/diagnostic HTML files (e.g. component previews) — not deployed, kept
  out of `public/` on purpose so they aren't publicly reachable.

## Homepage redesign: `/v2` and `/v3`

The Fundwell-inspired homepage redesign lives in two forms today:

- **`/v2`** (`public/legacy/v2.html`) — the original static redesign draft. `noindex`, not linked
  from anywhere, served via a rewrite. Kept **only as the pixel-diff reference**.
- **`/v3`** (`app/v3/`) — the real-React port of `v2.html`, and the **active work**. It started as
  a faithful JSX conversion plus `v3.css` (the original `<style>` verbatim), rendering
  pixel-identically to `/v2` — which is what lets real React components be swapped in one at a time
  and diffed against `/v2`. **That port is now complete** — hero headline (`SplitText`), hero image
  panel (`HeroReveal`), nav + footer (`SiteNav`, `SiteFooter`), scroll reveal (`Reveal`), stat
  counters (`Counter`), testimonial carousel (`TestimonialCarousel`), hero cursor blobs
  (`HeroBlobs`), trust marquee (`TrustMarquee`), WebGL CTA gradient (`GradientBlob`). The only
  vanilla holdout is `app/v3/border-glow.js` (deliberate — see `CLAUDE.md`). `/v3` also has a few
  **deliberate** behavior fixes that `/v2` doesn't — they're listed in `CLAUDE.md`, and anything not
  on that list is a migration bug.

Once `/v3` is component-complete and approved it gets promoted to the real homepage route of
**`go.kibadvisors.com`**, and `v2.html` + its `/v2` rewrite are removed. The root redirect
(`/` → `kibadvisors.com`) is dropped at that point.

**Scope boundary:** this repo only ever changes `go.kibadvisors.com`. The separate
`kibadvisors.com` WordPress site is never touched, migrated, or repointed by work here — see
"Scope boundary" in `CLAUDE.md`.

## Build

```
npm install
npm run build
```

Run the build before every push — Vercel deploys `main` automatically.

## Deploy

Push to `main` → Vercel auto-deploys to go.kibadvisors.com. Redirects and rewrites live in
`next.config.js` (there is no `vercel.json`).
