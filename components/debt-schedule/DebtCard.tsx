'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { formatMoney, formatPercent } from '@/lib/debt-schedule/format';
import type { DebtEntry } from '@/lib/debt-schedule/schema';

/* "Other — Merchant cash advance". Shared with the review step. */
export function debtTypeLabel(d: DebtEntry): string {
  return d.typeOfDebt === 'Other' && d.otherDebtType ? `Other — ${d.otherDebtType}` : d.typeOfDebt;
}

/* Status colours aren't in the @theme token set, so they're Tailwind's own
   muted greens/reds rather than new raw hexes. Delinquent is the one that
   matters, so it uses the destructive token. */
const TAG = 'inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-[12px] font-semibold';

type Props = {
  debt: DebtEntry;
  onEdit: (trigger: HTMLElement) => void;
  onDelete: () => void;
};

/* One debt, collapsed. The buttons are plain, not the repo Button - see the
   Base UI Button note in CLAUDE.md. */
export default function DebtCard({ debt, onEdit, onDelete }: Props) {
  const rate = formatPercent(debt.interestRate);

  return (
    <div className="rounded-[16px] bg-white p-5 shadow-soft ring-1 ring-line sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-heading text-[17px] font-semibold text-ink">{debt.lenderName}</div>
          <div className="mt-0.5 text-[14px] text-slate">
            {debtTypeLabel(debt)}
            {rate && ` · ${rate}`}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            aria-label={`Edit ${debt.lenderName}`}
            onClick={(e) => onEdit(e.currentTarget)}
            className="grid size-10 place-items-center rounded-full! bg-transparent p-0! text-slate hover:bg-paper hover:text-blue"
          >
            <Pencil className="size-[18px]" />
          </button>
          <button
            type="button"
            aria-label={`Delete ${debt.lenderName}`}
            onClick={onDelete}
            className="grid size-10 place-items-center rounded-full! bg-transparent p-0! text-slate hover:bg-red-50 hover:text-destructive"
          >
            <Trash2 className="size-[18px]" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate">Current balance</div>
          <div className="mt-0.5 font-heading text-[17px] font-semibold tabular-nums text-ink">
            {formatMoney(debt.currentBalance)}
          </div>
        </div>
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate">Monthly payment</div>
          <div className="mt-0.5 font-heading text-[17px] font-semibold tabular-nums text-ink">
            {formatMoney(debt.monthlyPayment)}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className={`${TAG} bg-ivory text-navy-soft`}>{debt.securedStatus}</span>
        {debt.paymentStatus === 'Delinquent' ? (
          <span className={`${TAG} bg-red-50 text-destructive`}>Delinquent</span>
        ) : (
          <span className={`${TAG} bg-emerald-50 text-emerald-700`}>Current</span>
        )}
      </div>
    </div>
  );
}
