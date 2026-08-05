# CLAUDE.md — Project guide for AI agents

This repo holds KIBA's referral-partner and advisor booking landing pages.
Deployed on **Vercel** (auto-deploys on every push to `main`) at **https://go.kibadvisors.com**.
"KIBA" = Kingdom Impact Business Advisors, a funding/advisory company. Main site: https://kibadvisors.com.

---

## Golden rules (read first)

- **Filename = URL.** `partners/rivenway.html` serves at `/partners/rivenway`. Clean URLs are
  on via `vercel.json`, so there is no `.html` in the live path. Use lowercase, hyphens,
  no spaces, no underscores.
- **Put files in the right folder.** Referral partners go in `partners/`, advisors in
  `advisors/`. A file left at the repo root will NOT get the intended `/partners/...` or
  `/advisors/...` URL — this has caused a "404 / wrong page" bug before.
- **Every page is ONE self-contained HTML file.** There is no shared CSS or JS file — the
  full `<style>` block and scripts are copied into each page. A global visual change must be
  applied to **every page AND both templates**, or they drift apart.
- **Don't hand-edit the wired-up markup.** Per-page content lives in a **config block near the
  top of each file**. A small script injects it into the page at load. Edit the config values,
  not the generated markup.
- **Show diffs and let the human approve.** Prefer minimal, targeted edits. Validate HTML
  (balanced tags) and any embedded JS before finishing.

---

## Repo structure

```
/
├── README.md
├── CLAUDE.md                     ← this file
├── vercel.json                  ← clean URLs, redirects
├── thank-you.html               → /thank-you  (shared confirmation + booking calendar)
├── partners/
│   ├── _template.html           ← copy this to add a referral partner
│   ├── rivenway.html            → /partners/rivenway
│   └── integ-funding.html       → /partners/integ-funding
└── advisors/
    ├── _template.html           ← copy this to add an advisor booking page
    ├── michael-sylkatis.html    → /advisors/michael-sylkatis
    ├── barbara-sylkatis.html    → /advisors/barbara-sylkatis
    └── ariel-austria.html       → /advisors/ariel-austria
```

---

## The config-driven template pattern

Each page has a clearly-commented config object near the top of `<body>`, and a script lower
down that wires it into the DOM. To create or edit a page, change the config — nothing else.

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

---

## Adding a new partner or advisor

1. Copy the matching `_template.html` to `<name>.html` in the correct folder
   (e.g. `partners/acme.html` → `/partners/acme`).
2. Edit **only** the config block: name, logo/photo, GHL form or calendar ID, etc.
3. Images: embed as **base64 data URIs** to keep the page self-contained (no broken links).
   Resize/optimize first. Advisor photos must be **cropped square and face-centered**, since
   the avatar is a small circle (a full portrait would crop to the chest).
4. Commit + push → Vercel deploys automatically.
5. For partner pages, set the GHL form's **On Submit → Redirect** to
   `https://go.kibadvisors.com/thank-you`.

---

## Shared elements on every page (keep in sync across ALL pages + BOTH templates)

- **Header:** KIBA logo + the text "Kingdom Impact Business Advisors". Both the header and
  footer logos link to https://kibadvisors.com. The business name hides under ~600px width.
- **Meta Pixel** (Facebook), ID `1653996785650157`, in the `<head>`, firing PageView.
- **Footer social icons:** LinkedIn (`/company/kingdomimpactbusinessadvisors/`) and
  Facebook (`/kibadvisors`).
- **Testimonials block** (partner + advisor pages) — three client quotes.
- **KIBA contact:** phone `251-210-8445`, email `info@kibadvisors.com`.

If you change any shared element, apply the same change to every page and both templates.

---

## Design system (already defined in each page's `<style>`)

- **Fonts:** Instrument Sans (headings / UI), Instrument Serif (body / display),
  IBM Plex Mono (small eyebrow labels).
- **Colors (CSS vars):** `--navy-deep #020062`, `--navy-soft #0025ae`, `--blue #2563eb`,
  `--blue-soft #6d94f5`, plus ivory/paper/ink/slate neutrals.
- **Look:** dark navy hero, white "card" for the form/scheduler with a blue top accent,
  rounded corners, soft shadows. Keep new work consistent with this.
- Reuse the existing components (hero, stat row, benefits grid, testimonials, CTA band,
  footer) rather than inventing new patterns.

---

## GoHighLevel embeds

- Forms and calendars are GHL iframes; the resize script
  `https://link.msgsndr.com/js/form_embed.js` must be present for them to size correctly.
- These embeds load from an external domain, so they **do not render on `file://` or in
  sandboxes** — only test them on the deployed URL.

---

## Deploy / workflow

- Static site, **no build step**. Push to `main` → Vercel auto-deploys to go.kibadvisors.com.
- `vercel.json` controls clean URLs, the root redirect to kibadvisors.com, and any path
  redirects (e.g. a rebranded partner: old path → new path with `"permanent": true`).
- Typical loop: edit config/page → review diff → `git add -A && git commit -m "…" && git push`.
- After deploying, verify on the live URL (logo, form/calendar, and that the correct version
  shipped — a quick tell is the testimonial text).
