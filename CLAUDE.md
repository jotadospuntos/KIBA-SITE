# CLAUDE.md — Project guide for AI agents

This repo IS KIBA's website. Deployed on **Vercel** (auto-deploys on every push to `main`) at
**https://kibadvisors.com**, which it took over from a WordPress site (see "Main domain").
"KIBA" = Kingdom Impact Business Advisors, a funding/advisory company. It started as the
referral-partner and advisor booking pages on **go.kibadvisors.com**, which now 301s here.

---

## The migration is DONE — every page is a real route

This repo was static HTML, then a Next.js app with a `rewrites()` bridge serving the unmigrated
pages from `public/legacy/`. **That bridge is gone.** Every page is now an `app/` route.

- **`public/legacy/` contains exactly one file: `v2.html`**, the frozen homepage-redesign reference
  served at `/v2`. It is deliberately kept (see below) and is the only `rewrites()` entry left.
- **There is a real build step.** Run `npm install && npm run build` before pushing.
- **`vercel.json` holds ONE thing: the debt-schedule cleanup cron.** Redirects and the one remaining
  rewrite live in `next.config.js`. Don't move routing back into `vercel.json`.
- **Images/favicons never moved.** `public/img/...`, `public/partners/img/...`,
  `public/advisors/img/...` and the root favicons keep their original public paths, because several
  `og:image` tags reference them as absolute `https://go.kibadvisors.com/...` URLs.
- **`public/wp-content/uploads/` is a byte-for-byte mirror of the WordPress media library**
  (355 files: every original plus every resized variant WordPress generated), at the exact same
  paths. It exists so `kibadvisors.com/wp-content/uploads/...` URLs keep resolving after this site
  replaces WordPress. **The team's email signatures load from there** (`2026/08/*-Email-Signature*`),
  as may GHL email templates, partner sites and old social posts. Nothing on this site uses these
  files, and that's expected. Don't delete them as dead weight.

### What this means for you

The old "edit the config block, keep the file self-contained, apply global changes to every legacy
page AND both templates" workflow **no longer exists**. Those templates are deleted. Nav, footer,
testimonials, motion and the design tokens now live in exactly one place each, so a global change
is a single edit. If you find advice in an old commit about copying markup between HTML files, it
is describing a repo that no longer exists.

**URLs did not change.** Every migrated page kept its exact path, because ad traffic, GoHighLevel
redirects and partner links all point at them.

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
- **`/` is indexed** since the main-domain launch; it's KIBA's one public homepage. (It was
  `noindex` while it lived on go.kibadvisors.com beside the WordPress site.)

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
3. **`--cream` has a different value.** `home.css` says `#f2f4f7`; `v2.html` still says the
   original warm `#f8f4ee`. So the `.section-alt` bands, the trust marquee and the two tinted
   solution cards read blue-grey on the live site and beige on `/v2`. See "Design system".
4. **Dead data attributes dropped.** `data-count-to`/`data-prefix`/`data-suffix` on the stats and
   `data-depth` on the hero blobs existed only so the vanilla `querySelectorAll` could read config
   off the DOM. That config is props now. No CSS selected on them.

The promotion is **done**. What's left of it: `/v2` and its rewrite stay until the human retires
them (see above).

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
- **Structure:** `page.tsx` (server component: metadata) → `MeetOurTeamPage.tsx` (client),
  reusing `SiteNav`, `SiteFooter`, `Reveal`, `GradientBlob`, `SplitText`, `HeroBlobs`, `HeroReveal`
  and the `.hero` / `.band` / `.cta-band` shells from `home.css`. Only the team block itself is new.
- **The hero is the homepage hero**, structurally: watermark, two-column `.hero-inner`, the
  split-text headline, the cursor-parallax blobs and the angled clip-path image panel. Don't change
  `.hero`'s padding to resize it — `.hero-inner > .hero-visual`'s `-76px/-96px` margins are tuned to
  that exact padding, and the height is now pinned site-wide anyway (see "One hero height").
- **The hero photo is `owner-cafe-laptop.webp`.** It was shared with the homepage and with
  `/capital-solutions` until each got its own supplied photo (`industrial-operator.webp` and
  `advisor-client-review.webp`), so this page is now the only user of it. It's cut for this panel
  (2600x2000), unlike the 800px-wide stock in `public/img/hero/`, which is visibly soft when
  stretched to it. Swap in a real photo of the team when there is one.

> **Cutting a new hero photo — two constraints, not one.** 2600x2000 is the size. The second one is
> placement: the panel goes portrait at narrow desktop widths, so `background-size:cover` shows
> only the middle ~48% of the image at 1280px. **The subject has to sit near the middle of the
> frame** or they are cropped out entirely there. `industrial-operator.webp` was cut from a
> 4200x2794 original specifically to put its subject at 40% across; verified in a browser at 1280,
> 1440, 1920, 2560 and 390.
>
> **The ~48% figure is the worst case, not the usual one.** It assumes the homepage's 880px-tall
> panel. The panel's height is set by the text column beside it, so shorter heroes show much more:
> measured at 1280px the bands are 72% on `/capital-solutions/equipment-financing`, 66% on
> `commercial-real-estate-loans` and 83% on `/contact-us`. Measure the route you're cutting for
> rather than assuming 48% — but don't design right up to the limit either.

### Composite heroes

`/capital-solutions/equipment-financing` and `/capital-solutions/commercial-real-estate-loans` use
**built composites** rather than single photographs, because one machine or one building on the
page implies that is the only thing we finance. `tools/hero-mashups.py` rebuilds all three of the
images it owns from the originals; the `.webp` outputs are committed, and the script exists so a
composite can be re-cut without reverse-engineering the finished image. Point its `D` at wherever
the originals are.

- **Equipment is a 2x2 and that is load-bearing.** A 2x2 is the only multi-tile layout that
  survives the panel going portrait, because every tile touches the centre, so the middle band
  still shows part of all four. Columns or stripes would hide half of them. Bright and dark tiles
  alternate on the diagonal so it doesn't read as a light half and a dark half.
- **Commercial property is two stacked bands, not side by side.** Both subjects are wide
  buildings and a portrait slot would cut either to a sliver. The heights are unequal (960 / 1026)
  because the industrial unit fills more of its frame vertically than the office does.
- **The tiles are tone-graded, and without it the collages don't work.** `grade()` pulls each tile
  toward a common exposure and a common cool cast (a `pull` below 1 keeps some of each photo's own
  exposure so they don't flatten to one grey). The equipment sources are a clinical white CT
  suite, a night car park, full daylight and a red-lit server aisle; ungraded they read as four
  clippings stuck together. The property pair is graded harder still, since the office is shot at
  a warm sunset and warm tones fight this palette.
- **`kiba-office-lobby.webp` (`/contact-us`) is deliberately NOT graded.** It carries the KIBA
  logo and the grade would shift the brand blue. It is a **branded interior render supplied by the
  business, not a photograph of a real office** — worth knowing before anyone captions it as one.
- **The "Clarity first…" band is light here, navy on the homepage.** Deliberate: on this page it
  sits between the navy team section and the navy CTA band, and reusing home.css's `.band` would
  make the three read as one unbroken block. It's built with Tailwind rather than by editing
  `.band`, since those rules are shared with the homepage. Same triangle, recolored to a blue ramp.
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
- **Real photos so far: the hub, `lines-of-credit`, `equipment-financing` and
  `commercial-real-estate-loans`.** All supplied by the business and cut to 2600x2000 for this
  panel. **Three are still placeholders** — `sba-loans`, `business-acquisition-loans` and
  `term-loans` point at 800x533 stock in `public/img/hero/` and upscale visibly. Swapping one is a
  one-line `heroImage` / `heroImageAlt` change in `solutions-data.ts`. Replacements want
  ~2600x2000 *and* their subject near the middle of the frame — see the callout under
  `/meet-our-team`, which is the constraint that is easy to miss.
- **Two of those heroes are composites, not photographs** — see "Composite heroes" below.
- **`/business-acquisitions` (legacy) still exists and is untouched.** It's a campaign landing page
  with its own GHL form, and it's where that ad traffic lands. It came out of the nav dropdown,
  which now points at the program page instead. Merging or retiring it is a separate, deliberate
  decision — don't do it as cleanup.

---

## Testimonials — one treatment, on EVERY page

**Every page in this repo carries a testimonial section** — with two exceptions, below. That
includes the `/thank-you` and `/ty-cal` confirmation pages. If you add a page, it gets one; that is
a standing requirement, like the animations.

**The exception is legal pages** (`components/LegalPage`). A scrolling wall of client praise in the
middle of a privacy policy undercuts the document and reads as a marketing insert on something
people come to for compliance information. Legal pages keep the CTA band — and specifically its
`id="talk"`, or the nav's "Let's Talk" button is dead there — but not the testimonials.

**The second exception is `/debt-schedule`** (decided by the human). It's an intake form: a wall of
client praise in the middle of someone entering their debts reads wrong, for the same reason it
does on a privacy policy. Same terms as legal pages — CTA band kept, with its `id="talk"`.
**`/funding-application` is the third**, on the same terms and for the same reason (decided by
the human).

The design is `components/ui/testimonial-v2.tsx` (v2: semantic list/blockquote/cite markup, cards
that lift on hover *and* keyboard focus, a pill badge above the heading, a section entrance
animation). There is no second style — use `<TestimonialsSection />`, overriding only `heading`
and `intro` per page.

Coverage, so a gap is obvious: `/`, `/about-us`, `/meet-our-team`, `/capital-solutions`, all six
`/capital-solutions/*`, `/blog`, all three `/blog/*`, `/contact-us`, `/book-rr`, `/dscr-calculator`, `/thank-you`,
`/ty-cal`, `/referral-partners`, `/business-acquisitions`, all three `/advisors/*` and both
`/partners/*`. In other words every route except the two legal pages (`/privacy-policy`, `/terms-and-conditions`) and
`/debt-schedule` and `/funding-application` (above).
`v2.html` is the only other page without one, deliberately.

**One element selector will bite you here.** `home.css` styles the SITE footer with a bare element
rule, and unlayered CSS beats Tailwind's layered utilities:
`footer{ background:var(--navy-soft); padding:64px 0 40px }` — the testimonial card's own
`<footer>` renders as a **navy block** unless it opts out
(`bg-transparent! px-0! pb-0! pt-5!`). This shipped broken once.

- **`lib/testimonials.ts` is the single source of truth.** It used to be duplicated into every
  legacy HTML file; since the migration there is one copy.
- **There are SIX real testimonials, all supplied by the business.** Layout: one column on phones,
  two from `md`, three from `lg` — each breakpoint has its own round-robin split, so no quote is
  ever hidden (hiding a third column below `lg` would drop two of them on tablets). Scroll speed
  scales with each column's text length, so long quotes move at reading pace.
  **Do not pad the array to fill the grid.** Inventing client quotes for a financial advisory firm
  is not a design decision.
- **Quotes are verbatim; `\n\n` in a `quote` is a paragraph break** and renders as separate `<p>`s.
- **One client asked not to be named.** That entry has `anonymous: true` and the placeholder name
  "Business Owner"; the avatar is a generic icon rather than initials of a placeholder. Don't
  "fix" it with a real-looking name.
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

## The "straight talk" split (`/capital-solutions/*`) — PARTIAL ROLLOUT

The navy band used to be one section carrying both the caution ("When this isn't the right tool")
and the whole decision framework. It is being split in two:

1. **Navy** — the eyebrow, the heading, and the program's `caution`, which now has its own
   framer-motion fade (slower and a beat behind the heading, since it's the line the section
   exists for) instead of riding the shared `.reveal` transition.
2. **Light** — `components/ui/stats-2.tsx`: three boxes for the angles we work through, then the
   `DECISION_LEAD` / `DECISION_PHILOSOPHY` copy and a CTA.

**`SPLIT_STRAIGHT_TALK` in `ProgramPage.tsx` currently holds `sba-loans` only.** The other five
programs still render the old combined navy section, which is the `!splitStraightTalk` branch in
the same file. To roll out: add the slugs (or replace the Set with `true`) and delete that branch
plus the now-unused `DECISION_FACTORS`.

- `DECISION_ANGLES` in `solutions-data.ts` condenses `DECISION_FACTORS`' four angles into three for
  the three-box layout — the third box merges "Timing and future plans" with "How much flexibility
  you need". The first two labels stay verbatim.
- **The big slot in each box is a numeral, not a statistic.** The source block used "82%" / "99.9%";
  we have no measured figures and won't invent them for a lending firm. Same reason its five-star
  "Google reviews" footer was cut. Pass real numbers the day there are real numbers.

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

## `/blog` and `/contact-us` (shipped) — closing the gap against WordPress

These two existed on kibadvisors.com and had no equivalent here. Both are built the same way as
every other route: shared nav/footer/Reveal, the homepage hero, a testimonial section.

**`/blog`** — index plus `[slug]`. **Posts live in the database and are written in `/admin/blog`**
(see "The blog editor" under `/admin`); `app/blog/posts.ts` is gone. The three original articles
were imported verbatim from it by `drizzle/0003_import_wordpress_posts.sql`. **Their slugs match the
WordPress URLs exactly**, including `why-you-need-business-credit-and-how-to-build-it`, whose slug
doesn't match its title — `next.config.js` redirects the old root-level URLs to them, so never
change those three addresses.

- The article hero is deliberately **not** the two-column image hero — a post needs its title,
  byline and date above the fold, and the photo panel would push all of it down for nothing.

**`/contact-us`** — the repo previously had only a `#talk` anchor. Copy is verbatim from the
WordPress contact page, including the **office hours (Mon–Fri, 8:30 AM – 5:00 PM)**, which appeared
nowhere in this repo before. It embeds the same GoHighLevel calendar as the homepage, so contact
and booking are one page; that needs `form_embed.js`, which the page loads itself.

**Nav and footer changed with them:** "Blog" is a new top-level nav item, "Contact" now points at
`/contact-us` instead of `#talk` (the `#talk` anchor is still what "Let's Talk" targets), the
footer gained a Blog link, and **Instagram was added to the footer socials** — the live site lists
Facebook, Instagram and LinkedIn, and this footer only had two.

### Gaps against the live site: closed

- **Both legal pages are ported**, from text supplied by the business (see "Legal pages").
- **The homepage stats are settled** (the business's decision): `25+ Years · 24–72h Guidance Time ·
  $100M+ · 50+ States`. "500+ Deals Funded" was unverified and is gone from the homepage, the
  `/business-acquisitions` stat row and the trust marquee. The stats are marketing claims — don't
  add or change one without the human.
- **Client Portal** is in the nav (see "Shared elements").

---

## `/debt-schedule` (all three phases built)

The online Business Debt Schedule. **The brief is `docs/debt-schedule-build-spec.md`**; the
behavioural reference is `docs/debt-schedule-prototype.html`. Three phases: (1) the form, (2) PDF
filling with pdf-lib, (3) the API route + GoHighLevel storage.

- **`lib/debt-schedule/schema.ts` is the one source of truth** (zod). The dropdown strings in
  `constants.ts` must match the PDF's AcroForm options exactly or pdf-lib rejects them.
- **Two departures, both decided:** no testimonial section, and a `hero-compact` hero (see
  "Testimonials" and "One hero height").
- **"Other" goes on the PDF as plain "Other"**; the "Please specify" text is kept only in the
  submitted data (the template has no field for it).
- **One public page, one fixed autosave key** (`kiba-debt-schedule` in localStorage), cleared on
  submit. No per-client links.
- **Components** are in `components/debt-schedule/`. The per-debt editor is a Base UI Dialog
  (full-screen below `sm`). Every button in it is plain `<button>`/`.btn`, and each non-`.btn`
  button overrides `home.css`'s bare `button` rule with `!`. The dialog's action row is a `<div>`,
  because `home.css` makes any bare `footer` navy.

**The submit path** (`app/api/debt-schedule/route.ts`, Node runtime), in a deliberate order:
Turnstile → re-validate with the shared schema → fill the PDF → **save PDF + raw JSON to private
Vercel Blob** → GoHighLevel (upsert contact by email with five custom fields, add tag, add note) →
return a signed download link. Blob is written *before* GHL so a GHL outage can't lose a
submission; if GHL fails, the client still succeeds and a `ghl-failed.json` marker is written in
that submission's Blob folder for replay.

- **Private Blob, signed links (decided).** PDFs are never reachable by storage URL. Every link is
  `/api/debt-schedule/file?id&exp&sig` (HMAC, `lib/debt-schedule/signed-link.ts`): the client's
  expires in 1 hour, the staff link on the GHL contact lasts the full retention window.
- **45-day retention (decided).** `/api/debt-schedule/cleanup`, run daily by the cron in
  `vercel.json`, deletes Blob files older than `RETENTION_DAYS`. **It covers Blob only** — what's
  written onto the GHL contact (totals, the JSON field, the note) stays in GHL.
- **No IP rate limiting (decided): Turnstile alone.** The site key is in `constants.ts` (public by
  design); the secret is env-only.
- **GHL client is `lib/debt-schedule/ghl.ts`, not `lib/ghl.ts`** (that one is embed config). The
  location ID and the five custom-field IDs are constants there. Tags go in a separate call because
  tags on upsert can replace the contact's existing ones.
- **Env vars, Production AND Preview:** `GHL_PRIVATE_TOKEN`, `TURNSTILE_SECRET_KEY`,
  `DEBT_SCHEDULE_LINK_SECRET`, `CRON_SECRET`, `BLOB_READ_WRITE_TOKEN` (from the Blob integration).
  `lib/debt-schedule/env.ts` names the missing one in the log.
- **Never log the request body** or anything from it; GHL errors are logged as stage + HTTP status
  only, because GHL error bodies can echo the contact back.
- **The template must be traced into the function**: `next.config.js`'s
  `outputFileTracingIncludes` does it. Without it the route 500s on Vercel (ENOENT) but works locally.
- `scripts/test-fill-pdf.ts` writes 3/10/14-debt sample PDFs to `scripts/out/` (gitignored).

## `/funding-application` (built; SignWell in TEST MODE)

The online "KIBA Lending Application v6" (a one-page PDF with no fillable fields). The applicant
fills in a four-step form (Business → Financials → About you → Review); the server creates a **SignWell document from a template** with every
box pre-filled, and the applicant reviews and signs it in SignWell's embedded modal on the same page.
**Unlinked and noindex**: reached only by a direct link.

- **`lib/funding-application/fields.ts` is the one source of truth.** Every PDF box is one entry,
  and its `key` IS the SignWell field API ID (case sensitive; a mismatch fails silently — the box
  stays empty). The form, the review screen, the SignWell values and the server's validation all
  derive from it. `npx tsx scripts/test-signwell.ts` lists the IDs; with
  `--env-file=.env.local --check` it diffs the live template against the form, and with
`--send <email>` it sends a test document with each box showing its own ID.
- **Decided by the human:** **one owner for now** — the template has no fields in the PDF's
  Owner / Officer 2 column, so the form doesn't ask for one (`ownerFields(2)` in `fields.ts` still
  generates the `owner2_*` IDs for when it comes back); the applicant is owner 1 and the only
  signer; credit scores optional; `jesus@kibadvisors.com` CC'd on every document "for now"
  (`SIGNWELL_CC`); the human builds and owns the SignWell template.
- **Template facts the code depends on:** the signer placeholder is named **`Client`**
  (`SIGNWELL_PLACEHOLDER`); `owner1_printed_name` is SignWell's auto-fill Name field (filled from
  the recipient name, so the code doesn't send it); every field the form can leave blank (DBA,
  business cell, website, the three scores) must be **not required** in the template, or signing
  gets stuck on it. `scripts/test-signwell.ts --check` verifies all of this.
- **Config is `lib/funding-application/constants.ts`:** `SIGNWELL_TEMPLATE_ID`,
  `SIGNWELL_PLACEHOLDER` (`Owner 1`) and **`SIGNWELL_TEST_MODE = true`** — documents are
  watermarked and not binding until that is flipped, which needs the human's sign-off.
- **Submit path** (`app/api/funding-application/route.ts`): Turnstile → re-validate → SignWell
  (create from template, `embedded_signing` + `send_email` with a delay, so the link is also
  emailed if they don't sign in time; `embedded_signing_notifications` so the CC actually gets the
  completed copy) → GoHighLevel (upsert owner 1 by email + phone, note with the application link)
  → return the signing URL. A GHL failure is logged by SignWell document id and doesn't block signing.
- **The "application link" in the GHL note** is `/api/funding-application/document?id&exp&sig`, an
  HMAC link (`STAFF_LINK_DAYS`, 45) that streams the signed PDF from SignWell with our key; before
  signing it answers "not signed yet". It reuses `DEBT_SCHEDULE_LINK_SECRET` with a prefixed payload.
- **Sensitive data:** SSNs and DOBs are never autosaved to localStorage (a restored draft asks for
  them again), are masked on the review screen, and never go to GHL (nor do EIN, revenue or scores).
  Nothing is stored on our side — SignWell holds the document. Never log the body.
- **Env:** `SIGNWELL_API_KEY` (added), plus the debt schedule's `TURNSTILE_SECRET_KEY`,
  `GHL_PRIVATE_TOKEN`, `DEBT_SCHEDULE_LINK_SECRET`.
- The authorization paragraph (`authorization.ts`) is **verbatim from the PDF, typos included**.
- The progress bar is a `div`, not a `nav`: home.css styles every bare `nav` as the site header.

## `/dscr-calculator` (final; still unlisted)

A two-slide DSCR calculator, meant to drive traffic and opt-ins. Signed off as final. **Noindex, not in the sitemap, not
in the nav** until the human decides to list it (add it to `robots`, `app/sitemap.ts` and the nav together).

- **The math is `lib/dscr/calc.ts`**, taken from the advisors' workbook ("Summary Template.xlsx"):
  EBITDA = Net Income + Interest + Depreciation (**Gross Revenue is collected but NOT in the sum**),
  annual debt service = monthly payments x 12, DSCR = EBITDA / annual debt service (the **plain** figure). Checked by
  `npx tsx scripts/test-dscr.ts`.
- **Decided by the business, don't "correct":** plain DSCR with **no x1.25 anywhere**, neither as
  the divisor nor as a displayed figure (both were tried and removed; the workbook's "x 1.2" label is
  not applied either); MCA daily x **22**, weekly x **4** (round numbers on purpose); one tax year only; one
  field per debt type (EIDL, SBA, Equipment, LOC, MCA) plus named "Other business loans" rows.
- **No lender thresholds in the result** ("lenders want 1.25x"). That's a lending claim; the result
  copy only states the arithmetic until the business supplies bands.
- **"Need help?"** (slide 2) is a Base UI Popover that opens on hover AND on click/tap/Enter. Three
  options: check your statements, build the debt schedule first (`/debt-schedule`, new tab), have an
  advisor help (`/book-rr`). Inputs autosave to localStorage (`kiba-dscr-calculator`) so the
  debt-schedule detour loses nothing.
- **Nothing is sent anywhere yet**, and the hero says so. When the opt-in/GHL step is added, change
  that line. Not built yet: the opt-in, the debt schedule handing its payment totals back, and the
  `/embed` route.
- **`components/dscr/DscrCalculator.tsx` is built to be embedded**: self-contained Tailwind card,
  no dependency on `home.css` (but `!`-overrides on its buttons/headings so it survives it).
- The tool sits in the hero's right column, like `/book-rr`'s calendar, so on step 2 the hero runs
  taller than 880px (min-height, same as the booking pages).

---

## `/admin` + the database (steps 1–2 of 4 built)

A staff dashboard on a real database. Built in steps: (1) **foundation** — database, login,
roles, audit log — done; (2) the **blog editor** — done, see below; (3) the funding application
writes a **submission index** row; (4) optionally, the debt schedule does too. **Decided by the human:** no hosted CMS, and not GitHub as
storage.

- **Database: Supabase Postgres, used ONLY as a database.** Drizzle ORM; tables in
  `lib/db/schema.ts`, migrations in `drizzle/` (`npm run db:generate`, then `npm run db:migrate`
  from your machine — never part of the build). Supabase's Data API should be **switched off**;
  every table also has RLS on with no policies, and the anon/authenticated roles are revoked, so
  the public API gets nothing even if it's switched back on. Use the Pro plan (the free tier pauses).
  Login stays in Auth.js and images in Blob, so Supabase can be swapped for any Postgres.
- **NO SSNs, dates of birth or bank details in the database (decided).** They stay in SignWell and
  the expiring Blob files. Submissions will be an *index* (who, status, a document reference).
  Storing full applications is a separate decision: field encryption, retention, compliance.
- **Login: Auth.js v5 + Google, `@kibadvisors.com` only.** The `hd` param is just a hint; the real
  check is server-side in `lib/auth/index.ts` (verified email + `hd` claim + an active
  `admin_users` row). Sessions are JWT cookies (12h), but **`requireAdminUser()`
  (`lib/admin/access.ts`) re-checks the allowlist on every request**, so deactivating someone or
  changing a role takes effect immediately. **Call it first in every admin page AND every server
  action** — an action is a public POST endpoint, and the layout's check doesn't cover it.
- **Roles:** `admin` (everything) and `editor` (blog only). Editors get a 404 on admin-only pages.
  An admin can't change or deactivate themselves, so nobody can lock out the last admin. Seeded by
  `drizzle/0001_seed_initial_admins.sql` (jesus@ = admin, ariel@ = editor); after that, people are
  managed at `/admin/users`.
- **Audit log (`lib/admin/audit.ts`)**: sign-ins, refused sign-ins, sign-outs and user changes.
  `detail` must never hold form contents or anything a client typed. Add new actions to the
  `AuditAction` union.
- **Layers:** `middleware.ts` (edge, `/admin/*` + `/api/admin/*`) only proves a session exists;
  `app/admin/(protected)/layout.tsx` and each page re-check against the database. `/admin/sign-in`
  sits outside the route group so it can't loop.
- **The admin is plain Tailwind and does not import `home.css`**, so none of the bare-element traps
  apply. No motion either: it's a tool, so the motion checklist and the testimonial rule don't
  apply to it. Noindex, disallowed in `robots.ts`, not in the sitemap. The Meta Pixel in
  `app/layout.tsx` skips `/admin`.
- **Env (see `.env.example`):** `DATABASE_URL` (transaction pooler, 6543), `DIRECT_URL` (session
  pooler, 5432; migrations only), `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`. Google's
  OAuth client needs `https://kibadvisors.com/api/auth/callback/google` (and
  `http://localhost:3000/...` for dev) as redirect URIs. **Sign-in does not work on Vercel preview
  URLs** — Google needs exact redirect URIs; fixing that is a later decision.

### The blog editor (`/admin/blog`)

Editors and admins write, schedule and publish posts; admins also manage categories
(`/admin/blog/categories`). Decided by the human: **managed category list** (case-insensitive
unique; a category in use can be renamed but not deleted), **author picked from the team**
(`lib/blog/authors.ts` reads `team-data.ts`, Michael first), drafts + scheduling, **no approval
step**, images in the body.

- **Body format: Tiptap/ProseMirror JSON, allowlisted** — paragraph, intro ("lead"), h2, h3, bullet
  and numbered lists, bold, italic, links, images. `lib/blog/doc.ts` defines it and `sanitizeDoc()`
  rebuilds every saved body from the allowlist (links: http(s)/mailto/tel/site paths only; images:
  our Blob store or `/img/` only). `lib/blog/render.tsx` renders it with the exact classes the old
  `Block` union used; **nothing is ever rendered as raw HTML.** To add a format (say, quotes), it
  goes in all three places: the editor extensions, `doc.ts`, `render.tsx`.
- **Status model:** `draft` | `published`. A published post with a future `publish_at` is
  *scheduled* — there's no third status. All times are Central (`lib/blog/time.ts`).
- **How public pages update:** `lib/blog/queries.ts` caches under the `blog` tag with a 5-minute
  revalidate. Every save that touches a live post calls `revalidateBlog()`, so publishing is
  immediate; the 5-minute revalidate is what brings a **scheduled** post out on time (up to ~5 min
  late) — no cron. `/blog`, `/blog/[slug]` and `sitemap.xml` all read from it.
- **The build reads the database** (to prerender `/blog` and the posts). With no `DATABASE_URL`
  (Preview) the blog renders empty rather than failing. **Run `npm run db:migrate` BEFORE
  deploying anything that adds tables** — a production build against a database without them fails
  (Vercel then keeps the previous deploy, so the live site is safe, but the deploy doesn't ship).
- **"New post" creates the draft up front** (`createDraft`) and opens `/admin/blog/<id>`, so the
  editor's URL never changes while someone types (a client-side URL change made Next re-render the
  page and could drop text typed right after the first save). Untouched empty drafts older than an
  hour are cleared the next time that person clicks "New post".
- **Saves are optimistic-locked** on `updated_at`: if someone else saved since you opened the post,
  your save is refused with their name and time. Edits made *while* a save is in flight are kept
  and stay "unsaved". Every save writes a full snapshot to `blog_post_revisions` (Version history →
  Restore loads it into the form; nothing changes until saved).
- **Preview** is live and needs no save: the editor writes its state to localStorage
  (`kiba-blog-preview`) and `/admin/preview` renders it with the real `PostPage`.
- **Publishing requires** a title, category, summary, body text, and alt text for every image (the
  editor outlines images missing it in red). Drafts can be saved incomplete.
- **Images:** the browser shrinks each to ≤2000px wide and WebP (`components/admin/blog/upload.ts`),
  then `/api/admin/blog/image` stores it in the **public** Blob store `kiba-blog-images`
  (`BLOG_BLOB_READ_WRITE_TOKEN` — a different store and token from the debt schedule's private
  one). Removing an image from a post does not delete the file.
- **Toolbar buttons don't take focus** (`onMouseDown` preventDefault in `RichTextEditor`). Without it
  keystrokes typed right after a click landed on the button — a space even re-pressed it and undid
  a list. Re-test by typing immediately after clicking if you touch the toolbar.
- `DATABASE_POOL_MAX` exists only for local testing against a single-connection stand-in database.


---

## `deliverables/` — pages that live on OTHER sites

Not part of the Next.js build and not deployed from here. Each file is a hand-off for a partner to
install on their own site.

- **`deliverables/rivenway/kiba-x-rivenway.html`** — the RivenWay × KIBA co-branded page for
  **rivenway.com** (WordPress + Elementor Pro). One self-contained file: RivenWay's nav and footer
  modeled from their live site, their brand guidelines (Montserrat / Source Sans 3, navy `#001548` /
  `#19305A`, blue `#295BAA`, sky `#52B5E6`), KIBA's white/blue-arrow logo inlined as base64. Install
  notes are in the file's header comment (Elementor Canvas template + one HTML widget).
- **A review copy is live at `/preview/rivenway-kiba.html`** (`public/preview/`, noindex, not in
  the sitemap), so people can see it without a Vercel login. It's a copy: re-copy it from the
  deliverable after edits (keeping its `noindex` meta), and delete it when review is over. Its GHL
  form is live, so submissions from it are real leads.
- **It is not `/partners/rivenway`.** That route stays, KIBA-branded, on this site. Both embed the
  same GHL form (`REFERRAL - Rivenway`), so the lead routing is identical.
- **All CSS is scoped under `.kxr` with `kxr-` class names**, so it can't fight Elementor's kit
  styles. Keep it that way; a bare element selector will leak into the rest of their site.
- **KIBA copy in it is verbatim** from `lib/what-to-expect.ts`, `lib/faq.ts`, `lib/testimonials.ts`
  and the program `summary` lines. It's a copy, so it **drifts**: if one of those changes, update the
  file too. No star ratings on the testimonials (none were given). **Three deliberate edits by the
  human, on this page only** — don't "restore" them: the form intro says KIBA will "reach out within a
  couple minutes" (not 24–72 hours), the hero box says "from start to finish", and the KIBA partner
  card says "from the first call to the closing table". The "What to expect" card keeps the
  original "from first call to close".
- **The programs grid has EIGHT cards, not six**: the six `PROGRAMS` plus **Project Financing** and
  **Debt Restructuring** (added by the human). Those two have no page on kibadvisors.com, so they
  link to the homepage, and their descriptions were written for this page rather than copied. The
  grid is four columns on desktop so eight fill two even rows. If either program gets its own
  page, point the card at it. To match, the FAQ answer "What types of financing can I access?"
  lists all eight **on this page only** — `lib/faq.ts` still lists the original six.
- KIBA images and links use `https://kibadvisors.com/...` (switched from go.* after the launch, so
  nothing takes the redirect hop); RivenWay's images load from their own `wp-content`. If RivenWay changes its menu, the desktop
  menu and the mobile sheet are two separate lists.

## Legal pages

`components/LegalPage/LegalPage.tsx` renders a `LegalDoc`; the text lives in one verbatim data file
per document. Currently: `/privacy-policy` (`app/privacy-policy/privacy-content.ts`) and
`/terms-and-conditions` (`app/terms-and-conditions/terms-content.ts`).

- **THE TEXT IS SUPPLIED BY THE BUSINESS AND IS VERBATIM.** No tightening, no house style, no
  punctuation "fixes". If it changes, the business supplies new text and the file is replaced
  wholesale with `updated` bumped. Only the structure — headings, paragraphs, lists, the definition
  list — was added to render it. Verified by diffing the rendered page against the source: 97
  lines, zero differences.
- **These are the only copies.** The WordPress versions went away with the main-domain launch, so
  there is nothing to keep in sync.
- **Terms & Conditions follows the same rules** (supplied by the business, verbatim). Verified the
  same way: the rendered page diffed against the supplied text, 116 lines after the title, zero
  differences. Its path matches the WordPress URL, so existing links survive the domain move.
- Legal pages skip the testimonial section (see "Testimonials") and use a compact hero, because the
  revision date is what a reader is actually looking for. Section headings get stable slug ids and
  a contents list, so support can link straight to a clause.

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
│   ├── page.tsx                  ← "/" route: metadata, renders HomePage
│   ├── HomePage.tsx              ← the homepage itself (client component)
│   ├── home.css                  ← v2.html's <style> block, minus the glow + one divergence
│   ├── meet-our-team/            ← "/meet-our-team": page.tsx + MeetOurTeamPage.tsx + team-data.ts
│   ├── about-us/                 ← "/about-us": page.tsx + AboutUsPage.tsx + about-content.ts
│   ├── blog/                     ← "/blog" index + "/blog/<slug>" (posts come from the database)
│   ├── admin/                    ← staff dashboard: login, users, audit log, blog editor
│   ├── contact-us/               ← "/contact-us"
│   ├── advisors/                 ← "/advisors/<slug>" (advisors-data.ts, 3 pages)
│   ├── partners/                 ← "/partners/<slug>" (partners-data.ts, 2 pages)
│   ├── privacy-policy/           ← "/privacy-policy" (verbatim legal text in privacy-content.ts)
│   ├── debt-schedule/            ← "/debt-schedule" intake form (components/debt-schedule, lib/debt-schedule)
│   ├── funding-application/      ← "/funding-application" → SignWell (components/ + lib/funding-application)
│   ├── book-rr/ · thank-you/ · ty-cal/          ← booking + the two GHL redirect targets
│   ├── referral-partners/ · business-acquisitions/  ← recruitment + campaign landing
│   └── capital-solutions/        ← hub + the six program pages
│       ├── solutions-data.ts     ←   ALL the copy; nav + footer read PROGRAMS from here
│       ├── ProgramPage.tsx       ←   one shared layout for all six programs
│       ├── CapitalSolutionsPage.tsx / page.tsx   ← "/capital-solutions" hub
│       └── [slug]/page.tsx       ←   "/capital-solutions/<program>" (SSG, 6 static pages)
├── components/
│   ├── SplitText/                ← hero headline
│   ├── HeroReveal/               ← hero image panel
│   ├── SiteNav/ · SiteFooter/    ← shared nav + footer (use these on new routes)
│   ├── LegalPage/                ← shared layout for Privacy / Terms
│   ├── Reveal/ · Counter/        ← scroll reveal, animated stat counters
│   ├── TestimonialCarousel/ · TrustMarquee/
│   ├── HeroBlobs/ · GradientBlob/ ← hero cursor parallax, WebGL CTA gradient
│   └── ui/                       ← shadcn primitives: button.tsx, badge.tsx, card.tsx
│       ├── team-section-block-shadcnui.tsx  ← props-driven team grid (/meet-our-team)
│       ├── testimonial-v2.tsx               ← THE testimonial treatment, whole site
│       ├── bento-grid.tsx                   ← program cross-links (/capital-solutions/*)
│       ├── services-card.tsx                ← Embla carousel, "may make sense if…" cards
│       ├── stats-2.tsx                      ← three-box grid + CTA, "how we decide"
│       └── faq-accordion.tsx                ← FAQ disclosure list (homepage + /contact-us)
├── tools/
│   └── hero-mashups.py           ← rebuilds the composite hero images (not part of the build)
├── lib/
│   ├── utils.ts                  ← cn() helper
│   ├── testimonials.ts           ← the six real client testimonials (single source)
│   ├── faq.ts                    ← the five homepage FAQ answers (verbatim from WordPress)
│   ├── what-to-expect.ts         ← the six "what to expect" cards + the trust stat row
│   ├── ghl.ts                    ← GoHighLevel embed IDs + the resize-script loader
│   └── useMotionPreference.ts    ← ?motion=1 override for previewing animations
└── public/
    ├── img/ · partners/img/ · advisors/img/ · favicons   ← original public paths, unchanged
    └── legacy/                   ← ONE file left; the migration is otherwise complete
        └── v2.html               → /v2   (noindex homepage-redesign reference; see above)
```

---

## Adding a partner or an advisor

Both are data entries now, not copied files. The `_template.html` files are deleted.

**A new advisor** — add an entry to `ADVISORS` in `app/advisors/advisors-data.ts`:
`slug`, `name`, `title`, `tagline`, `bio`, `photo`, and **that advisor's own `schedulerUrl`**. Drop
a square, face-centered headshot in `public/advisors/img/`. The route, metadata and static page all
follow. Consider whether they also belong in `app/meet-our-team/team-data.ts`.

**A new referral partner** — add an entry to `PARTNERS` in `app/partners/partners-data.ts`:
`slug`, `name`, `shortName`, `logo`, `ogImage`, **that partner's own `ghlFormId`** and
`ghlFormName`. Then set that GHL form's **On Submit → Redirect** to
`https://kibadvisors.com/thank-you`. Older forms still say `go.kibadvisors.com/thank-you`, which
works through the 301.

> **`logo` and `ogImage` are different images.** `public/partners/img/<slug>.png` is the 1200x630
> share card; the co-brand badge logo is `<slug>-logo.png`. Using the share card as the badge
> renders a squashed banner — that regression happened once during the migration.

---

## GoHighLevel: which embed goes where

Every calendar and form ID is a *different* destination in GHL. They are not interchangeable, and
swapping one silently routes leads to the wrong person. `lib/ghl.ts` holds the shared ones.

| Page | Embed |
| --- | --- |
| `/book-rr`, `/thank-you` | `ROUND_ROBIN_CALENDAR` (shared advisor calendar) |
| `/advisors/<slug>` | that advisor's `schedulerUrl` — three different calendars |
| `/partners/<slug>` | that partner's `ghlFormId` — two different forms |
| `/contact-us` | `ROUND_ROBIN_CALENDAR` — a generic contact page should reach whoever is free |
| `/`, `/referral-partners`, `/business-acquisitions` | Michael's personal calendar |

**Two URLs are configured inside GoHighLevel, not here:** `/thank-you` (every form's On Submit
redirect) and `/ty-cal` (the calendar's post-booking redirect). Nothing in this repo links to
either, so renaming those paths would break the funnel silently.

Embeds need `form_embed.js` — use `loadGhlEmbedScript()` from `lib/ghl.ts`. They do **not** render
on `file://` or in sandboxes; verify on a deploy.

---

## Shared elements — one copy each, finally

These used to be duplicated across eleven HTML files and drifted. They are now single components:

| Element | Where it lives |
| --- | --- |
| Nav | `components/SiteNav` |
| Footer (incl. LinkedIn / Instagram / Facebook) | `components/SiteFooter` |
| Testimonials | `components/ui/testimonial-v2.tsx` + `lib/testimonials.ts` |
| FAQ | `components/ui/faq-accordion.tsx` + `lib/faq.ts` |
| "What to expect" cards, trust stats | `lib/what-to-expect.ts` |
| Design tokens | `app/globals.css` (`@theme`) + `app/home.css` |

**Nav right-hand cluster:** phone → **Client Portal** (ghost button,
`https://portal.kibadvisors.com/client`, new tab — a separate app for existing clients) → **Start
the Conversation** (primary CTA). Fitting all of this on one row took three concessions, all
driven by that CTA being 208px wide:

- **The desktop bar starts at 1000px, not 960.** Below it the hamburger and mobile sheet take
  over. At 960–999 there was no combination of paddings that fitted the full menu, the portal
  button and a 208px pill without cramming. The sheet carries every link plus the portal, so
  nothing is unreachable there.
- **The phone number is hidden from 1000 to 1279px.** It's still in every CTA band and the footer.
- **1000–1099px tightens the menu** — link padding 14px → 9px, `.nav-right` gap 24px → 14px (in
  `home.css`, "THE TIGHT BAND"). Nothing is dropped, only tightened.
- **`white-space:nowrap` on the nav links, the portal button and the CTA.** The bar going to 100px
  was usually a *label* wrapping inside its pill, not the row wrapping — worth knowing, because
  the two look identical in a screenshot and have different fixes.

If you change the CTA's label or add anything to this cluster, re-measure `.nav-inner`'s height
across 960/1000/1024/1060/1100/1180/1280/1440. It must stay 78px.

**KIBA contact:** phone `251-210-8445`, email `info@kibadvisors.com`.

**Meta Pixel** (ID `1653996785650157`) is in `app/layout.tsx`, once, so it covers every page. It is
a **plain inline `<script>`, deliberately not `next/script`** — with `strategy` the tag never
reached the DOM and only the `<noscript>` fallback fired, which is exactly backwards. A single
`PageView` is correct because every internal link here is a real `<a href>`, so each navigation is
a full document load; **if anything moves to client-side routing, this needs a route-change
listener** or those views stop counting. Verified: `window.fbq` is a function and exactly one
`facebook.com/tr` request fires per page.

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

**Two framer-motion traps, both found by measuring rather than looking:**

1. **Never pair `initial={false}` with `whileInView`.** `initial={animate ? {...} : false}` looks
   like "no entrance animation when motion is off", but it actually leaves the element at opacity 0
   until it scrolls into view — i.e. content hidden from the very visitors who asked for less
   motion. Give the non-animating branch an explicit visible state and a zero duration:
   `initial={animate ? {opacity:0,y:20} : {opacity:1,y:0}}` plus
   `transition={animate ? {...} : {duration:0}}`. This shipped in three components before it was
   caught.

2. **`forceMotion` resolves AFTER first render**, because `useMotionPreference` sets it in an
   effect. framer's `initial` is only read at mount, so on a machine reporting reduce, `?motion=1`
   cannot demonstrate an `initial`-based entrance animation — the first render already committed to
   the non-animating branch. This does not affect real visitors (a normal machine has
   `prefersReduced === false` on the first render, so the flag never flips). It does mean **the
   `?motion=1` recipe above can't verify this kind of animation** — check those on a browser with
   no reduce emulation instead.

---

## Button labels: one CTA wording, site-wide

**Every button whose job is to start a conversation reads "Start the Conversation"** — 31 of them,
including the nav's primary CTA. This replaced a spread of per-page wordings ("Book a
Consultation" ×15, "Get Funded", "Let's Talk", "Schedule Strategic Assessment", "Get Started
Today", "Book a Partner Call", …).

**What deliberately did NOT change, and why — don't "finish the job" by renaming these:**

- **The 16 `tel:` buttons** keep "Call Our Team" / "Call 251-210-8445". Most pages pair the primary
  CTA with one of these side by side; renaming both gives two identical buttons where one dials
  and one opens a calendar.
- **The 10 navigational buttons** keep their destination names: "Meet the Team" ×4, "Back to the
  Blog", "Read the Blog", "See All Solutions", "See Capital Solutions", "Explore Capital
  Solutions", "How Acquisition Loans Work". A button that says "Start the Conversation" and goes
  to `/blog` is just wrong.
- **Two secondary buttons that sit beside a primary CTA and point elsewhere**: "Contact Us" on
  `/blog` (→ `/contact-us`) and "Refer a Client" on `/meet-our-team` (→ `/referral-partners`).
- **The two Client Portal buttons**, excluded by request.
- **`/ty-cal`'s two buttons** ("Explore Capital Solutions", "Read the Blog") — that page is
  reached *after* booking, so a "start" CTA would be nonsense there.

Two of the 31 live in data rather than markup: `ctaLabel` in `ProgramPage.tsx` and the team
block's `cta.label` in `MeetOurTeamPage.tsx`. A grep for the old strings won't find them.

Verified in the built HTML: no `.cta-row` or `.cta-band-actions` anywhere contains two buttons
with the same label.

---

## One hero height, site-wide

**Every hero on the site is the same height as the homepage's**, by request — desktop heroes used
to range from 315px (`/privacy-policy`) to 880px (`/`) and moving between pages felt like the
header was jumping around. The rule lives in `app/home.css` under "ONE HERO HEIGHT FOR THE WHOLE
SITE"; the comment there carries the detail. In short:

- **880px at ≥1150px, 986px between 921 and 1149px.** Two numbers because the homepage's own h1
  takes a third line below ~1150px and genuinely cannot fit in 880px — forcing it would overlap its
  own content. **Both are measured from the homepage, not chosen.** If its h1 or hero copy changes,
  re-measure `.hero-inner`'s height on `/` at 1120px and 1440px and update both pairs.
- **The min-height is on `.hero-inner`, not just `.hero`.** The image panel stretches to the grid
  row, so the row has to grow; a min-height on `.hero` alone leaves the panel short with a navy gap
  above and below it. `.hero` gets one too (plus `display:grid; align-content:center`) for the
  heroes that have no `.hero-inner`: blog posts, legal pages, `/thank-you`, `/ty-cal`.
- **Nothing applies below 921px.** There `.hero-inner` is a single column and the panel switches to
  a 16/10 aspect; a min-height would just add a gap. Phones are unchanged.
- **`min-height`, not `height`.** `/book-rr`, `/referral-partners`, `/business-acquisitions` and
  `/partners/*` carry a booking embed in the hero and run to ~1063px. They stay taller rather than
  squashing a live calendar — **these four are the only remaining exceptions**, and closing that
  gap means shrinking a GoHighLevel iframe on the conversion path, which is the human's call.
- **Two exemptions: `/debt-schedule` and `/funding-application` use `hero-compact`** (both decided
  by the human). The form is the page, and an 880px navy band would push it below the fold. `.hero.hero-compact{ min-height:0 }`
  sits in `home.css` right after the rule; two classes, so it outranks `.hero` in both media
  queries. Those two are the only users — don't add `hero-compact` to other pages without asking.
- **Known cost, flagged not hidden:** on `/privacy-policy` and the three `/blog/*` posts the hero
  is now most of a laptop viewport, so the body text starts below the fold. That is the price of
  uniformity and it was the explicit request. To exempt them, give those two layouts a
  `hero-compact` class and reset `min-height` on it.

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
  navy/blue palette — it fought every cool-tinted card placed on it. It is now `#f2f4f7`, a light
  neutral cool grey. The variable name and the `.solution-card.is-cream` class keep their old names on
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

- Push to `main` → Vercel auto-deploys to kibadvisors.com. Clean URLs and all path
  redirects/rewrites live in `next.config.js` (`vercel.json` holds only the cleanup cron).
- Typical loop: edit → `npm run build` (must pass) → review diff → `git add -A && git commit && git push`.
- After deploying, verify on the live URL (logo, form/calendar, and that the correct version
  shipped — a quick tell is the testimonial text). For the homepage, also spot-check `/` against
  `/v2`, allowing for the listed intentional divergences.

---

## Main domain: this site replaced WordPress on kibadvisors.com

Until the launch this repo served only `go.kibadvisors.com`, and the WordPress site on
`kibadvisors.com` was off-limits. **The human reversed that** and this site now IS
`kibadvisors.com`. What that involved, so none of it gets undone by accident:

- **`lib/site.ts` holds the one origin** (`SITE_URL`). `metadataBase` in `app/layout.tsx`
  resolves every canonical, `og:url` and `og:image` against it, so page metadata uses paths only.
  Don't hard-code a domain in a `page.tsx` again.
- **go.kibadvisors.com 301s to the same path and query on kibadvisors.com** (the first rule in
  `next.config.js`'s `redirects()`). Keep it: ads, partner links and GoHighLevel's `/thank-you` and
  `/ty-cal` redirects still point at `go.*`, and so do the debt-schedule staff links already saved
  on GHL contacts (their HMAC doesn't cover the host, so they survive the hop).
- **Every WordPress URL resolves.** They're either the same path here or redirected in
  `next.config.js`: root-level blog posts → `/blog/<slug>`, `/category/*` → `/blog`, the four
  scheduling/referral-partner pages → `/book-rr` (the human's decision), Rank Math's sitemap
  files → `/sitemap.xml`.
- **Indexing is per page.** Indexed and listed in `app/sitemap.ts`: `/`, `/about-us`,
  `/meet-our-team`, `/capital-solutions` + the six programs, `/blog` + posts, `/contact-us`,
  `/referral-partners`, both legal pages. **Still `noindex`**, and absent from the sitemap: `/thank-you`,
  `/ty-cal`, `/book-rr`, `/business-acquisitions`, `/debt-schedule`, `/funding-application`, `/partners/*`, `/advisors/*`
  and `/v2`. Those are booking-flow, campaign or partner-specific pages. Add a new page to
  both places or neither.
- **DNS is Cloudflare; email is Google Workspace MX on the same zone.** Only the apex and `www`
  records point at Vercel: both are CNAMEs (Cloudflare flattens the apex one), DNS-only, not
  proxied. **In Vercel, `kibadvisors.com` serves Production and `www` 308s to it.** Vercel
  defaulted to the reverse (apex → www) at launch and it had to be flipped. The canonicals and
  the go.* redirect both assume the apex, which is also what WordPress used. Rollback values: both
  records were `A 88.223.85.3` (Hostinger), proxied. Mailgun (`info.`/`mail.`), Postmark
  (`pm-bounces`) and `portal.` (LaunchBay) are on the same zone too. `portal.kibadvisors.com` is a separate record
  and a separate app. Never touch the MX, SPF or verification TXT records.
- **Content copied from WordPress is now the only copy.** Files that say "verbatim from
  kibadvisors.com/…" (`team-data.ts`, `lib/faq.ts`, `solutions-data.ts`; the blog posts now live
  in the database) describe where
  the text came from. They are the source now; changes come from the business as new text.

---

## Open decisions (ask the human — don't assume)

- _None blocking._ One standing decision, the human's to revisit and not to be changed by an agent
  on its own: when `/v2` + its rewrite get retired (currently kept as the visual reference).
