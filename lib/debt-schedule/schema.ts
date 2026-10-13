import { z } from 'zod';
import {
  DEBT_TYPES,
  MAX_COLLATERAL,
  MAX_DEBTS,
  MAX_LENDER,
  MAX_OTHER_TYPE,
  SECURED,
  STATUS
} from './constants';
import { todayISO } from './format';
import { MCA_MULTIPLIER, mcaMonthly } from '../dscr/calc';
import type { McaFrequency } from '../dscr/calc';

/*
 * THE ONE SOURCE OF TRUTH for what a debt schedule is. The form validates with
 * it, the API route re-validates with it (phase 3), and the PDF filler reads the
 * types it produces (phase 2). Don't duplicate a field list anywhere else.
 *
 * The error strings are the prototype's copy and are what the form shows under
 * each field.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const MCA_FREQUENCIES = Object.keys(MCA_MULTIPLIER) as [McaFrequency, ...McaFrequency[]];

/* Per-field rules only. The cross-field rules live in debtCrossFieldIssues
   below, separately, so the form can run both halves every time: zod skips an
   object's refinements while any of its fields are invalid, and the form needs
   to show every error at once. */
const debtEntryBase = z.object({
  lenderName: z.string().trim().min(1, "Enter the lender's name.").max(MAX_LENDER),
  typeOfDebt: z.enum(DEBT_TYPES, { error: 'Choose a type.' }),
  otherDebtType: z.string().trim().max(MAX_OTHER_TYPE).optional(),
  originalAmount: z.number({ error: 'Enter an amount.' }).nonnegative('Enter an amount.'),
  currentBalance: z.number({ error: 'Enter a balance.' }).nonnegative('Enter a balance.'),
  interestRate: z
    .number({ error: 'Enter a rate (0–100).' })
    .min(0, 'Enter a rate (0–100).')
    .max(100, 'Enter a rate (0–100).'),
  monthlyPayment: z
    .number({ error: 'Enter a payment (0 is allowed).' })
    .nonnegative('Enter a payment (0 is allowed).'),
  /* MCAs only: the payment as debited, and how often. monthlyPayment is then
     derived from them (daily x 22, weekly x 4 - the business's figures, shared
     with the DSCR calculator), never typed. */
  mcaPayment: z
    .number({ error: 'Enter the payment amount.' })
    .nonnegative('Enter the payment amount.')
    .optional(),
  mcaFrequency: z.enum(MCA_FREQUENCIES).optional(),
  openDate: z.string().regex(ISO_DATE, 'Enter the open date.'),
  /* Revolving lines have none; noMaturity records that it was deliberate. */
  maturityDate: z.string().optional(),
  noMaturity: z.boolean(),
  securedStatus: z.enum(SECURED, { error: 'Choose one.' }),
  paymentStatus: z.enum(STATUS, { error: 'Choose one.' }),
  collateral: z.string().trim().max(MAX_COLLATERAL).optional()
});

export type DebtEntry = z.infer<typeof debtEntryBase>;
export type DebtField = keyof DebtEntry;

type Issue = { path: DebtField; message: string };

/* Works on a partial candidate so the form can run it before the base parse
   succeeds. */
export function debtCrossFieldIssues(d: Partial<DebtEntry>): Issue[] {
  const issues: Issue[] = [];
  if (d.typeOfDebt === 'Other' && !d.otherDebtType?.trim()) {
    issues.push({ path: 'otherDebtType', message: 'Describe the debt type.' });
  }
  if (d.typeOfDebt === 'MCA' && d.mcaPayment === undefined) {
    issues.push({ path: 'mcaPayment', message: 'Enter the payment amount.' });
  }
  if (d.securedStatus === 'Secured' && !d.collateral?.trim()) {
    issues.push({ path: 'collateral', message: 'Describe the collateral securing this debt.' });
  }
  if (d.openDate && ISO_DATE.test(d.openDate) && d.openDate > todayISO()) {
    issues.push({ path: 'openDate', message: "The open date can't be in the future." });
  }
  if (!d.noMaturity && d.maturityDate && d.openDate && d.maturityDate <= d.openDate) {
    issues.push({ path: 'maturityDate', message: 'Maturity must be after the open date.' });
  }
  return issues;
}

/* To the cent, so 123.45 x 22 is 2715.90 rather than 2715.8999999. */
export function mcaMonthlyCents(payment: number, frequency: McaFrequency): number {
  return Math.round(mcaMonthly(payment, frequency) * 100) / 100;
}

/* For an MCA the monthly figure is recomputed here, so the server (and a
   restored draft) never trusts a monthlyPayment that disagrees with the debit
   and frequency. Non-MCA debts lose any stray MCA fields. */
export const debtEntrySchema = debtEntryBase
  .superRefine((d, ctx) => {
    for (const issue of debtCrossFieldIssues(d)) {
      ctx.addIssue({ code: 'custom', path: [issue.path], message: issue.message });
    }
  })
  .transform((d): DebtEntry => {
    if (d.typeOfDebt !== 'MCA') return { ...d, mcaPayment: undefined, mcaFrequency: undefined };
    const mcaFrequency = d.mcaFrequency ?? 'daily';
    const mcaPayment = d.mcaPayment ?? 0;
    return { ...d, mcaPayment, mcaFrequency, monthlyPayment: mcaMonthlyCents(mcaPayment, mcaFrequency) };
  });

/* Exported so the form's blur check and the server use the same rule. */
export const emailSchema = z.string().trim().pipe(z.email('Please enter a valid email address.'));

export const debtScheduleSchema = z
  .object({
    contactName: z.string().trim().min(1, 'Please enter your name.'),
    businessName: z.string().trim().min(1, 'Please enter your business name.'),
    /* Required: it's how the submission finds its GoHighLevel contact. */
    email: emailSchema,
    phone: z.string().trim().max(30).optional(),
    asOfDate: z.string().regex(ISO_DATE),
    hasNoDebt: z.boolean(),
    debts: z.array(debtEntrySchema).max(MAX_DEBTS)
  })
  .superRefine((s, ctx) => {
    if (!s.hasNoDebt && s.debts.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['debts'],
        message: 'Add at least one debt, or tick the box if your business has none.'
      });
    }
  });

export type DebtSchedule = z.infer<typeof debtScheduleSchema>;

/* Field -> first error message, for the form. Empty object means valid. */
export type DebtErrors = Partial<Record<DebtField, string>>;

export function validateDebt(candidate: Partial<DebtEntry>): DebtErrors {
  const errors: DebtErrors = {};
  const result = debtEntryBase.safeParse(candidate);
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as DebtField;
      if (!errors[field]) errors[field] = issue.message;
    }
  }
  for (const issue of debtCrossFieldIssues(candidate)) {
    if (!errors[issue.path]) errors[issue.path] = issue.message;
  }
  return errors;
}

/*
 * Non-blocking warnings. Both are legitimate data - a card or a line can sit
 * above its original limit, and a card can have had a $0 month - so they nudge
 * rather than stop the client.
 */
export type DebtWarnings = Partial<Record<'currentBalance' | 'monthlyPayment', string>>;

export function debtWarnings(d: Partial<DebtEntry>): DebtWarnings {
  const w: DebtWarnings = {};
  if (
    Number.isFinite(d.currentBalance) &&
    Number.isFinite(d.originalAmount) &&
    (d.currentBalance as number) > (d.originalAmount as number)
  ) {
    w.currentBalance =
      'Balance is above the original amount — worth a quick double-check (fine for cards & lines).';
  }
  if (d.typeOfDebt === 'Credit Card' && d.monthlyPayment === 0) {
    w.monthlyPayment = 'Cards usually have a monthly payment — enter what you typically pay.';
  }
  return w;
}

/* Restoring a saved draft: keep only debts that still pass the schema, so a
   stale or hand-edited localStorage value can't put bad data in the form. */
export function sanitizeStoredDebts(value: unknown): DebtEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((d) => {
    const r = debtEntrySchema.safeParse(d);
    return r.success ? [r.data] : [];
  });
}
