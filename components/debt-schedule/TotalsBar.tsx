'use client';

import { formatMoney } from '@/lib/debt-schedule/format';

/*
 * Running totals, recalculated live. `sticky bottom-0` inside the form view
 * rather than `fixed`, so it rides along while the form is on screen and then
 * parks at the end of it instead of covering the CTA band and footer.
 *
 * "Review & submit" is never disabled: pressing it with nothing entered shows
 * the reason next to the list instead (a disabled button explains nothing).
 */
export default function TotalsBar({
  balance,
  payment,
  onReview
}: {
  balance: number;
  payment: number;
  onReview: () => void;
}) {
  return (
    <div className="sticky bottom-0 z-40 -mx-4 mt-10 sm:mx-0">
      <div
        className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 bg-navy-deep px-5 py-4 text-white shadow-soft pb-[max(16px,env(safe-area-inset-bottom))] sm:rounded-[16px] sm:px-7"
        aria-live="polite"
      >
        <div className="flex gap-8">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-blue-soft">Open balances</div>
            <div className="font-heading text-[19px] font-semibold tabular-nums sm:text-[22px]">
              {formatMoney(balance)}
            </div>
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-blue-soft">Monthly payments</div>
            <div className="font-heading text-[19px] font-semibold tabular-nums sm:text-[22px]">
              {formatMoney(payment)}
            </div>
          </div>
        </div>
        <button type="button" className="btn btn-primary max-sm:w-full max-sm:justify-center" onClick={onReview}>
          Review &amp; submit
        </button>
      </div>
    </div>
  );
}
