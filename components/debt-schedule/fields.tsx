'use client';

import type { ReactNode } from 'react';

/*
 * Shared field chrome for the debt schedule: label, control, error, warning.
 *
 * THE home.css TRAP, as it applies here. Every route with SiteNav/SiteFooter
 * loads app/home.css, which is unlayered, so its bare element rules beat
 * Tailwind's layered utilities regardless of specificity. For this form that
 * means:
 *   - button{ padding:14px 28px; border-radius:999px; font-size:15.5px; ... }
 *     -> every non-.btn button here sets p-0! / px-*! / text-*! / rounded-*!
 *   - h1,h2,h3{ margin:0 } -> heading margins use mt-*! / mb-*!
 *   - section / footer / nav carry page chrome -> none are used inside the
 *     form; the dialog's action row is a <div>, not a <footer>.
 * Borders are ring-1, which home.css never touches. Inputs, selects and labels
 * have no bare rule in home.css, so they are plain Tailwind.
 */

/* 16px text keeps iOS from zooming the page when an input takes focus. */
export const inputClass =
  'h-12 w-full rounded-[12px] bg-white px-4 font-body text-[16px] text-ink ring-1 ring-line outline-none transition-shadow ' +
  'placeholder:text-slate-light focus:ring-2 focus:ring-blue-soft ' +
  'aria-invalid:ring-2 aria-invalid:ring-destructive disabled:bg-paper disabled:text-slate-light';

export function errorId(id: string) {
  return `${id}-error`;
}
export function warningId(id: string) {
  return `${id}-warning`;
}

/* aria-describedby for a control: whichever of its messages are showing. */
export function describedBy(id: string, error?: string, warning?: string) {
  const ids = [error && errorId(id), warning && warningId(id)].filter(Boolean);
  return ids.length ? ids.join(' ') : undefined;
}

type FieldProps = {
  id: string;
  label: ReactNode;
  error?: string;
  warning?: string;
  className?: string;
  children: ReactNode;
};

export function Field({ id, label, error, warning, className = '', children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block font-sans text-[13.5px] font-semibold text-ink">
        {label}
      </label>
      {children}
      {error && (
        <p id={errorId(id)} className="mt-1.5 text-[13px] leading-snug text-destructive">
          {error}
        </p>
      )}
      {warning && !error && (
        <p id={warningId(id)} className="mt-1.5 text-[13px] leading-snug text-amber-700">
          {warning}
        </p>
      )}
    </div>
  );
}

/* "$" / "%" inside the input, as in the prototype. */
export function Adorned({
  symbol,
  side,
  children
}: {
  symbol: string;
  side: 'left' | 'right';
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 font-body text-[15px] text-slate ${
          side === 'left' ? 'left-4' : 'right-4'
        }`}
      >
        {symbol}
      </span>
      {children}
    </div>
  );
}

/* The small uppercase mono label the site uses for eyebrows. */
export function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 mt-7 font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-blue first:mt-0">
      {children}
    </div>
  );
}
