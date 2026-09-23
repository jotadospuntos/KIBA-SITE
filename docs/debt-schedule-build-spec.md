# Online Business Debt Schedule — Build Spec

A working brief for Claude Code. Build it in three phases; phase 1 is the one you sign off on before the rest gets built.

---

## 0. What the template actually is (read this first)

`Business_Debt_Schedule_Template.pdf` is not a flat document. It is a single landscape page (1132.6 × 687.6 pt, no rotation) containing a **119-field AcroForm**. That means we fill the real file rather than redrawing a lookalike, and the output is byte-for-byte the document you already send to lenders.

**Field map**

Header (3 fields):

| Field name | Meaning |
|---|---|
| `Text4.0` | Name |
| `Text4.1` | Business Name |
| `Text4.2` | Date |

Per debt row, **rows 1–10**. Text fields are **1-indexed**, dropdowns are **0-indexed**. This is the single most likely thing to get wrong, so it's worth a helper function:

| Column | Field name pattern | Type |
|---|---|---|
| Lender's Name | `Lenders NameRow{N}` | text |
| Type of Debt | `Dropdown1.{N-1}` | choice |
| Original Amount | `Original AmountRow{N}` | text |
| Current Balance | `Current BalanceRow{N}` | text |
| Interest Rate | `Interest RateRow{N}` | text |
| Monthly Payment | `Monthly PaymentRow{N}` | text |
| Open Date | `Open DateRow{N}` | text |
| Maturity Date | `Maturity DateRow{N}` | text |
| Secured or Unsecured | `Dropdown2.{N-1}` | choice |
| Current or Delinquent | `Dropdown3.{N-1}` | choice |
| Type of Collateral | `Type of CollateralRow{N}` | text |

Note "Lenders" has no apostrophe in the field name even though the printed header does.

Totals (2 fields): `Total Balances`, `Total Payments`.

**Dropdown options are fixed by the PDF.** pdf-lib throws if you set a value outside the option list, so the web form's `<select>` options must be generated from exactly these strings:

- `Dropdown1` (Type of Debt): `SBA 7(a)`, `Equipment Loan`, `Non-SBA Commercial Loan`, `Credit Card`, `Line of Credit`, `Commercial Mortgage`, `EIDL`, `PPP`, `Other`
- `Dropdown2`: `Secured`, `Unsecured`
- `Dropdown3`: `Current`, `Delinquent`

(Each list also contains `Select one` as its placeholder — that's the empty state, never a submitted value.)

**The 10-row cap is a real constraint.** The form has exactly ten rows. See §4 for how to handle a client with twelve debts.

---

## 1. Architecture — confirmed against the KIBA repo

This is now grounded in the actual repo (`KIBA-SITE-main`): **Next.js 14 App Router, TypeScript, Tailwind v4 (CSS-first, no `tailwind.config.ts` — tokens live in `app/globals.css`'s `@theme` block), shadcn `base-nova` on `@base-ui/react`, framer-motion + gsap, lucide icons, deployed on Vercel (auto-deploy on push to `main`).** The server-side plan runs as written; Vercel gives us the Node runtime pdf-lib and email need.

**Read `CLAUDE.md` first.** It is the law of this repo and it is unusually detailed. Everything below is compatible with it; where they ever seem to differ, `CLAUDE.md` wins.

```
app/
  debt-schedule/
    page.tsx                 # server component: metadata + noindex (match the subdomain)
    DebtSchedulePage.tsx     # client component: the form (see components below)
    thank-you/page.tsx       # post-submit confirmation (or reuse the existing /thank-you pattern)
  api/debt-schedule/
    route.ts                 # POST: validate -> generate PDF -> deliver (Node runtime, not edge)
components/debt-schedule/
  DebtScheduleForm.tsx       # orchestrator: header fields, list, totals, submit
  DebtList.tsx               # the card list + empty state
  DebtCard.tsx               # one debt, collapsed summary view
  DebtEntryForm.tsx          # one debt, editing view (the real form) — the sheet/modal
  ReviewStep.tsx             # read-only summary before submit
  TotalsBar.tsx              # sticky running totals
lib/debt-schedule/
  schema.ts                  # zod schema — shared by client and server
  constants.ts               # dropdown options, exported from the PDF field list
  fill-pdf.ts                # pdf-lib template filling (server-only)
  format.ts                  # currency / percent / date helpers
public/templates/
  business-debt-schedule.pdf # the original template, committed as-is
```

**New dependencies** (none are in `package.json` yet): `zod`, `pdf-lib`, and an email sender — `resend` is the least-friction on Vercel. `react-hook-form` + `@hookform/resolvers` are optional; the prototype manages form state by hand and that's fine to port as-is. Follow `CLAUDE.md`'s "install only what genuinely adds capability" rule — don't pull in a UI kit.

**Route runtime:** the API route must run on the Node runtime (`export const runtime = 'nodejs'`), not edge — pdf-lib and the email SDK need it.

The single most important rule: **`schema.ts` is the one source of truth.** Client validation, server validation, and the PDF filler all import from it. No duplicated field lists. Extract it from the prototype's `DEBT_TYPES`/`SECURED`/`STATUS` arrays and validation functions.

---

## 2. Data model

```ts
// lib/debt-schedule/schema.ts
const debtEntry = z.object({
  lenderName:        z.string().min(1).max(60),
  typeOfDebt:        z.enum(DEBT_TYPES),          // from constants.ts
  otherDebtType:     z.string().max(40).optional(), // required iff typeOfDebt === 'Other'
  originalAmount:    z.number().nonnegative(),
  currentBalance:    z.number().nonnegative(),
  interestRate:      z.number().min(0).max(100),
  monthlyPayment:    z.number().nonnegative(),
  openDate:          z.string(),                  // ISO yyyy-mm-dd
  maturityDate:      z.string().optional(),       // revolving lines may have none
  securedStatus:     z.enum(['Secured', 'Unsecured']),
  paymentStatus:     z.enum(['Current', 'Delinquent']),
  collateral:        z.string().max(60).optional(), // required iff securedStatus === 'Secured'
});

const debtSchedule = z.object({
  contactName:  z.string().min(1),
  businessName: z.string().min(1),
  asOfDate:     z.string(),        // defaults to today, client-editable
  hasNoDebt:    z.boolean(),
  debts:        z.array(debtEntry),
});
```

**Cross-field rules** (`.superRefine`):

- `debts` must be non-empty unless `hasNoDebt` is true.
- `collateral` required when `securedStatus === 'Secured'`.
- `otherDebtType` required when `typeOfDebt === 'Other'`.
- `maturityDate` must be after `openDate`.
- `openDate` cannot be in the future.
- `currentBalance > originalAmount` → **warning, not an error**. It's legitimate for a line of credit or a card. Show an inline "double-check this" note and let them proceed.
- A credit card with `monthlyPayment === 0` → warning. The template instructions specifically ask for the typical monthly payment on cards, so nudge them.

Store amounts as numbers in state and format on display. Never keep `"$1,234.00"` in the model.

---

## 2.5 Brand — use the repo's tokens, not raw hex

The prototype (`debt-schedule-prototype.html`) is the reference for **layout, flow, copy, and behavior**. It is **not** the reference for exact colors and fonts, because it was built standalone from the printed brand guide, and the live site has its own, slightly different, implemented palette. To "go well with go.kibadvisors.com," the in-repo page must use the site's own `@theme` tokens from `app/globals.css`. Claude Code should treat this exactly like `CLAUDE.md`'s rule for adapting third-party blocks: *map the prototype's colors onto KIBA's `@theme` tokens.*

**The one thing to know up front:** the brand guide prints the blue as `#294DFF` and navy as `#05014A`, and the prototype uses those. **The live site does not** — it uses `--color-blue #2563eb` and `--color-navy-deep #020062`. The site wins here, because the goal is to match the site. So the shipped page will read very slightly softer/less-electric than the standalone preview. That's correct, not a regression. (If the business wants the whole site moved to the exact brand-guide hexes, that's a separate, site-wide decision for the human — don't make it inside this feature.)

**Token mapping** (prototype role → repo token / Tailwind utility):

| Role in prototype | Use in repo |
|---|---|
| Primary button / accent (`#294DFF`) | `bg-primary` / `bg-blue` / `text-blue` (`#2563eb`) |
| Headings, secondary button, navy (`#05014A`) | `text-navy-deep` / `bg-navy-deep` (`#020062`) |
| Body text | `text-ink` (`#0d0b2e`) / `text-foreground` |
| Muted / labels | `text-slate` (`#5b5f7a`) / `text-muted-foreground` |
| Page background | `bg-background` (`#f7f7fb` — the site's near-white; this is what "white" means here) |
| Card surface | `bg-card` (`#ffffff`) |
| Borders / dividers | `ring-border` / `border-border` (`#e3e3ee`) — prefer `ring-1 ring-border` (see the CSS trap in §6.5) |
| Focus ring | `ring-ring` (`#6d94f5`) |
| Error state | `text-destructive` / `border-destructive` (`#dc2626`) |
| Radius | `rounded-[--radius-md]` (16px) for cards, `--radius-sm` (12px) for inputs |
| Card elevation | `shadow-soft` |

Functional status colors (current-green, delinquent-red, warning-amber) aren't in the token set. Keep them muted and add them as local constants, or lean on `text-destructive` for delinquent and a `text-blue` tint for neutral/secured.

**Fonts — use the site's, not the prototype's.** The site does **not** use Bebas Neue or a geometric substitute. Its `@theme` fonts are: `--font-heading` General Sans (with Instrument Sans fallback), `--font-body` IBM Plex Sans, `--font-mono` IBM Plex Mono (the site's small eyebrow-label treatment), `--font-serif` Instrument Serif. So: headings → `font-heading`, body/inputs → `font-body`, the small "Before you start" / group-label eyebrows → `font-mono` uppercase (matching how eyebrows read elsewhere on the site). Drop the prototype's Bebas Neue and geometric-sans `<link>`s entirely — the fonts are already loaded site-wide via `app/layout.tsx`.

**Logo — the asset already exists.** Use `public/img/kiba-logo.png` (served at `/img/kiba-logo.png`) via `next/image`, and delete the prototype's recreated wordmark. Better still, reuse whatever `components/SiteNav` already renders for the logo so it's identical to every other page. The brand guide forbids rebuilding or recoloring the mark, so use the real file.

**Theme.** The site ships light (it's a landing/booking host). A `.dark` palette exists in `globals.css` but isn't the default; the debt page can stay light like the rest of the subdomain. Don't port the prototype's `data-theme` switch.

---



The template is a spreadsheet, but a spreadsheet is the wrong interface here. Clients will open this link on a phone, from an email, at 9pm. Eleven columns across is unusable there. **Build it as a card list, not a grid.**

### Page structure

1. **Intro block.** Business name of your firm, one short paragraph on what this is and why you need it, and an honest time estimate ("about 5 minutes if you have your statements handy"). Include the four instruction lines from the template verbatim — they prevent the most common errors:
   - Only debts in the business's name.
   - No personal debts or debt taken out by an individual.
   - Include all active EIDL or PPP loans.
   - Include business credit cards; enter the amount typically paid per month.
2. **Your details.** Name, Business Name, Date (prefilled with today).
3. **Debts list.** Empty state with a single prominent "Add a debt" button, plus a quieter "My business has no debt" checkbox that collapses the list and enables submit.
4. **Sticky totals bar.** Total Open Balances and Total Monthly Payments, recalculated live. This is the part clients find satisfying and it doubles as a sanity check.
5. **Review step.** Read-only table of everything entered, with edit links, before the submit button.

### The per-debt form

Opens as a modal on desktop, a full-screen sheet on mobile. Fields grouped so it doesn't read as a wall of inputs:

- **Who and what** — Lender's Name, Type of Debt (+ conditional "Please specify" when Other)
- **The numbers** — Original Amount, Current Balance, Interest Rate, Monthly Payment
- **The dates** — Open Date, Maturity Date (with an "N/A — revolving" toggle)
- **Status** — Secured/Unsecured, Current/Delinquent, Type of Collateral (only rendered when Secured)

Details that matter:

- `inputMode="decimal"` on every money and rate field so mobile gets a numeric keypad.
- Format currency on blur, not on every keystroke. Mid-typing reformatting is maddening.
- Interest rate: suffix `%` inside the input, accept `7.25` or `7.25%`.
- Dates: native `<input type="date">`. Don't build a custom picker.
- Validate on blur and on submit, never on change.
- Save and "Save & add another" as separate actions — most clients have 3–5 debts.

### Collapsed card

Lender name bold, then type and current balance, then monthly payment. Edit and delete icons. Delete asks for confirmation.

### Persistence

Autosave the whole form to `localStorage` on every change, keyed by the client's link token. Restore on load with a dismissible "We restored your progress" banner. People abandon this form to go find a statement and come back twenty minutes later; losing their work is the main reason these things don't get returned. Clear the key on successful submit.

### Accessibility and polish

Real `<label>` elements, `aria-invalid` and `aria-describedby` wired to error text, focus moved to the first invalid field on failed submit, focus trapped in the modal and returned to the triggering card on close. Disable the submit button only while the request is in flight — never as a way of expressing validation state, since it leaves people stuck with no explanation.

---

## 4. PDF generation (phase 2)

Server-side only, in the API route. Never in the browser: the client could tamper with it, and you want the file you email and the file they download to be the same bytes.

```ts
// lib/debt-schedule/fill-pdf.ts
export async function fillDebtSchedule(data: DebtSchedule): Promise<Uint8Array>
```

**Algorithm**

1. Read `public/templates/business-debt-schedule.pdf` into a `PDFDocument`.
2. Chunk `data.debts` into groups of 10.
3. For each chunk, produce a filled copy of the template page (see below), then merge the copies into one output document.
4. Fill `Text4.0/1/2` on every page so each sheet is self-identifying.
5. Fill each row with the helper that handles the 1-index/0-index mismatch:
   ```ts
   const text = (col: string, row: number) => form.getTextField(`${col}Row${row}`);
   const drop = (group: 1|2|3, row: number) => form.getDropdown(`Dropdown${group}.${row - 1}`);
   ```
6. For `Type of Debt === 'Other'`, set the dropdown to `Other` and append the specified text to the Type of Collateral cell, or leave it in the row and note it — the PDF has no free-text slot for it. Confirm which you prefer.
7. `Total Balances` and `Total Payments` get the **grand totals across all pages**, written on the last page only, with the earlier pages' totals left blank so nobody misreads a subtotal as the total.
8. `form.flatten()` before saving. This bakes the values into the page, prevents downstream edits, and avoids viewer-dependent rendering.

**Formatting written into the PDF:** currency as `$1,234.56`, rate as `7.25%`, dates as `MM/DD/YYYY`. The cells are narrow — truncate long lender names with an ellipsis rather than letting pdf-lib overflow.

**Multi-page approach.** `PDFDocument.copyPages` on a template that still has form fields will collide on field names. The reliable pattern is: fill and flatten one chunk at a time into a separate single-page document, then copy those flattened pages into a fresh output document. Slightly more work, no field-name conflicts.

**Cap it.** Set a hard limit of 30 debts (3 pages) in the schema. Past that, something unusual is going on and you want to hear from them directly.

---

## 5. Submission and delivery — store in GoHighLevel (phase 3)

Decision made: submissions land in **GoHighLevel**, where your leads already live. Worth knowing up front how GHL handles this, because it splits into two halves — structured data (GHL is great at) and the PDF file (GHL's API can't file into a contact, confirmed below).

`POST /api/debt-schedule` (Node runtime):

1. Rate-limit by IP.
2. Bot check — Cloudflare Turnstile is the least annoying option for a public page.
3. Re-validate the body with the same zod schema. Never trust client validation.
4. Generate the PDF (phase 2).
5. **Host the PDF** and get a durable URL. Vercel Blob is the natural fit here (`@vercel/blob`, one line, stores on infra you already pay for). Store the raw submission JSON alongside it — that's your persistence, and it lets you regenerate the PDF later without asking the client again.
6. **Upsert the GHL contact** (by email) via the v2 API: `firstName`, `lastName`, `email`, `phone`, `companyName` = business name, `locationId`, a `source` of `debt-schedule`, and a tag like `Debt Schedule Submitted`.
7. **Write the debt data onto the contact as custom fields** — this is what "store it in GHL" means in practice:
   - `Debt Schedule PDF` (text/URL) → the hosted PDF link from step 5. This is how staff open the document from inside the contact.
   - `Total Debt Balance` (currency) and `Total Monthly Debt Payment` (currency) → the two totals, as native fields so staff can see, filter, and build workflows on them.
   - `Debt Schedule Data` (large text) → the full submission as JSON, so nothing is lost and the record is self-contained.
   - Optionally a `Debt Schedule Submitted On` (date).
8. **Add a Note to the contact** with a short readable summary (business, date, N debts, totals, PDF link) so it shows on the contact timeline at a glance — Notes are the natural place for a human-readable record.
9. Optionally enroll the contact in a **workflow** (via the tag) to ping the advisor that a schedule came in.
10. Return a short-lived signed URL for the generated PDF so the thank-you page can offer **"Download your copy."** This is how the client gets their record — no client email for now (decided). Because there's no transactional email in play, phase 3 needs **no email provider** at all; the whole delivery path is Vercel Blob + GHL.

### The GoHighLevel specifics (get these right)

- **Auth: a Private Integration Token (PIT).** This is a single-location internal integration — exactly GHL's stated use case for a PIT. Create it in the sub-account under **Settings → Private Integrations**, grant scopes `contacts.write` and `contacts.readonly` (add `locations/customFields.write` only if you want Claude Code to create the custom-field definitions via API rather than in the UI). Copy the token. Then set `GHL_PRIVATE_TOKEN` and `GHL_LOCATION_ID` in Vercel env vars. Do **not** use a v1 location API key — v1 is end-of-life.
- **Every v2 request** goes to `https://services.leadconnectorhq.com`, needs the header `Version: 2021-07-28` and a `locationId` on writes, and carries `Authorization: Bearer <PIT>`. Missing the Version header or locationId returns an error that doesn't name what's missing — the classic first-try failure.
- **Create the custom fields once** (GHL UI is simplest: Settings → Custom Fields, contact model) and give Claude Code their field IDs, or let it create them via API and record the IDs. Writing values uses `customFields: [{ id, field_value }]` on the contact upsert.
- **The file limitation, so nobody wastes a day on it.** You **cannot** push a file into a contact's Documents folder through the API — it's an open, still-unshipped GHL feature request. File-upload custom fields exist but are one-file and finicky over the API. That's why the PDF is *hosted* (step 5) and *linked* from a contact field (step 7), rather than uploaded into GHL. **Decided: the link is the approach** — no need to make the PDF bytes physically live inside GHL.
- **New file, not `lib/ghl.ts`.** The existing `lib/ghl.ts` is front-end embed IDs + a script loader; this is a server-only client. Put it in `lib/debt-schedule/ghl.ts` (or `lib/ghl-api.ts`) so the two don't get confused. Respect the rate limit (100 req / 10s per location) — this integration is nowhere near it, but batch the calls per submission rather than looping.

**Failure handling.** The order above is deliberate: host + persist the JSON (step 5) *before* the GHL calls, so if GHL is down the submission is never lost and can be replayed. If a GHL write fails after the contact upsert, retry the field write, then fall back to the note; if it all fails, you still have the JSON and can tell the client you've got their info. Never make them fill it in twice.

---

## 5.5 Repo conventions that will bite if ignored

These come straight from `CLAUDE.md` and the code, and each has already caused a real bug on this site:

- **The `home.css` unlayered-CSS trap — the big one.** Any route that renders `SiteNav`/`SiteFooter` pulls in `home.css`, which is a plain **unlayered** stylesheet with bare element rules: `section{ padding:96px 0; background:#fff }`, `button,.btn{ padding:14px 28px; border:none; font-size:15.5px }`, `a{ color:inherit }`, `footer{ background:var(--navy-soft); padding:64px 0 40px }`. Unlayered CSS beats Tailwind's `@layer utilities` **regardless of specificity**, so these silently override your utility classes. A form page is nothing *but* buttons, inputs, and sections, so this will hit hard. Mitigations `CLAUDE.md` mandates: mark colliding utilities with `!` (`bg-primary!`, `py-6!`, `p-0!`, `text-sm!`), prefer `ring-1 ring-border` over `border`, and if the debt card's own `<footer>`-like elements exist, opt them out (`bg-transparent! px-0!`). Build it, then check every button and input in a browser — the collision is invisible in code.
- **New `app/` routes use Tailwind, not hand-rolled CSS.** Don't bring the prototype's `<style>` block across. Translate it to utilities on the `@theme` tokens.
- **Motion is required on every page.** A page whose content just appears is treated as a bug here. Wire the shared primitives: `SplitText` for the `<h1>`, `Reveal` (with `reveal` in className, rendered via its `as` prop — never a wrapper) for section heads and card blocks, and call `useMotionPreference()` so `?motion=1` and `prefers-reduced-motion` both work. See the motion checklist in `CLAUDE.md`, including the `initial={false}` + `whileInView` trap.
- **Page chrome.** Reuse `SiteNav` + `SiteFooter` and the `.hero`/`.cta-band` shells so the page feels native. Keep the CTA band's `id="talk"` or the nav's "Let's Talk" button is dead there.
- **noindex.** Match the subdomain: `page.tsx` sets metadata + `noindex`, like every other route here.
- **shadcn is `base-nova` on `@base-ui/react`.** For the modal/sheet, select, checkbox, and number inputs, prefer `@base-ui/react` primitives (Dialog, Select, Checkbox, Field) or `npx shadcn add` against that registry, rather than a new UI library. `components/ui/button.tsx` uses a `render` prop, not `asChild`.
- **Deploy loop:** `npm run build` must pass, then push to `main` → Vercel. GHL/Turnstile embeds and the like don't render on `file://` — verify on a Vercel preview URL.

---

## 6. Security and privacy

This is business financial data, so it deserves more care than a contact form.

- HTTPS only. No PII in query strings or URL fragments, ever.
- If you send per-client links, use a signed, expiring token — not a sequential ID someone could increment.
- Don't log request bodies. Scrub the payload from error reports (Sentry's `beforeSend`).
- Encrypt at rest, and set a retention period with an actual deletion job behind it.
- Don't ask for SSN, EIN, or account numbers. The template doesn't, and collecting them raises your obligations sharply.
- Put a one-line privacy note on the page saying what you do with the data.

One flag worth raising with your own counsel rather than with me: depending on what your firm does, a public form collecting business financial data may carry obligations under GLBA or state privacy law. I'm not a lawyer and this spec isn't legal advice — but it's a cheap question to ask before launch, not after.

---

## 7. Build phases and prompts for Claude Code

**What to put in the repo before starting.** Drop three files where Claude Code can read them:
- `docs/debt-schedule-build-spec.md` — this document.
- `docs/debt-schedule-prototype.html` — the finished front-end reference (layout/flow/behavior — not the color/font source; see §2.5).
- `public/templates/business-debt-schedule.pdf` — the original template, committed as-is.

**Point Claude Code at `CLAUDE.md` first.** The stack is already known (Next.js 14 App Router, Tailwind v4, shadcn `base-nova`, Vercel), so no discovery step is needed — but `CLAUDE.md` carries the conventions this feature must follow (§5.5). Open with: *"Read `CLAUDE.md`, then `docs/debt-schedule-build-spec.md` and `docs/debt-schedule-prototype.html`. Confirm you understand the `home.css` unlayered-CSS trap and the motion requirement before writing code."*

Work phase by phase. One long prompt produces a plausible-looking thing that's wrong in three places you won't find until a client hits them.

### Phase 1 — Frontend (port the prototype)

> Read `CLAUDE.md`, `docs/debt-schedule-build-spec.md`, and open `docs/debt-schedule-prototype.html`. The prototype is the source of truth for layout, flow, copy, and behavior — but **not** for exact colors or fonts: map those onto the repo's `@theme` tokens and site fonts per §2.5 (site blue `#2563eb`, not the prototype's `#294DFF`; General Sans / IBM Plex, not Bebas Neue). Port it into this repo's stack as the components in §1's file list, route `/debt-schedule`, with the submit handler stubbed to `console.log` the validated payload. Match the prototype's behavior exactly: the card-list pattern, the per-debt sheet (full-screen on mobile via a Base UI Dialog, modal on desktop), conditional "Other" and collateral fields, live sticky totals, blur-time currency formatting, validation on blur/submit, the non-blocking warnings (balance > original, $0 card payment), and localStorage autosave with the restore banner. Extract `lib/debt-schedule/constants.ts` and `schema.ts` (zod) from the prototype's `DEBT_TYPES`/`SECURED`/`STATUS` arrays and validation functions — dropdown strings must match §0 exactly or the PDF rejects them. Build it in Tailwind on the `@theme` tokens (no raw hex, no ported `<style>` block); reuse `SiteNav`/`SiteFooter` and wire the motion primitives per the checklist. **Watch the `home.css` trap in §5.5** — mark colliding button/input/section utilities with `!` and prefer `ring-1 ring-border`. Use `public/img/kiba-logo.png`, not a rebuilt mark. `page.tsx` sets metadata + noindex. Don't touch PDF generation yet.

Then review it on a **Vercel preview** (not `file://`) on a phone: add a second debt, watch the totals update, refresh mid-form, check an empty required field, and confirm no button/input got clobbered by `home.css`.

### Phase 2 — PDF generation

> Now phase 2. Implement `lib/debt-schedule/fill-pdf.ts` per §4 using pdf-lib against `public/templates/business-debt-schedule.pdf`. Mind the index mismatch: text fields are `...Row1` through `...Row10` (1-indexed) while dropdowns are `Dropdown1.0` through `Dropdown1.9` (0-indexed). Flatten before saving. Add a script at `scripts/test-fill-pdf.ts` that generates a sample with 3, 10, and 14 debts so I can eyeball all three cases, including the multi-page path.

Open all three outputs yourself. The 14-debt one is where problems live.

### Phase 3 — Submission and delivery (store in GoHighLevel)

> Phase 3: the `POST /api/debt-schedule` route per §5 (Node runtime), plus the thank-you page with a **"Download your copy"** link (a short-lived signed URL to the generated PDF — this is how the client gets their record; no client email). Re-validate server-side with the shared zod schema, rate-limit by IP, add Turnstile. Then store the submission in GoHighLevel per §5's steps 5–9: host the PDF on Vercel Blob, upsert the contact by email via the GHL v2 API, and write the debt data onto the contact as custom fields (PDF URL, the two totals as currency fields, and the full JSON in a large-text field), plus a summary Note. Build the GHL client as a new server-only module `lib/debt-schedule/ghl.ts` — do **not** touch `lib/ghl.ts`, which is unrelated front-end embed config. Read config from `GHL_PRIVATE_TOKEN` and `GHL_LOCATION_ID` env vars; every request needs the `Version: 2021-07-28` header and a `locationId`. The custom-field IDs will be provided as env vars/constants — don't hardcode guesses. Host + persist the JSON before the GHL calls so a GHL failure never loses a submission. No email provider is needed this phase. Follow the security notes in §6 — no request-body logging, scrub the payload from error reports. Note: GHL live calls won't work on `file://`; verify on a Vercel preview.

Before this phase, one human step (see §5): create the Private Integration token and the custom fields in GoHighLevel, and hand Claude Code the token, location ID, and field IDs as env vars.

---

## 8. Decisions I'd want from you

0. **Hosting — resolved.** Confirmed Next.js 14 on Vercel, so phases 2–3 run server-side as written. No architecture change needed.
1. **Delivery — resolved: GoHighLevel.** Submissions store on the GHL contact (data as custom fields + a note; PDF hosted on Vercel Blob and linked). See §5 for the exact fields and the one file-handling caveat. Two small follow-ups for you, both in decision #6.
2. **Page chrome.** Full marketing treatment (hero + `SiteNav`/`SiteFooter` + CTA band + motion), or a leaner utility page? `CLAUDE.md` puts a testimonial section on every page except legal ones — I'd argue an intake form is like a legal page: keep nav/footer/CTA and a compact hero, but **skip testimonials** (a wall of client praise in the middle of someone entering their debts reads wrong). Your call; it's a one-line exception either way.
3. **Where does "Other" debt type detail go?** The PDF has no field for it. Fold it into the collateral cell, or drop it from the PDF and keep it only in the stored data?
4. **One public page or per-client links?** Per-client tokens let you prefill the business name, track who's responded, and chase the ones who haven't. It's more to build. Worth it if you send this regularly.
5. **Store submissions, or email-only?** Resolved by decision #1 — stored in GHL, with the JSON also kept on Vercel Blob so the PDF can be regenerated.
6. **Two GHL follow-ups — resolved.** (a) No client email for now — the client downloads their PDF on the thank-you page at submit. (b) The PDF is stored as a **link** on the contact (hosted on Vercel Blob), not as bytes inside GHL. Net effect: phase 3 needs no email provider.
7. **Brand blue.** The site uses `#2563eb`; the printed brand guide says `#294DFF`. The page will match the site. If you'd rather the guide's exact hex, that's a site-wide change to make deliberately, not inside this feature.


