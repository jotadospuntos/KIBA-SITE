/*
 * Copy for /about-us, adapted from https://kibadvisors.com/about-us/.
 *
 * Unlike app/meet-our-team/team-data.ts, this is NOT verbatim. The source page
 * is a list of statements with no connective tissue, so the sentences that
 * carry meaning (the origin line, the problem statement, the vision, the five
 * values, the differentiation line, the services, the client profile and the
 * closing commitment) are kept word-for-word, and the headings and short
 * connecting lines around them are written for this layout. Anything in quotes
 * on the source page is reproduced exactly — don't reword those.
 */

export type Value = {
  name: string;
  body: string;
};

/* The five core values, verbatim from the source page. */
export const VALUES: Value[] = [
  {
    name: 'Integrity First',
    body: "We tell the truth even when it's not the easiest answer. If financing isn't right for you, we'll say so."
  },
  {
    name: 'Stewardship Over Sales',
    body: 'Your business matters. We treat it with the care and responsibility it deserves, not as a product to move.'
  },
  {
    name: 'Long-Term Relationships',
    body: "We don't chase quick wins. We build partnerships that grow over time."
  },
  {
    name: 'Clarity in Complexity',
    body: "Financial decisions shouldn't feel overwhelming. We cut through the noise so you can move forward with confidence."
  },
  {
    name: 'Kingdom Impact',
    body: "Success isn't measured by profit alone. Purpose, responsibility, and impact matter just as much."
  }
];

/* What preparation-first advisory produces, verbatim from the source page. */
export const OUTCOMES = [
  'Stronger positioning',
  'Higher approval odds',
  'Better terms',
  'Fewer surprises'
];

/* Services, verbatim from the source page. */
export const SERVICES = [
  'Strategic business financing and capital advisory',
  'SBA and bank-level loan preparation and placement',
  'Cash flow and debt structure optimization',
  'Tax-credit and financial efficiency strategies',
  'Ongoing advisory support as your business evolves'
];

/* The client profile, verbatim from the source page. */
export const CLIENT_PROFILE = [
  'Want honest guidance, not sales tactics',
  'Care about building something that lasts',
  'Believe their business can serve a greater purpose',
  'Value faith, family, and responsibility alongside growth'
];
