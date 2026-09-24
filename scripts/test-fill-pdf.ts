/*
 * Eyeball test for lib/debt-schedule/fill-pdf.ts. Writes three samples to
 * scripts/out/ (gitignored): 3 debts (one page, mostly empty), 10 (exactly
 * full) and 14 (spills onto a second page - the case where problems live).
 *
 *   npx tsx scripts/test-fill-pdf.ts
 *
 * Every sample goes through the real zod schema first, so the filler is only
 * ever tested on data the API route would actually accept.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fillDebtSchedule } from '../lib/debt-schedule/fill-pdf';
import { debtScheduleSchema } from '../lib/debt-schedule/schema';
import type { DebtEntry } from '../lib/debt-schedule/schema';

/* A spread that hits every branch: Other, Secured + collateral, revolving,
   Delinquent, a lender name too long for its cell, $0 card payment. */
const POOL: DebtEntry[] = [
  { lenderName: 'Live Oak Bank', typeOfDebt: 'SBA 7(a)', originalAmount: 750000, currentBalance: 612430.18, interestRate: 10.25, monthlyPayment: 8912.4, openDate: '2021-06-15', maturityDate: '2031-06-15', noMaturity: false, securedStatus: 'Secured', paymentStatus: 'Current', collateral: 'Business assets, real estate' },
  { lenderName: 'American Express', typeOfDebt: 'Credit Card', originalAmount: 25000, currentBalance: 8420.55, interestRate: 24.99, monthlyPayment: 0, openDate: '2019-02-01', noMaturity: true, securedStatus: 'Unsecured', paymentStatus: 'Current' },
  { lenderName: 'Caterpillar Financial Services Corporation of North America', typeOfDebt: 'Equipment Loan', originalAmount: 184000, currentBalance: 121300, interestRate: 7.9, monthlyPayment: 3710, openDate: '2022-09-01', maturityDate: '2027-09-01', noMaturity: false, securedStatus: 'Secured', paymentStatus: 'Delinquent', collateral: 'CAT 320 excavator and attachments, serial on file' },
  { lenderName: 'Wells Fargo', typeOfDebt: 'Line of Credit', originalAmount: 150000, currentBalance: 162000, interestRate: 9.5, monthlyPayment: 1450, openDate: '2020-11-10', noMaturity: true, securedStatus: 'Unsecured', paymentStatus: 'Current' },
  { lenderName: 'SBA', typeOfDebt: 'EIDL', originalAmount: 150000, currentBalance: 141882.07, interestRate: 3.75, monthlyPayment: 731, openDate: '2020-07-02', maturityDate: '2050-07-02', noMaturity: false, securedStatus: 'Secured', paymentStatus: 'Current', collateral: 'General business assets' },
  { lenderName: 'Kabbage', typeOfDebt: 'Other', otherDebtType: 'Merchant cash advance', originalAmount: 40000, currentBalance: 12500, interestRate: 32, monthlyPayment: 2400, openDate: '2024-01-20', maturityDate: '2025-01-20', noMaturity: false, securedStatus: 'Unsecured', paymentStatus: 'Delinquent' },
  { lenderName: 'Regions Bank', typeOfDebt: 'Commercial Mortgage', originalAmount: 1200000, currentBalance: 1034211.9, interestRate: 6.875, monthlyPayment: 7883.12, openDate: '2018-04-30', maturityDate: '2043-04-30', noMaturity: false, securedStatus: 'Secured', paymentStatus: 'Current', collateral: '1400 Dauphin St, Mobile AL' },
  { lenderName: 'Chase', typeOfDebt: 'Non-SBA Commercial Loan', originalAmount: 90000, currentBalance: 45000, interestRate: 8.25, monthlyPayment: 1840, openDate: '2023-03-01', maturityDate: '2028-03-01', noMaturity: false, securedStatus: 'Unsecured', paymentStatus: 'Current' },
  { lenderName: 'Bank of America', typeOfDebt: 'PPP', originalAmount: 62000, currentBalance: 0, interestRate: 1, monthlyPayment: 0, openDate: '2020-04-15', maturityDate: '2025-04-15', noMaturity: false, securedStatus: 'Unsecured', paymentStatus: 'Current' }
];

function debts(n: number): DebtEntry[] {
  return Array.from({ length: n }, (_, i) => {
    const d = POOL[i % POOL.length];
    return i < POOL.length ? d : { ...d, lenderName: `${d.lenderName.slice(0, 52)} (#${i + 1})` };
  });
}

async function main() {
  const outDir = path.join(__dirname, 'out');
  await mkdir(outDir, { recursive: true });
  for (const n of [3, 10, 14]) {
    const data = debtScheduleSchema.parse({
      contactName: 'Jane Doe',
      businessName: 'Gulf Coast Fabrication & Welding Services, LLC',
      asOfDate: '2026-09-23',
      hasNoDebt: false,
      debts: debts(n)
    });
    const bytes = await fillDebtSchedule(data);
    const file = path.join(outDir, `debt-schedule-${n}.pdf`);
    await writeFile(file, bytes);
    console.log(`${n} debts -> ${path.relative(process.cwd(), file)} (${bytes.length} bytes)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
