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

1. **The testimonial carousel is gone.** `/v2` (and the first port) had a three-slide carousel with
   arrows, dots and autoplay. The whole site now uses one treatment — the scrolling columns in
   `components/ui/testimonials-columns-1.tsx` — so the carousel component was deleted. This is the
   largest single divergence from `/v2`; the two sections are not comparable any more, so don't
   diff that band. `home.css` still carries the now-dead `.testimonial-controls.fits-desktop`
   rule (and the rest of the carousel CSS) because that file is kept byte-stable against
   `v2.html`; it selects nothing.
2. **Server-rendered detail.** The carousel dots, the stat numbers and both copies of the marquee
   items are in the SSR HTML rather than being created by script after mount. Removes a hydration
   layout shift (and for the marquee, a visible first-frames jump while it scrolled a single copy).
   Visually identical once hydrated.
3. **`--cream` has a different value.** `home.css` says `#e9f0fa`; `v2.html` still says the
   original warm `#f8f4ee`. So the `.section-alt` bands, the trust marquee and the two tinted
   solution cards read blue-grey on the live site and beige on `/v2`. See "Design system".
4. **Dead data attributes dropped.** `data-count-to`/`data-prefix`/`data-suffix` on the stats and
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
- **Testimonials** → `components/ui/testimonial-v2.tsx` (replaced `TestimonialCarousel`, then
  `testimonials-columns-1.tsx`; both deleted). See "Testimonials" below.
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
  reusing `SiteNav`, `SiteFooter`, `Reveal`, `GradientBlob`, `SplitText`, `HeroBlobs`, `HeroReveal`
  and the `.hero` / `.band` / `.cta-band` shells from `home.css`. Only the team block itself is new.
- **The hero is the homepage hero**, structurally: watermark, two-column `.hero-inner`, the
  split-text headline, the cursor-parallax blobs and the angled clip-path image panel. Don't change
  `.hero`'s padding to resize it — `.hero-inner > .hero-visual`'s `-76px/-96px` margins are tuned to
  that exact padding, and the panel is what gives the hero its height anyway.
- **The hero photo is `owner-cafe-laptop.webp`, shared with the homepage.** It's the only image in
  `public/img/hero/` cut for this panel (2600x2000); the rest are 800px wide and visibly soft when
  stretched to it. Swap in a real photo of the team when there is one, cut to roughly those
  dimensions.
- **The "Clarity first…" band is light here, navy on the homepage.** Deliberate: on this page it
  sits between the navy team section and the navy CTA band, and reusing home.css's `.band` would
  make the three read as one unbroken block. It's built with Tailwind rather than by editing
  `.band`, since those rules are shared with the homepage. Same triangle, recolored to a blue ramp.
- **`noindex`** matches the rest of the subdomain and is doubly deliberate here: the same bios are
  live on kibadvisors.com, and two indexable copies would compete. The human's call to change.
- **`SiteNav` gained a "Team" link** pointing at this route, so it now shows on the homepage too.

### The team block, and the one CSS trap to know about

`components/ui/team-section-block-shadcnui.tsx` is an integrated third-party shadcn block
(framer-motion 3D-tilt cards). Two things were changed on the way in: it's **props-driven** (content
lives in `team-data.ts`, not in the component), and it's restyled onto **KIBA's palette tokens from
the `@theme` block** in `globals.css` (`bg-navy-deep`, `text-ink`, `text-slate`, `ring-line`,
`bg-blue`, …) rather than the block's own colors or the light/dark semantic tokens. The result is
the homepage's own combination — white cards on a navy band, same contrast as `.solution-card` /
`.benefit-card`. (An earlier pass wrapped it in `<div className="dark">` to remap the semantic
tokens instead; that produced blue-on-blue cards and is gone.)

Cards size to their own content (`items-start`, no `h-full`): expanding one bio used to stretch its
two siblings and leave big empty panels beside it.

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

## `/about-us` (shipped)

`app/about-us/` is the third real route, built the same way as `/meet-our-team` — same hero
(SplitText + HeroBlobs + HeroReveal), the shared nav/footer/Reveal, `home.css`'s
`.section-head` / `.benefit-card` / `.klist` shells, and Tailwind only for the two sections
`home.css` has no shell for (the navy "How we're different" band and the light motto band).

- **The copy is adapted, not verbatim** — unlike `team-data.ts`. The source page
  (https://kibadvisors.com/about-us/) is a list of statements with no connective tissue, so the
  sentences that carry meaning are kept word-for-word in `about-content.ts` (the origin line, the
  problem statement, the vision, the five values, the differentiation line, the services, the
  client profile, the closing commitment) and the headings and connecting lines around them were
  written for this layout. Anything quoted on the source page is reproduced exactly.
- **The nav's "About" link now points here** instead of at `https://kibadvisors.com`. That's the
  only reason the link existed off-site — there was no about page in this repo. The WordPress
  about page is untouched and stays the indexable copy.
- **The hero photo is `couple-consultation.webp`, which is 800x533** and therefore upscales in a
  panel that wants ~640x700. It's the best editorial fit available and it holds up at 1x, but
  re-cutting that shot at ~2600x2000 (like `owner-cafe-laptop.webp`) is the real fix.
- **The five values render 3 + 2**, the same split the homepage uses for its solution rows
  (`.benefits-grid` then `.grid-2`).

---

## `/capital-solutions` + the six program pages (shipped)

The WordPress site puts all six financing programs on one page. This site gives each program its
own page, with a hub at `/capital-solutions` that the nav dropdown's first item points at.

```
/capital-solutions                                    hub
/capital-solutions/sba-loans
/capital-solutions/business-acquisition-loans
/capital-solutions/term-loans
/capital-solutions/equipment-financing
/capital-solutions/commercial-real-estate-loans
/capital-solutions/lines-of-credit
```

- **One route, six pages.** `[slug]/page.tsx` + `ProgramPage.tsx` render all six from `PROGRAMS`
  in `solutions-data.ts`; `generateStaticParams` still emits six static pages, and
  `dynamicParams = false` makes an unknown slug 404. **Adding a seventh program is one entry in
  `PROGRAMS`** — the page, the nav dropdown and the footer column all follow from it. Do not
  create a seventh route folder.
- **`SiteNav` and `SiteFooter` both import `PROGRAMS`** so the menu, the footer and the pages
  can't drift apart. The nav dropdown is titled **"Capital Solutions"** (was "Solutions").
- **Copy provenance, marked in the file:** every `summary`, every `fit[].point` and every
  `caution` line is **verbatim** from https://kibadvisors.com/capital-solutions/ — those are KIBA's
  actual position on each product. Headlines, hero subs, `expand`, `usedFor` and the `fit[].label`
  card headings were written for this layout. The labels exist because the carousel card needs a
  title above the sentence; never trim a `point` to make its label fit.
- **No numbers, deliberately.** The source quotes no rates, terms, amounts or qualification
  thresholds and none were invented. Anything of that kind is a lending claim and has to come from
  the human — don't let a future copy pass add "typical terms" tables.
- **Hero images are placeholders** pointing at existing `public/img/hero/` photos while real stock
  is gathered. Swapping one is a one-line `heroImage` / `heroImageAlt` change in
  `solutions-data.ts`. All but `owner-cafe-laptop.webp` are 800x533 and upscale in the hero panel;
  replacements want ~2600x2000.
- **`/business-acquisitions` (legacy) still exists and is untouched.** It's a campaign landing page
  with its own GHL form, and it's where that ad traffic lands. It came out of the nav dropdown,
  which now points at the program page instead. Merging or retiring it is a separate, deliberate
  decision — don't do it as cleanup.

---

## Testimonials — one treatment, on EVERY page

**Every page in this repo carries a testimonial section.** Not "most" — all of them, including the
`/thank-you` and `/ty-cal` confirmation pages. If you add a page, it gets one; that is a standing
requirement, like the animations.

The design is `components/ui/testimonial-v2.tsx` (v2: semantic list/blockquote/cite markup, cards
that lift on hover *and* keyboard focus, a pill badge above the heading, a section entrance
animation). There is no second style — use `<TestimonialsSection />`, overriding only `heading`
and `intro` per page.

Coverage, so a gap is obvious: `/`, `/about-us`, `/meet-our-team`, `/capital-solutions`, all six
`/capital-solutions/*`, and every legacy page except `v2.html` (frozen reference — leave it alone).

**Two element selectors will bite you here.** `home.css` and every legacy page style the SITE
footer and sections with bare element rules, and unlayered CSS beats Tailwind's layered utilities:

- `footer{ background:var(--navy-soft); padding:64px 0 40px }` — the card's own `<footer>` renders
  as a **navy block** unless it opts out (`bg-transparent! px-0! pb-0! pt-5!`, or the `.tcard footer`
  rule on the legacy side). This shipped broken once.
- The legacy pages don't share a body font (`thank-you.html` sets Instrument Serif on `<body>`), so
  anything in the section that inherits its family renders differently page to page. Families are
  set explicitly on `.tsec-head p` and `.trole` for that reason — don't remove them.

- **`lib/testimonials.ts` is the single source of truth** for the React routes. The legacy pages
  can't import it, so each carries the same list in a `TESTIMONIALS` config array — keep them in
  sync when a quote changes.
- **There are only FOUR real testimonials.** That drives the layout: `splitIntoColumns` keeps at
  least two cards per column, so four render as two columns and it becomes three by itself at six.
  **Do not pad the array to fill the grid.** Inventing client quotes for a financial advisory firm
  is not a design decision.
- **Avatars are initials monograms, not photos**, for the same reason — we have no images of these
  clients, and a stock face beside a real named quote is a fabrication. Add a real `image` to an
  entry and both implementations will use it.
- **Phones get one column containing every quote**; the round-robin split starts at `md` / 861px.
  Hiding the second column below that (which the source block does) would hide half the
  testimonials on a phone. Both implementations handle this the same way.
- The attributions were unified on the way in: the homepage used to say "Business Owner" where the
  legacy pages named the client, and `business-acquisitions.html` had lost a word from Raul's
  quote. The named versions won.
- **Known gap, deliberate:** the scroll does not pause on hover, matching the source block. WCAG
  2.2.2 wants a pause mechanism for content that auto-moves for more than five seconds, so this is
  worth revisiting — it's flagged rather than silently changed, because it alters the feel.

### Adapting third-party blocks: what gets substituted

Both this and the bento grid came from 21st.dev-style blocks, and both were rewired to what the
repo already has rather than pulling in a parallel stack. When you integrate the next one, do the
same:

| Block shipped with | Use instead | Why |
| --- | --- | --- |
| `motion/react` | `framer-motion` | Same library, newer name. Installing both ships it twice. |
| `@radix-ui/react-icons` | `lucide-react` | `components.json` sets `iconLibrary: lucide`. |
| Radix-Slot `Button` + `asChild` | `components/ui/button.tsx` + `render` | Repo's shadcn style is `base-nova` on `@base-ui/react`. Two Buttons with one name is worse than an adapted import. |
| Block's own colors / semantic tokens | KIBA `@theme` tokens | `bg-navy-deep`, `text-ink`, `text-slate`, `ring-line`, `bg-blue`. |

Install only what genuinely adds capability. Across three blocks the only real new dependency was
`embla-carousel-react` (for `services-card.tsx`) — everything else on their lists was already here
under a different name.

**One exception to the Button rule, found the hard way.** `services-card.tsx`'s carousel arrows are
plain `<button>`s, not `components/ui/button.tsx`. Wired to the repo's Base UI Button the click
silently did nothing — Embla was fine (ArrowRight and dragging both moved the track), the handler
just never ran. For a control that must work, and where none of the Button variants were being
used anyway, a native button is the right call. **If you use the repo Button for something
interactive, click it in a browser** — this failure mode is silent and the build is clean.

---

## The "may make sense if…" carousel (`/capital-solutions/*`)

Each program page presents its four `fit` points as an Embla carousel of tall gradient cards
(`components/ui/services-card.tsx`), three visible at a time on desktop and one on mobile, with the
fourth reachable via the arrows, arrow keys or a drag.

- Card tints come from `FIT_GRADIENTS` in `ProgramPage.tsx`, by position — cool tints only, because
  the section sits on `.section-alt`'s warm cream and a warm card in that reads as a mistake.
- No `<Reveal>` around it: the carousel runs its own in-view stagger, and both would double-fade.
- Under reduced motion the entrance stagger is skipped and Embla's `duration` drops to 0, so the
  carousel still works but jumps rather than glides. Verified: cards sit at opacity 1 and the
  arrows still page.

---

## The bento grid (`/capital-solutions/*`)

The "Not sure this is the one?" cross-links on every program page are `BentoCard`s in a
`BentoGrid`: five cards over two rows of three, with the fourth spanning two columns so the grid
fills exactly instead of reading as a 3+2 with a hole in it.

- **Don't put `grid-rows-*` on `BentoGrid`.** It sets `auto-rows-[16rem]`, and declaring explicit
  rows makes them `auto` and collapses the cards to text height. (Shipped that way for one build.)
- The whole card is the anchor; the block put a small button in the corner and left the rest of the
  card dead.
- `Program.icon` is a Lucide component, so **`PROGRAMS` entries must not cross the server→client
  boundary.** `[slug]/page.tsx` passes the *slug* and `ProgramPage` looks the program up itself —
  passing the object made the build hang and fail trying to serialize a function.

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
- **Every new page gets the animations wired up.** Not optional and not a polish pass — a page
  whose content just appears is a bug on this site. See "Motion" below for the checklist and the
  one mistake that has now been made twice.
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
│   ├── meet-our-team/            ← "/meet-our-team": page.tsx + MeetOurTeamPage.tsx + team-data.ts
│   ├── about-us/                 ← "/about-us": page.tsx + AboutUsPage.tsx + about-content.ts
│   └── capital-solutions/        ← hub + the six program pages
│       ├── solutions-data.ts     ←   ALL the copy; nav + footer read PROGRAMS from here
│       ├── ProgramPage.tsx       ←   one shared layout for all six programs
│       ├── CapitalSolutionsPage.tsx / page.tsx   ← "/capital-solutions" hub
│       └── [slug]/page.tsx       ←   "/capital-solutions/<program>" (SSG, 6 static pages)
├── components/
│   ├── SplitText/                ← hero headline
│   ├── HeroReveal/               ← hero image panel
│   ├── SiteNav/ · SiteFooter/    ← shared nav + footer (use these on new routes)
│   ├── Reveal/ · Counter/        ← scroll reveal, animated stat counters
│   ├── TestimonialCarousel/ · TrustMarquee/
│   ├── HeroBlobs/ · GradientBlob/ ← hero cursor parallax, WebGL CTA gradient
│   └── ui/                       ← shadcn primitives: button.tsx, badge.tsx, card.tsx
│       ├── team-section-block-shadcnui.tsx  ← props-driven team grid (/meet-our-team)
│       ├── testimonial-v2.tsx               ← THE testimonial treatment, whole site
│       ├── bento-grid.tsx                   ← program cross-links (/capital-solutions/*)
│       └── services-card.tsx                ← Embla carousel, "may make sense if…" cards
├── lib/
│   ├── utils.ts                  ← cn() helper
│   ├── testimonials.ts           ← the four real client testimonials (single source)
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
- **Testimonials block** — now a `TESTIMONIALS` config array plus a small injector script near the
  bottom of each legacy page (the same config-block convention the rest of those pages use). Edit
  the array, never the generated markup, and keep it in sync with `lib/testimonials.ts`.
- **KIBA contact:** phone `251-210-8445`, email `info@kibadvisors.com`.

If you change any shared element, apply the same change to every legacy page and both templates.
(For the migrated `app/` side, the fix is the opposite: extract the nav/footer into shared React
components so there's only one copy — do this before migrating a second real page.)

---

## Motion — required on every page (checklist)

Every page on this site animates its content in. A new route where text and blocks simply appear
is not "done" — treat it the same as a missing style. Match the homepage: it is the reference for
what animates and how.

**Wire these up on any new page:**

| Element | What it uses |
| --- | --- |
| The `<h1>` | `components/SplitText` (per-character GSAP reveal) |
| The hero image panel | `components/HeroReveal` (clip-path wipe) + `components/HeroBlobs` |
| Section heads, cards, list blocks, CTA bands | `components/Reveal` with `reveal` in the className |
| Numbers/stats | `components/Counter` |
| Navy CTA band | `components/GradientBlob` |

`Reveal` renders the real element via `as` — never a wrapper (it would break the `nth-child`
stagger and grid layout). `home.css` ships stagger delays only for `.benefits-grid`, `.grid-2`,
`.solutions-row`, `.testimonial-grid` and `.footer-grid`; anywhere else, set
`style={{ transitionDelay: '0.08s' }}` by hand, as the two hero columns and the `/about-us` outcome
tiles do.

**The `?motion=1` trap — this has bitten twice, don't make it three times.** Motion has two halves:

1. **JS-driven** (GSAP, framer-motion, the `Reveal` observer) — reads `forceMotion` from
   `lib/useMotionPreference.ts`.
2. **CSS-driven** (every `.reveal` fade, every hover transition) — governed by
   `@media (prefers-reduced-motion: reduce){ html:not(.force-motion) *{ transition-duration:0.001ms !important } }`
   in `home.css`, so it needs the **`force-motion` class on `<html>`**.

That class is set by `useMotionPreference()` and nowhere else. It originally lived in
`app/HomePage.tsx`'s own effect, which meant `?motion=1` did half a job on `/meet-our-team` and
`/about-us`: JS animations ran, every CSS transition stayed clamped to 0.001ms, and the pages
looked static on any machine reporting reduce. **Any page with animations must call
`useMotionPreference()`** (pass its `forceMotion` to `SplitText`). Don't reimplement the flag
locally.

**How to verify, and why the obvious check lies.** On a machine that does *not* report
`prefers-reduced-motion: reduce`, everything animates whether or not the override works — so a
local eyeball test proves nothing. Check it the way the bug was actually found:

```js
// playwright
const page = await browser.newPage({ reducedMotion: 'reduce' });
await page.goto('http://localhost:3000/<route>?motion=1');
await page.evaluate(() => document.documentElement.className);        // must be "force-motion"
await page.evaluate(() => getComputedStyle(document.querySelector('.hero-sub')).transitionDuration);
// must be 0.7s, NOT 0.000001s
```

Then sample opacity a few hundred ms apart to confirm the reveal is actually mid-flight rather
than snapping to its end state.

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
- **`--cream` is not cream.** It was `#f8f4ee`, a warm beige and the only warm tone in an otherwise
  navy/blue palette — it fought every cool-tinted card placed on it. It is now `#e9f0fa`, a soft
  cool blue-grey. The variable name and the `.solution-card.is-cream` class keep their old names on
  purpose, so the markup still diffs against `v2.html`; only the value changed. It drives four
  things: the `.section-alt` bands, the homepage trust marquee, and two homepage solution cards.
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
