# CLAUDE.md — Project guide for AI agents

This repo holds KIBA's referral-partner and advisor booking landing pages.
Deployed on **Vercel** (auto-deploys on every push to `main`) at **https://go.kibadvisors.com**.
"KIBA" = Kingdom Impact Business Advisors, a funding/advisory company. Main site (a **separate**
WordPress site, not this repo): https://kibadvisors.com.

---

## ⚠️ Mid-migration: this repo is a Next.js app

The site is being migrated from plain static HTML to Next.js (App Router), **incrementally, one
page at a time**, so production never breaks mid-migration. Read this before touching routing or
adding pages.

- **There is a real build step.** `package.json` + `next.config.js` + the `app/` directory make
  this a Next.js 14 (App Router) project. Run `npm install && npm run build` before pushing.
- **Unmigrated pages are still the original static HTML**, now living under `public/legacy/...`
  and served at their *original* clean URLs via `rewrites()` in `next.config.js` — the browser
  URL never changes, only where the file physically lives. Everything under "The config-driven
  template pattern" below still applies **verbatim** to any page under `public/legacy/`: edit the
  config block, don't hand-edit the wired-up markup, keep it a self-contained file, etc.
- **Images/favicons did NOT move.** `public/img/...`, `public/partners/img/...`,
  `public/advisors/img/...`, and the root favicons stay at their exact original public paths — no
  rewrite needed, since several pages reference these via absolute
  `https://go.kibadvisors.com/...` URLs in `og:image` tags.
- **`vercel.json` is gone.** Its clean-URLs behavior and `redirects` were ported into
  `next.config.js` (`rewrites()` + `redirects()`). Add new redirects/rewrites there, not in a
  `vercel.json`.
- **To migrate a page for real:** build it as `app/<route>/page.tsx`, verify it on a Vercel
  preview deploy, then delete that page's `rewrites()` entry and its file under `public/legacy/`.
  No rush — an unmigrated page under the rewrite bridge is never broken or blocking anything else.
- **Root `/`** redirects (via `next.config.js` `redirects()`, ported from the old `vercel.json`)
  to `https://kibadvisors.com`, so `app/page.tsx` is currently just a placeholder. See the
  homepage-redesign status below.

---

## Homepage redesign: `/v2` (legacy) and `/v3` (React port)

The Fundwell-inspired homepage redesign exists in two forms today. **`app/v3/` is the active
work; `/v2` is kept only as a reference.**

- **`/v2`** — `public/legacy/v2.html`, the original static redesign draft (hero, solutions bento
  grid, WebGL gradient CTA). Served via a `rewrites()` entry, `noindex`, not linked from
  anywhere. This is the **pixel-diff reference**, not the thing being shipped.
- **`/v3`** — `app/v3/page.tsx` + `app/v3/v3.css`, the real-React port of `v2.html`. The markup
  is a faithful JSX conversion and `v3.css` is the original `<style>` block verbatim, so `/v3`
  renders **pixel-identically to `/v2`**. That equivalence is the whole point: it lets real React
  components be swapped in **one at a time**, each verified against `/v2` with a pixel diff.
  `app/v3/layout.tsx` carries the metadata and `noindex` (the page is a client component and
  can't export metadata itself).

**Source-of-truth rule during the port:** while both exist, `/v3` is where new work goes, but any
content or style change still has to be mirrored into `v2.html` (or the pixel diff stops being a
valid check) — same drift risk the legacy pages have. Once `/v3` is component-complete and
approved, it gets promoted to the real homepage route, and **`v2.html` + the `/v2` rewrite are
deleted**. See "Open decisions" for what promotion depends on.

### What's been ported to real components so far

- **Hero headline** → `components/SplitText` (React Bits SplitText; GSAP is a bundled npm dep now,
  no CDN script).
- **Hero image panel** → `components/HeroReveal` (Framer Motion angled clip-path reveal, lifted
  from a 21st.dev block — only the image panel, not its bundled text column).

### What's still driven by `app/v3/legacy-behaviors.js`

A ~450-line module of the original inline scripts, run from a `useEffect` after mount, driving the
DOM directly (`getElementById`/`querySelector`) against the ids/classNames in the JSX. Still owns:
sticky nav shrink-on-scroll, the Solutions dropdown (with keyboard a11y), the mobile menu,
IntersectionObserver reveal-on-scroll, animated stat counters, cursor-reactive hero blobs, the
testimonial carousel, and the WebGL gradient blob on the CTA band. These get replaced by real
React components incrementally.

- **`components/BorderGlow`** exists as a real component but is **deliberately NOT wired into
  `/v3`** — the 14 glow cards still use the vanilla `initBorderGlow` behavior + the
  `.border-glow-card`/`.edge-light` markup. Wiring the component in would need a
  polymorphic-element fork (5 of the cards are `<a href>` links) plus layout neutralizers, for
  identical output. Leave it deferred unless that calculus changes.
- **Motion preference:** every animation honors `prefers-reduced-motion`, with a `?motion=1`
  override for previewing (see `lib/useMotionPreference.ts` and `window.__forceMotion`).

---

## Golden rules (read first)

- **Filename = URL.** `public/legacy/partners/rivenway.html` serves at `/partners/rivenway` via
  its rewrite. Use lowercase, hyphens, no spaces, no underscores.
- **Put files in the right folder.** Referral partners go in `partners/`, advisors in
  `advisors/`. A file in the wrong folder won't get the intended `/partners/...` or
  `/advisors/...` URL — this has caused a "404 / wrong page" bug before.
- **Every legacy page is ONE self-contained HTML file.** There is no shared CSS or JS file across
  the legacy pages — the full `<style>` block and scripts are copied into each. A global visual
  change to the legacy set must be applied to **every legacy page AND both templates**, or they
  drift apart. (This is a reason to migrate them to real routes with shared components — see
  below.)
- **Don't hand-edit the wired-up markup** on legacy pages. Per-page content lives in a **config
  block near the top of each file**; a small script injects it at load. Edit the config values,
  not the generated markup.
- **New `app/` routes use Tailwind, not hand-rolled CSS** (except `/v3`, which intentionally keeps
  `v3.css` verbatim for the pixel diff — see above). See "Design system" for where the tokens
  live.
- **Show diffs and let the human approve.** Prefer minimal, targeted edits. Run `npm run build`
  and validate any embedded JS before finishing.

---

## Repo structure

```
/
├── README.md
├── CLAUDE.md                     ← this file
├── package.json / next.config.js / tsconfig.json / postcss.config.js / components.json
├── app/
│   ├── layout.tsx                ← root layout (fonts, base metadata)
│   ├── globals.css               ← Tailwind v4 @theme tokens + shadcn semantic tokens
│   ├── page.tsx                  ← placeholder root route ("/" redirects to kibadvisors.com)
│   └── v3/                       ← React port of the homepage redesign (see above)
│       ├── page.tsx              ← the ported homepage (client component)
│       ├── layout.tsx            ← metadata + noindex for /v3
│       ├── v3.css                ← original <style> block, verbatim
│       └── legacy-behaviors.js   ← ported inline scripts, replaced incrementally
├── components/
│   ├── SplitText/                ← hero headline (ported)
│   ├── HeroReveal/               ← hero image panel (ported)
│   ├── BorderGlow/               ← exists, deliberately NOT wired into /v3 yet
│   └── ui/button.tsx             ← shadcn button (currently unused; CTAs use .btn classes)
├── lib/
│   ├── utils.ts                  ← cn() helper
│   └── useMotionPreference.ts    ← ?motion=1 override for previewing animations
├── dev/                          ← one-off dev/diagnostic HTML (NOT deployed; kept out of public/)
└── public/
    ├── img/ · partners/img/ · advisors/img/ · favicons   ← original public paths, unchanged
    └── legacy/                   ← unmigrated pages, served via next.config.js rewrites()
        ├── v2.html               → /v2   (noindex homepage-redesign reference; see above)
        ├── referral-partners.html
        ├── business-acquisitions.html
        ├── book-rr.html
        ├── thank-you.html        (shared confirmation + booking calendar)
        ├── ty-cal.html
        ├── partners/
        │   ├── _template.html    ← copy this to add a referral partner
        │   ├── rivenway.html      → /partners/rivenway
        │   └── integ-funding.html → /partners/integ-funding
        └── advisors/
            ├── _template.html    ← copy this to add an advisor booking page
            ├── michael-sylkatis.html → /advisors/michael-sylkatis
            ├── barbara-sylkatis.html → /advisors/barbara-sylkatis
            └── ariel-austria.html    → /advisors/ariel-austria
```

---

## The config-driven template pattern (legacy pages)

Each legacy partner/advisor page has a clearly-commented config object near the top of `<body>`,
and a script lower down that wires it into the DOM. To create or edit one, change the config —
nothing else.

**Partner pages** (`PARTNER`):
- `name` — partner's full name (hero badge: "Recommended by …")
- `shortName` — used in the hero sentence
- `ghlFormId` — that partner's GoHighLevel form ID (from `/widget/form/<ID>`)
- `ghlFormName` — form title for the iframe
- `PARTNER_LOGO` — hosted image URL OR base64 data URI. Empty `""` hides the co-brand badge.

**Advisor pages** (`ADVISOR`):
- `name` — advisor's name
- `title` — role (short; shown in the profile card)
- `tagline` — one-line description under the title (empty `""` hides it)
- `bio` — a sentence or two, shown as the hero subhead
- `photo` — hosted image URL OR base64 data URI. Empty `""` = placeholder avatar.
- `schedulerUrl` — GoHighLevel calendar embed URL (or Calendly). Empty `""` = placeholder box.

> Note: this inline-config pattern is a property of the *legacy* pages. When these pages are
> eventually migrated to real `app/` routes, replace it with a proper props/data pattern (or CMS)
> rather than porting the config-block hack.

---

## Adding a new partner or advisor (legacy pattern)

1. Copy the matching `_template.html` to `<name>.html` in the correct `public/legacy/` folder
   (e.g. `public/legacy/partners/acme.html` → `/partners/acme`), and add its `rewrites()` entry
   in `next.config.js`.
2. Edit **only** the config block: name, logo/photo, GHL form or calendar ID, etc.
3. Images: embed as **base64 data URIs** to keep the page self-contained (no broken links).
   Resize/optimize first. Advisor photos must be **cropped square and face-centered**, since the
   avatar is a small circle.
4. Commit + push → Vercel deploys automatically.
5. For partner pages, set the GHL form's **On Submit → Redirect** to
   `https://go.kibadvisors.com/thank-you`.

---

## Shared elements (keep in sync across ALL legacy pages + BOTH templates)

- **Header:** KIBA logo + "Kingdom Impact Business Advisors". Header and footer logos link to
  https://kibadvisors.com. The business name hides under ~600px width.
- **Meta Pixel** (Facebook), ID `1653996785650157`, in the `<head>`, firing PageView.
- **Footer social icons:** LinkedIn (`/company/kingdomimpactbusinessadvisors/`) and Facebook
  (`/kibadvisors`).
- **Testimonials block** (partner + advisor pages) — three client quotes.
- **KIBA contact:** phone `251-210-8445`, email `info@kibadvisors.com`.

If you change any shared element, apply the same change to every legacy page and both templates.
(For the migrated `app/` side, the fix is the opposite: extract the nav/footer into shared React
components so there's only one copy — do this before migrating a second real page.)

---

## Design system

Tokens live in **`app/globals.css`** for the `app/` side and are duplicated in each legacy page's
`<style>` block (and in `v3.css`) for the legacy side. **Tailwind v4 is CSS-first — there is no
`tailwind.config.ts`.** The `@theme` block in `globals.css` is the single source of truth for the
`app/` design tokens; a second `@theme inline` block bridges shadcn's semantic tokens
(`--background`, `--primary`, etc.) into Tailwind's `--color-*` namespace.

- **Fonts:** Instrument Sans (headings / UI), Instrument Serif (display), IBM Plex Mono (small
  eyebrow labels), IBM Plex Sans (body), General Sans (headings, from Fontshare — not on Google
  Fonts, so loaded via a `<link>` in `app/layout.tsx`, not `next/font/google`).
- **Colors (CSS vars):** `--navy-deep #020062`, `--navy-soft #0025ae`, `--blue #2563eb`,
  `--blue-soft #6d94f5`, plus ivory/paper/cream/ink/slate/line neutrals.
- **Look:** dark navy hero, white "card" surfaces with a blue accent, rounded corners, soft
  shadows. `--radius-sm 12px` / `--radius-md 16px`; `--shadow-soft` for elevated cards.
- **shadcn** is configured (`components.json`, style `base-nova`, `cssVariables: true`,
  `iconLibrary: lucide`). `components/ui/button.tsx` is present but currently **unused** — `/v3`
  CTAs use hand-rolled `.btn`/`.btn-primary` classes from `v3.css`. If you migrate the nav to
  shadcn later, weigh the restyle work needed to fit the navy palette (this was considered for the
  nav and deferred).

---

## GoHighLevel embeds

- Forms and calendars are GHL iframes; the resize script
  `https://link.msgsndr.com/js/form_embed.js` must be present for them to size correctly.
- These embeds load from an external domain, so they **do not render on `file://` or in
  sandboxes** — only test them on a deployed URL (or a Vercel preview).

---

## Deploy / workflow

- Push to `main` → Vercel auto-deploys to go.kibadvisors.com. Clean URLs, the root redirect to
  kibadvisors.com, and all path redirects/rewrites live in `next.config.js` (there is no
  `vercel.json`).
- Typical loop: edit → `npm run build` (must pass) → review diff → `git add -A && git commit && git push`.
- After deploying, verify on the live URL (logo, form/calendar, and that the correct version
  shipped — a quick tell is the testimonial text). For `/v3`, also spot-check it against `/v2`.

---

## Scope boundary (decided — do not re-open)

**This repo only ever changes `go.kibadvisors.com`. Nothing here touches what's live at
`kibadvisors.com`.** The main site is a separate WordPress install; it is not migrated, not
replaced, and not repointed by any work in this repo.

Consequences for the `/v3` promotion step:

- `/v3` becomes the **root of `go.kibadvisors.com`** — i.e. `app/page.tsx`. That means removing
  the `/` → `https://kibadvisors.com` redirect from `next.config.js` `redirects()`, moving the
  `/v3` markup to the root route, dropping the `noindex`, and setting the canonical to
  `https://go.kibadvisors.com/`.
- Do **not** propose a domain move, a DNS change, a WordPress export, or a cross-domain
  canonical/redirect pointing at `kibadvisors.com`. Out of scope.
- One judgment call left for the human at promotion time (not blocking, and **not** a reason to
  touch the main site): once the subdomain root is a real indexable homepage, it partially
  overlaps `kibadvisors.com` in search. Confirm whether it should be indexed at all, or stay
  `noindex` and serve as a linked-to landing hub only.

---

## Open decisions (ask the human — don't assume)

- _None open right now._ (The `/v3` go-live target is settled — see "Scope boundary" above.)
