'use client';

import type { MutableRefObject, ReactNode } from 'react';
import Reveal from '@/components/Reveal/Reveal';
import { formatDate, formatMoney, formatPercent } from '@/lib/debt-schedule/format';
import type { DebtEntry } from '@/lib/debt-schedule/schema';
import { debtTypeLabel } from './DebtCard';
import Turnstile from './Turnstile';
import type { TurnstileHandle } from './Turnstile';

type Props = {
  contactName: string;
  businessName: string;
  email: string;
  phone: string;
  asOfDate: string;
  hasNoDebt: boolean;
  debts: DebtEntry[];
  balance: number;
  payment: number;
  submitting: boolean;
  submitError?: string;
  turnstileRef: MutableRefObject<TurnstileHandle | null>;
  onTurnstileToken: (token: string | null) => void;
  onEditDetails: () => void;
  onEditDebt: (index: number) => void;
  onBack: () => void;
  onSubmit: () => void;
};

const panel = 'rounded-[16px] bg-white px-5 py-2 shadow-soft ring-1 ring-line sm:px-6';

function Row({ k, v, num }: { k: string; v: ReactNode; num?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 text-[14.5px] last:border-b-0">
      <span className="text-slate">{k}</span>
      <span className={`text-right font-medium text-ink ${num ? 'tabular-nums' : ''}`}>{v}</span>
    </div>
  );
}

/* A text-style button. Every property home.css's bare `button` rule sets is
   overridden here with `!`. */
const textButton =
  'rounded-none! bg-transparent p-0! font-sans text-[14px]! font-semibold text-blue underline-offset-4 hover:underline';

/* Read-only summary before submit, with a way back to every item. */
export default function ReviewStep(p: Props) {
  return (
    <div>
      <Reveal className="reveal mb-8">
        <div className="mb-2 font-mono text-[12.5px] font-medium uppercase tracking-[0.14em] text-blue">Almost done</div>
        <h2 className="font-heading text-[clamp(26px,3.2vw,34px)] text-ink">Review before sending</h2>
        <p className="mt-2 text-[16px] text-slate">
          Check everything reads correctly. You can jump back to fix any item.
        </p>
      </Reveal>

      <Reveal className="reveal mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-heading text-[19px] text-ink">Your details</h3>
          <button type="button" className={textButton} onClick={p.onEditDetails}>
            Edit
          </button>
        </div>
        <div className={panel}>
          <Row k="Name" v={p.contactName} />
          <Row k="Business" v={p.businessName} />
          <Row k="Email" v={p.email} />
          {p.phone.trim() && <Row k="Phone" v={p.phone} />}
          <Row k="Date" v={formatDate(p.asOfDate)} num />
        </div>
      </Reveal>

      <Reveal className="reveal mb-8" style={{ transitionDelay: '0.08s' }}>
        <h3 className="mb-3! font-heading text-[19px] text-ink">Debts</h3>
        {p.hasNoDebt ? (
          <div className={`${panel} py-5! text-center text-slate`}>Client indicated no business debt.</div>
        ) : (
          <div className="grid gap-4">
            {p.debts.map((d, i) => (
              <div key={i} className={panel}>
                <div className="flex items-center justify-between gap-4 border-b border-line py-3">
                  <h4 className="m-0 font-heading text-[16.5px] font-semibold text-ink">{d.lenderName}</h4>
                  <button
                    type="button"
                    className={textButton}
                    aria-label={`Edit ${d.lenderName}`}
                    onClick={() => p.onEditDebt(i)}
                  >
                    Edit
                  </button>
                </div>
                <Row k="Type" v={debtTypeLabel(d)} />
                <Row
                  k="Original / balance"
                  v={`${formatMoney(d.originalAmount)} / ${formatMoney(d.currentBalance)}`}
                  num
                />
                <Row k="Rate / payment" v={`${formatPercent(d.interestRate)} / ${formatMoney(d.monthlyPayment)}`} num />
                <Row
                  k="Open / maturity"
                  v={`${formatDate(d.openDate)} / ${d.noMaturity ? 'revolving' : formatDate(d.maturityDate)}`}
                  num
                />
                <Row
                  k="Status"
                  v={[d.securedStatus, d.paymentStatus, d.collateral].filter(Boolean).join(' · ')}
                />
              </div>
            ))}
          </div>
        )}
        <div className={`${panel} mt-4`}>
          <Row k="Total open balances" v={formatMoney(p.balance)} num />
          <Row k="Total monthly payments" v={formatMoney(p.payment)} num />
        </div>
      </Reveal>

      <div className="flex flex-col items-center gap-4">
        <Turnstile ref={p.turnstileRef} onToken={p.onTurnstileToken} />
        {p.submitError && (
          <p role="alert" className="max-w-[480px] text-center text-[14px] text-destructive">
            {p.submitError}
          </p>
        )}
        <button
          type="button"
          className="btn btn-primary w-full max-w-[420px] justify-center py-4! text-[16.5px]!"
          onClick={p.onSubmit}
          disabled={p.submitting}
          aria-busy={p.submitting}
        >
          {p.submitting ? 'Sending…' : 'Submit debt schedule'}
        </button>
        <p className="max-w-[480px] text-center text-[13px] leading-relaxed text-slate">
          We use this only to prepare your funding options. It&rsquo;s stored securely and shared only
          with your KIBA advisor. See our{' '}
          <a href="/privacy-policy" className="text-blue underline underline-offset-2">
            privacy policy
          </a>
          .
        </p>
        <button type="button" className={textButton} onClick={p.onBack}>
          Back to editing
        </button>
      </div>
    </div>
  );
}
