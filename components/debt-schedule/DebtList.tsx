'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { MAX_DEBTS } from '@/lib/debt-schedule/constants';
import type { DebtEntry } from '@/lib/debt-schedule/schema';
import DebtCard from './DebtCard';

export const ADD_DEBT_BUTTON_ID = 'add-debt-button';

export type DebtItem = { id: string; debt: DebtEntry };

type Props = {
  items: DebtItem[];
  hasNoDebt: boolean;
  forceMotion: boolean;
  /* Shown under the list when "Review & submit" was pressed with nothing in it. */
  error?: string;
  onAdd: (trigger: HTMLElement) => void;
  onEdit: (index: number, trigger: HTMLElement) => void;
  onDelete: (index: number) => void;
  onNoDebtChange: (value: boolean) => void;
};

/*
 * The card list + empty state + "no debt" checkbox.
 *
 * Cards animate in and out with framer-motion (they're added after the page
 * has loaded, so the scroll-triggered Reveal can't cover them). The non-
 * animating branch gets an explicit visible state and a zero duration, never
 * `initial={false}` - see CLAUDE.md's framer-motion traps.
 */
export default function DebtList({
  items,
  hasNoDebt,
  forceMotion,
  error,
  onAdd,
  onEdit,
  onDelete,
  onNoDebtChange
}: Props) {
  const prefersReduced = useReducedMotion();
  const animate = !prefersReduced || forceMotion;

  return (
    <div>
      {hasNoDebt ? (
        <div className="rounded-[16px] bg-white p-6 text-center text-[14.5px] text-slate ring-1 ring-line">
          Marked as no business debt. Uncheck below to add debts.
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[16px] bg-white px-6 py-10 text-center border border-dashed border-line">
          <h3 className="mb-1.5! font-heading text-[19px] text-ink">No debts added yet</h3>
          <p className="mx-auto mb-6! max-w-[380px] text-[15px] text-slate">
            Add each loan, line of credit, or business card one at a time.
          </p>
          <button type="button" className="btn btn-primary" onClick={(e) => onAdd(e.currentTarget)}>
            <Plus className="size-4" />
            Add your first debt
          </button>
        </div>
      ) : (
        <>
          <ul className="m-0! grid list-none gap-4 p-0!">
            <AnimatePresence initial={false}>
              {items.map(({ id, debt }, i) => (
                <motion.li
                  /* A stable id, not the index: index keys would re-animate
                     every card below a deleted one. */
                  key={id}
                  layout={animate}
                  initial={animate ? { opacity: 0, y: 14 } : { opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={animate ? { opacity: 0, scale: 0.98 } : { opacity: 0 }}
                  transition={animate ? { duration: 0.32, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
                >
                  <DebtCard
                    debt={debt}
                    onEdit={(trigger) => onEdit(i, trigger)}
                    onDelete={() => onDelete(i)}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          {items.length < MAX_DEBTS && (
            <button
              id={ADD_DEBT_BUTTON_ID}
              type="button"
              onClick={(e) => onAdd(e.currentTarget)}
              className="mt-4 flex w-full justify-center rounded-[16px]! bg-transparent py-4! text-[15px]! text-blue border-2! border-dashed! border-blue-soft/60! hover:bg-white"
            >
              <Plus className="size-4" />
              Add another debt
            </button>
          )}
        </>
      )}

      {error && (
        <p id="debts-error" role="alert" className="mt-3 text-[13.5px] text-destructive">
          {error}
        </p>
      )}

      <label className="mt-5 flex cursor-pointer items-center gap-3 text-[15px] text-ink">
        <input
          type="checkbox"
          className="size-[18px] accent-blue"
          checked={hasNoDebt}
          onChange={(e) => onNoDebtChange(e.target.checked)}
        />
        My business has no debt in its name.
      </label>
    </div>
  );
}
