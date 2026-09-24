/*
 * The option lists for the three dropdowns, copied EXACTLY from the AcroForm in
 * public/templates/business-debt-schedule.pdf (Dropdown1.*, Dropdown2.*,
 * Dropdown3.*). pdf-lib throws if a choice field is given a value outside its
 * option list, so these strings are not copy: don't reword, re-case or
 * re-punctuate them. Each PDF list also carries "Select one" as its empty state;
 * that is never a submitted value, so it isn't here.
 *
 * "Other" goes onto the PDF as plain "Other". The client's "Please specify"
 * text (otherDebtType) has no field on the template, so it lives only in the
 * submitted data - decided by the human, see docs/debt-schedule-build-spec.md §8.
 */
export const DEBT_TYPES = [
  'SBA 7(a)',
  'Equipment Loan',
  'Non-SBA Commercial Loan',
  'Credit Card',
  'Line of Credit',
  'Commercial Mortgage',
  'EIDL',
  'PPP',
  'Other'
] as const;

export const SECURED = ['Secured', 'Unsecured'] as const;

export const STATUS = ['Current', 'Delinquent'] as const;

export type DebtType = (typeof DEBT_TYPES)[number];
export type SecuredStatus = (typeof SECURED)[number];
export type PaymentStatus = (typeof STATUS)[number];

/* The template has exactly ten rows. More than that is allowed in the form and
   handled at PDF time (phase 2); MAX_DEBTS is only a sanity ceiling, the same
   one the prototype used. */
export const PDF_ROWS = 10;
export const MAX_DEBTS = 30;

/* Field length limits, shared by the inputs' maxLength and the schema. */
export const MAX_LENDER = 60;
export const MAX_OTHER_TYPE = 40;
export const MAX_COLLATERAL = 60;

/* One public page, so one fixed key (decided - no per-client link tokens). */
export const STORAGE_KEY = 'kiba-debt-schedule';

/* Submissions (the PDF and the raw JSON) are deleted from Vercel Blob after
   this many days by the daily cleanup cron (decided by the human). The staff
   link written into GoHighLevel is signed for the same window, so it stops
   working when the file is gone rather than 404ing. */
export const RETENTION_DAYS = 45;

/* How long the client's "Download your copy" link on the success screen works. */
export const CLIENT_LINK_TTL_MS = 60 * 60 * 1000;

/* Cloudflare Turnstile. The site key is public by design (it ships to every
   browser); the SECRET key lives only in the TURNSTILE_SECRET_KEY env var. */
export const TURNSTILE_SITE_KEY = '0x4AAAAAAFBxyMqCKUvUrZ26';
