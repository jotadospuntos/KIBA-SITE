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
