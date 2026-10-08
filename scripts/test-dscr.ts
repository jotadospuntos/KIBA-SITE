/*
 * Checks lib/dscr/calc.ts against the workbook's formulas.
 * Run: npx tsx scripts/test-dscr.ts
 */
import assert from 'node:assert/strict';
import {
  annualDebtService,
  dscr,
  ebitda,
  mcaMonthly,
  parseAmount,
  totalMonthlyPayments,
  type DebtInput
} from '../lib/dscr/calc';

const none: DebtInput = { eidl: 0, sba: 0, equipment: 0, lineOfCredit: 0, mca: 0, mcaFrequency: 'daily', other: [] };

// EBITDA = Net Income + Interest + Depreciation; Gross Revenue is ignored.
assert.equal(ebitda({ grossRevenue: 1_000_000, netIncome: 60_000, interest: 25_000, depreciation: 35_000 }), 120_000);
assert.equal(ebitda({ netIncome: -10_000, interest: 4_000, depreciation: 1_000 }), -5_000);

// MCA: daily x 22, weekly x 4.
assert.equal(mcaMonthly(500, 'daily'), 11_000);
assert.equal(mcaMonthly(2_500, 'weekly'), 10_000);

// Annual debt service = monthly total x 12, every bucket included.
const debts: DebtInput = {
  eidl: 700,
  sba: 2_000,
  equipment: 1_100,
  lineOfCredit: 400,
  mca: 100,
  mcaFrequency: 'weekly',
  other: [{ name: 'Truck note', monthly: 600 }, { monthly: 200 }]
};
assert.equal(totalMonthlyPayments(debts), 700 + 2_000 + 1_100 + 400 + 400 + 600 + 200);
assert.equal(annualDebtService(debts), 5_400 * 12);

// DSCR divides by the plain annual debt service (no x1.25).
assert.equal(dscr(120_000, annualDebtService({ ...none, sba: 100_000 / 12 })), 1.2);
assert.equal(dscr(120_000, annualDebtService(none)), null);
assert.equal(dscr(-5_000, 10_000), -0.5);

// Parsing.
assert.equal(parseAmount(''), null);
assert.equal(parseAmount('  '), null);
assert.equal(parseAmount('$1,234.50'), 1234.5);
assert.equal(parseAmount('(1,234)'), -1234);
assert.equal(parseAmount('-500'), -500);
assert.ok(Number.isNaN(parseAmount('abc') as number));
assert.ok(Number.isNaN(parseAmount('1.2.3') as number));

console.log('dscr calc: all checks passed');
