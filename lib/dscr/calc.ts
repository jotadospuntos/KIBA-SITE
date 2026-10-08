/*
 * The DSCR calculator's math. No UI in here, so it can be checked on its own
 * (scripts/test-dscr.ts) and reused by the embed and, later, the opt-in API.
 *
 * SOURCE: "Summary Template.xlsx", the workbook KIBA's advisors fill in.
 *   - EBITDA = SUM(Interest Addback, Depreciation Addback, Net Income)
 *     ('Profile and Summary'!F30). Gross Revenue sits in the same block but is
 *     NOT in the sum; the calculator collects it for reference only.
 *   - Annual Debt Service = total monthly payments x 12 ('Business Debt'!O12).
 *   - DSCR = EBITDA / Annual Debt Service ('Profile and Summary'!J17).
 *
 * NO x1.25 (or x1.2). The workbook labels a cell "Annual Debt Service (x 1.2)"
 * but its DSCR uses the plain figure. The business tried dividing by x1.25,
 * then showing it as an extra figure, and settled on neither: plain DSCR, and
 * no padded figure on screen. Don't reintroduce it.
 *
 * MCA CONVERSION (decided): daily x 22, weekly x 4. Round numbers on purpose;
 * they're the business's figures, not 21.67 / 4.33. Don't "correct" them.
 */

export const MCA_MULTIPLIER = { daily: 22, weekly: 4 } as const;
export type McaFrequency = keyof typeof MCA_MULTIPLIER;

export type EbitdaInput = {
  /* Reference only - never part of EBITDA. */
  grossRevenue?: number;
  /* Can be negative (a loss). */
  netIncome: number;
  interest: number;
  depreciation: number;
};

export type DebtInput = {
  eidl: number;
  sba: number;
  equipment: number;
  lineOfCredit: number;
  /* The MCA payment as debited, per `mcaFrequency`. */
  mca: number;
  mcaFrequency: McaFrequency;
  /* Monthly payments for anything not above, each optionally named. */
  other: { name?: string; monthly: number }[];
};

export function ebitda({ netIncome, interest, depreciation }: EbitdaInput): number {
  return netIncome + interest + depreciation;
}

export function mcaMonthly(payment: number, frequency: McaFrequency): number {
  return payment * MCA_MULTIPLIER[frequency];
}

export function totalMonthlyPayments(d: DebtInput): number {
  return (
    d.eidl +
    d.sba +
    d.equipment +
    d.lineOfCredit +
    mcaMonthly(d.mca, d.mcaFrequency) +
    d.other.reduce((sum, o) => sum + o.monthly, 0)
  );
}

/* Plain annual debt service, the workbook's 'Business Debt'!O12. */
export function annualDebtService(d: DebtInput): number {
  return totalMonthlyPayments(d) * 12;
}

/* null when there is no debt service to divide by: "no DSCR", not Infinity. */
export function dscr(ebitdaValue: number, annualDebtServiceValue: number): number | null {
  if (!(annualDebtServiceValue > 0)) return null;
  return ebitdaValue / annualDebtServiceValue;
}

/*
 * Turns what someone typed into a number. Accepts "1,234.50", "$1234.5" and
 * the accountant's loss notation "(1,234)" -> -1234, which is how a loss is
 * printed on a tax return. Empty -> null (the caller decides whether blank
 * means 0). Unparseable -> NaN.
 */
export function parseAmount(raw: string): number | null {
  const s = raw.trim();
  if (s === '') return null;
  const negative = /^\(.*\)$/.test(s) || s.includes('-');
  const digits = s.replace(/[^0-9.]/g, '');
  if (digits === '' || (digits.match(/\./g) || []).length > 1) return NaN;
  const n = parseFloat(digits);
  return negative ? -n : n;
}
