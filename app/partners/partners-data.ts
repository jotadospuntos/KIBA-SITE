/*
 * The referral-partner co-branded landing pages, migrated off
 * public/legacy/partners/*.html.
 *
 * Replaces the legacy config-block-plus-injector pattern with a data file, per
 * CLAUDE.md. `_template.html` goes with them: adding a partner is a new entry
 * here plus a logo in public/partners/img/, not a copied file.
 *
 * VERBATIM from each legacy config block. `ghlFormId` is that partner's own
 * GoHighLevel form — they are different forms and route to different places, so
 * don't collapse them.
 *
 * LOGOS: the legacy pages inlined the real logo as a base64 data URI, and the
 * public/partners/img/<slug>.png files next to them are something else — the
 * 1200x630 og:image share cards. Reusing those as the badge logo was a
 * regression caught in review; the extracted logos are now
 * public/partners/img/<slug>-logo.png, and `ogImage` keeps pointing at the
 * share card, as the legacy pages did.
 *
 * NOTE: /partners/ace-tools redirects to /partners/integ-funding in
 * next.config.js. That redirect predates this migration and still applies.
 */

export type Partner = {
  slug: string;
  /* Full name, used in the "Recommended by …" hero badge. */
  name: string;
  /* Short form, used mid-sentence. */
  shortName: string;
  /* The partner's actual logo, for the co-brand badge. */
  logo: string;
  /* The 1200x630 share card the legacy page used as og:image. NOT the logo -
     these are different images and were confused once already. */
  ogImage: string;
  /* This partner's own GoHighLevel form ID. */
  ghlFormId: string;
  ghlFormName: string;
};

export const PARTNERS: Partner[] = [
  {
    slug: 'rivenway',
    name: 'RivenWay Business Solutions',
    shortName: 'RivenWay',
    logo: '/partners/img/rivenway-logo.png',
    ogImage: '/partners/img/rivenway.png',
    ghlFormId: 'a7Jl5YHY3tyDzwGxpX1w',
    ghlFormName: 'REFERRAL - Rivenway'
  },
  {
    slug: 'integ-funding',
    name: 'Integ Funding',
    shortName: 'Integ Funding',
    logo: '/partners/img/integ-funding-logo.png',
    ogImage: '/partners/img/integ-funding.png',
    ghlFormId: 'Mkxr0ueHX0Ng3ycuYMTV',
    ghlFormName: 'REFERRAL - Integ Funding'
  }
];

export function getPartner(slug: string): Partner | undefined {
  return PARTNERS.find((p) => p.slug === slug);
}
