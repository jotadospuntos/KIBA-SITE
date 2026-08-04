# KIBA Landing Pages

Static landing pages for KIBA — referral partner pages and advisor booking pages.
Every page is a single self-contained HTML file. The only external calls are the
GoHighLevel embeds (form + calendar), which load at runtime.

## URL structure

| File                          | Live URL                        | Purpose                                   |
|-------------------------------|---------------------------------|-------------------------------------------|
| `partners/rivenway.html`      | `/partners/rivenway`            | Referral landing for RivenWay             |
| `partners/integ-funding.html` | `/partners/integ-funding`       | Referral landing for Integ Funding        |
| `partners/_template.html`     | (template — do not link)        | Copy this to add a new referral partner   |
| `advisors/michael-sylkatis.html` | `/advisors/michael-sylkatis`  | Booking page for Michael Sylkatis         |
| `advisors/barbara-sylkatis.html` | `/advisors/barbara-sylkatis`  | Booking page for Barbara Sylkatis         |
| `advisors/ariel-austria.html`    | `/advisors/ariel-austria`     | Booking page for Ariel Austria            |
| `advisors/_template.html`     | (template — do not link)        | Copy this to add a new advisor booking page |
| `thank-you.html`              | `/thank-you`                    | Shared confirmation page + booking calendar |
| `vercel.json`                 | —                               | Clean URLs + root redirect config         |

Clean URLs are on, so `.html` is dropped automatically (`/partners/rivenway`, not
`/partners/rivenway.html`). The bare domain redirects to https://kibadvisors.com —
change or remove that in `vercel.json` if you want something else at the root.

## Add a new REFERRAL PARTNER

1. Copy `partners/_template.html` to `partners/<partner-name>.html`
   (e.g. `partners/acme.html` -> lives at `/partners/acme`).
2. Open the new file and edit the `PARTNER` config block near the top:
   - `name`      – partner's full name (hero badge line)
   - `shortName` – partner's short name (hero sentence)
   - `ghlFormId` – that partner's GoHighLevel form ID
   - `PARTNER_LOGO` – the partner's logo (hosted image URL or base64 data URI).
     Leave "" to hide the badge.
3. Commit + push. It deploys automatically.
4. In GoHighLevel, set that form's redirect (On Submit -> Redirect) to
   `https://<your-domain>/thank-you`.

## Add a new ADVISOR booking page

1. Copy `advisors/_template.html` to `advisors/<advisor-name>.html`
   (e.g. `advisors/michael.html` -> lives at `/advisors/michael`).
2. Open the new file and edit the `ADVISOR` config block near the top:
   - `name`, `title`, `bio`
   - `photo`        – hosted image URL or base64 data URI (leave "" for a placeholder avatar)
   - `schedulerUrl` – GoHighLevel calendar embed URL OR Calendly link (leave "" for a placeholder)
3. Commit + push. It deploys automatically.

## Deploy / update

Connected to Vercel via Git: every commit to the main branch auto-deploys.
Adding a partner or advisor = add one file + commit. Nothing else to configure.
