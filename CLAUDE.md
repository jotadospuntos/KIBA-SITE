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
- **Root `/` is a real page now.** It used to redirect to `https://kibadvisors.com` (there was no
  homepage in this repo); the promoted redesign lives there instead. `kibadvisors.com` is untouched
  by that — still a separate WordPress property. See "Homepage" below.

---

## Homepage: `/` (shipped) and `/v2` (visual reference)

The Fundwell-inspired homepage redesign **is the homepage of go.kibadvisors.com**. It was built at
`/v3` as a React port of the static `v2.html` draft, then promoted to the root route once every
behavior was a real component.

- **`/`** — `app/page.tsx` (server component: metadata only) + `app/HomePage.tsx` (the client
  component with the markup and animation hooks) + `app/home.css`. `/v3` redirects here; there is
  no `app/v3/` anymore.
- **`/v2`** — `public/legacy/v2.html`, the original static draft, still served via its `rewrites()`
  entry and still `noindex`, not linked from anywhere. It is deliberately **kept as the visual
  reference** to diff the homepage against. Do **not** delete it as cleanup — retiring it is a
  separate, explicit decision.
- **`noindex` on `/` is deliberate.** This subdomain is a landing/booking host: its pages are
  campaign- or partner-targeted and reached by direct link. `kibadvisors.com` stays the only
  indexable KIBA homepage rather than competing with this one for the same terms. The canonical is
  already `https://go.kibadvisors.com/`, so flipping to indexable later is a one-line change in
  `app/page.tsx` — and it's the human's call.

**Source-of-truth rule:** the homepage is where all work goes. `v2.html` is frozen and is **not**
updated to match — so the diff against `/v2` is a diff with *known, listed* exceptions rather than
an expected-identical check.

**Known intentional divergences from `/v2`** (keep this list current — an unlisted difference is a
migration bug):

1. **Testimonial carousel behavior.** `/v2` clamps the carousel to `slides.length - 1`, so on
   desktop — where all three slides are already visible — the arrows and autoplay scroll the track
   into empty space every 6s, and every dot jumps to index 0. The homepage clamps to `maxIndex`,
   hides the inert controls above 860px (`.testimonial-controls.fits-desktop` — the one rule in
   `home.css` that is not in `v2.html`), and resumes autoplay on mouseleave instead of stopping.
2. **Server-rendered detail.** The carousel dots, the stat numbers and both copies of the marquee
   items are in the SSR HTML rather than being created by script after mount. Removes a hydration
   layout shift (and for the marquee, a visible first-frames jump while it scrolled a single copy).
   Visually identical once hydrated.
3. **Dead data attributes dropped.** `data-count-to`/`data-prefix`/`data-suffix` on the stats and
   `data-depth` on the hero blobs existed only so the vanilla `querySelectorAll` could read config
   off the DOM. That config is props now. No CSS selected on them.

The promotion is **done**. What's left of it: `/v2` and its rewrite stay until the human retires
them (see above), and `noindex` stays until the human decides otherwise.

### Real components (the port is complete)

- **Hero headline** → `components/SplitText` (React Bits SplitText; GSAP is a bundled npm dep now,
  no CDN script).
- **Hero image panel** → `components/HeroReveal` (Framer Motion angled clip-path reveal, lifted
  from a 21st.dev block — only the image panel, not its bundled text column).
- **Nav + footer** → `components/SiteNav`, `components/SiteFooter`. Extracted **before** a second
  route gets migrated, so there's one copy to change. `SiteNav` holds all of its own state (sticky
  scroll, dropdown, mobile sheet, accordion) — plus the keyboard/focus behavior, which is
  load-bearing and documented in the component. Re-verify by keyboard if you touch it. The ids
  (`siteNav`, `navMenu`, `solutions*`, ...) are now kept only so the markup stays diffable
  against `/v2`; nothing looks them up.
- **Scroll reveal** → `components/Reveal`. Renders the real element via an `as` prop, never a
  wrapper: `home.css` staggers siblings with `.reveal:nth-child(n)`, so an extra div would break both
  the stagger and the grid layout.
- **Stat counters** → `components/Counter`. SSR renders the final value ("25+"), so the real numbers
  are in the HTML without JS; the count-up is decoration on top.
- **Testimonial carousel** → `components/TestimonialCarousel`. Real state, quotes in one array, and
  the three behavior fixes listed above.
- **WebGL CTA gradient** → `components/GradientBlob`. Shader source unchanged; what's new is
  teardown (rAF, observer, resize listener, and the GL context via `WEBGL_lose_context`), since the
  vanilla version leaked all four across client-side navigations.
- **Hero cursor blobs** → `components/HeroBlobs`. Renders the `.hero-visual` container and takes the
  image panel as children; writes transforms via refs rather than state, since it fires on every
  mousemove.
- **Trust marquee** → `components/TrustMarquee`. The item list renders **twice**, which is required:
  `@keyframes marqueeScroll` animates to `translateX(-50%)`, so the loop is only seamless with
  exactly two copies. This replaced `marqueeTrack.innerHTML += marqueeTrack.innerHTML` — React's own
  DOM being mutated behind its back after mount.

### No vanilla DOM code left

The port is **done and then some**. `legacy-behaviors.js` (~450 lines at the start) shrank to a
single function, `app/border-glow.js` — and that file is gone too, along with the hover glow it
drove (removed by request across the whole repo; see "Removed: the border glow" below). Nothing on
the homepage touches the DOM directly anymore.

- **Motion preference:** every animation honors `prefers-reduced-motion`, with a `?motion=1`
  override for previewing (see `lib/useMotionPreference.ts` and `window.__forceMotion`).

---

## Removed: the border glow (don't re-add it)

The cursor-following border glow on cards (`.border-glow-card` + `.edge-light`, the React Bits
BorderGlow port) was **removed from the entire repo by request** — the homepage, all 11 live legacy
pages, both `_template.html` files, and the `/v2` reference draft. Deleted with it:
`app/border-glow.js`, `components/BorderGlow/`, and the two `dev/borderglow-*.html` previews (which
emptied `dev/`).

Cards now use only their own styling (`.solution-card`, `.benefit-card`, `.talk-card`,
`.testimonial-card` and the `.benefit-card:hover` lift). If you are reading old commits or the
component list and wondering where the glow went: it was a deliberate design decision, not lost
work. Don't reintroduce it without being asked.

---

## `/meet-our-team` (shipped) — the second real route

`app/meet-our-team/` is the first page built *after* the homepage port, so it's the working
example of how a new route should be assembled.

- **Content is copied from the WordPress site**, https://kibadvisors.com/meet-our-team/. Names,
  roles, taglines and bios in `app/meet-our-team/team-data.ts` are **verbatim** from there — the
  only editorial change is splitting each bio into paragraphs at existing sentence boundaries. If
  that page changes, re-copy; don't paraphrase. (The `focus` badge tags are ours.)
- **Photos are the existing advisor headshots** (`/advisors/img/*.jpg`), the same files the legacy
  `/advisors/*` booking pages use. Each card's calendar icon deep-links to that person's booking
  page.
- **Structure:** `page.tsx` (server component: metadata + noindex) → `MeetOurTeamPage.tsx` (client),
  reusing `SiteNav`, `SiteFooter`, `Reveal`, `GradientBlob` and the `.hero` / `.band` / `.cta-band`
  shells from `home.css`. Only the team block itself is new.
- **`noindex`** matches the rest of the subdomain and is doubly deliberate here: the same bios are
  live on kibadvisors.com, and two indexable copies would compete. The human's call to change.
- **`SiteNav` gained a "Team" link** pointing at this route, so it now shows on the homepage too.

### The team block, and the one CSS trap to know about

`components/ui/team-section-block-shadcnui.tsx` is an integrated third-party shadcn block
(framer-motion 3D-tilt cards). Two things were changed on the way in: it's **props-driven** (content
lives in `team-data.ts`, not in the component), and it's styled **only off the semantic tokens**
(`bg-card`, `text-muted-foreground`, `bg-primary`, …) with no literal colors. The page wraps it in
`<div className="dark">`, which is what maps those tokens onto KIBA's navy palette via the `.dark`
block in `globals.css` — that's how a generic light-mode block became an on-brand navy band without
restyling it.

**The trap:** `home.css` is a plain **unlayered** stylesheet, and every Tailwind utility lives in
`@layer utilities`. Unlayered CSS beats layered CSS regardless of specificity, so on any route that
imports `home.css` (i.e. any route using the shared nav/footer) these bare element rules silently
win over your Tailwind classes:

```css
section{ padding:96px 0; background-color:#ffffff; }
button,.btn{ padding:14px 28px; border:none; font-size:15.5px; }
a{ color:inherit; }
```

The first pass at this page shipped white text on a white band because of exactly that. The fixes
used, and the ones to reuse: mark the colliding utilities with `!` (`bg-background!`, `py-24!`,
`p-0!`, `text-xs!`, `text-muted-foreground!`), and prefer `ring-1 ring-border` over `border`, since
`home.css` never touches `ring`. Everything `home.css` doesn't select is plain Tailwind — don't
blanket-`!` a component.

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
- **New `app/` routes use Tailwind, not hand-rolled CSS** (except the homepage, which intentionally
  keeps `home.css` verbatim so it stays diffable against `/v2` — see above). See "Design system"
  for where the tokens live.
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
│   ├── page.tsx                  ← "/" route: metadata + noindex, renders HomePage
│   ├── HomePage.tsx              ← the homepage itself (client component)
│   ├── home.css                  ← v2.html's <style> block, minus the glow + one divergence
│   └── meet-our-team/            ← "/meet-our-team": page.tsx + MeetOurTeamPage.tsx + team-data.ts
├── components/
│   ├── SplitText/                ← hero headline
│   ├── HeroReveal/               ← hero image panel
│   ├── SiteNav/ · SiteFooter/    ← shared nav + footer (use these on new routes)
│   ├── Reveal/ · Counter/        ← scroll reveal, animated stat counters
│   ├── TestimonialCarousel/ · TrustMarquee/
│   ├── HeroBlobs/ · GradientBlob/ ← hero cursor parallax, WebGL CTA gradient
│   └── ui/                       ← shadcn primitives: button.tsx (unused), badge.tsx, card.tsx
│       └── team-section-block-shadcnui.tsx  ← props-driven team grid (used by /meet-our-team)
├── lib/
│   ├── utils.ts                  ← cn() helper
│   └── useMotionPreference.ts    ← ?motion=1 override for previewing animations
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
`<style>` block (and in `app/home.css`) for the legacy side. **Tailwind v4 is CSS-first — there is no
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
  `iconLibrary: lucide`). `badge.tsx` and `card.tsx` were added via `npx shadcn add` for the team
  block and are in use; `components/ui/button.tsx` is used only inside that block — the homepage
  and every page CTA still use hand-rolled `.btn`/`.btn-primary` classes from `home.css`. If you migrate the nav to
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

- Push to `main` → Vercel auto-deploys to go.kibadvisors.com. Clean URLs and all path
  redirects/rewrites live in `next.config.js` (there is no `vercel.json`).
- Typical loop: edit → `npm run build` (must pass) → review diff → `git add -A && git commit && git push`.
- After deploying, verify on the live URL (logo, form/calendar, and that the correct version
  shipped — a quick tell is the testimonial text). For the homepage, also spot-check `/` against
  `/v2`, allowing for the listed intentional divergences.

---

## Scope boundary (decided — do not re-open)

**This repo only ever changes `go.kibadvisors.com`. Nothing here touches what's live at
`kibadvisors.com`.** The main site is a separate WordPress install; it is not migrated, not
replaced, and not repointed by any work in this repo.

This was settled at the `/v3` promotion, which is now done: the redesign became the root of
`go.kibadvisors.com` (`app/page.tsx`), the `/` → `kibadvisors.com` redirect was removed, and the
canonical is `https://go.kibadvisors.com/`. The subdomain root stays **`noindex`** — decided, so
the WordPress site remains the only indexable KIBA homepage.

- Do **not** propose a domain move, a DNS change, a WordPress export, or a cross-domain
  canonical/redirect pointing at `kibadvisors.com`. Out of scope.
- Do **not** drop the homepage's `noindex` without the human asking for it.

---

## Open decisions (ask the human — don't assume)

- _None blocking._ Two standing decisions, both the human's to revisit and neither to be changed
  by an agent on its own: whether the homepage stays `noindex` (currently yes), and when `/v2` +
  its rewrite get retired (currently kept as the visual reference).
