/*
 * The six "what to expect" cards, shared by the advisor booking pages and the
 * referral-partner landing pages.
 *
 * On the legacy HTML these were copy-pasted into every one of those files and
 * had already drifted in one place: the partner pages said "Every file is
 * reviewed individually" where the advisor pages said "Every situation is
 * reviewed individually". "situation" won — it reads to the business owner
 * actually on the page, which is who both versions are addressed to.
 *
 * Everything else is verbatim from those pages.
 */

export type ExpectItem = {
  title: string;
  body: string;
};

export const WHAT_TO_EXPECT: ExpectItem[] = [
  {
    title: 'Flexible Solutions',
    body: 'Financing options structured around your actual cash flow and long-term goals.'
  },
  {
    title: 'Dedicated Support',
    body: 'You work directly with an advisor who stays involved from first call to close.'
  },
  {
    title: 'Transparent Process',
    body: 'Straightforward communication and clear expectations — no hidden fees, no surprises.'
  },
  {
    title: 'Quick Guidance',
    body: 'Expert insight and loan recommendations delivered in 24–72 hours, not weeks.'
  },
  {
    title: 'Tailored Strategy',
    body: 'Every situation is reviewed individually, with guidance matched to the right next step.'
  },
  {
    title: 'Clear, Honest Guidance',
    body: 'We assess whether capital makes sense first — before ever discussing a specific path.'
  }
];

/* The three-stat row both page types carry in the hero. Verbatim from the
   legacy pages — note "24–72h Guidance Time", which is the figure the live
   WordPress homepage also uses (see CLAUDE.md on the stats discrepancy). */
export const TRUST_STATS = [
  { value: '50+', label: 'States Served' },
  { value: '$100M+', label: 'Capital Accessed' },
  { value: '24–72h', label: 'Guidance Time' }
];
