'use client';

import type { MutableRefObject } from 'react';
import Reveal from '@/components/Reveal/Reveal';
import Turnstile from '@/components/debt-schedule/Turnstile';
import type { TurnstileHandle } from '@/components/debt-schedule/Turnstile';
import { AUTHORIZATION_TEXT } from '@/lib/funding-application/authorization';
import { displayValue } from '@/lib/funding-application/fields';
import type { FieldDef, Values } from '@/lib/funding-application/fields';

export type ReviewSection = { step: number; title: string; fields: FieldDef[] };

type Props = {
  sections: ReviewSection[];
  values: Values;
  submitting: boolean;
  submitError?: string;
  turnstileRef: MutableRefObject<TurnstileHandle | null>;
  onTurnstileToken: (token: string | null) => void;
  onEdit: (step: number) => void;
  onSubmit: () => void;
};

const panel = 'rounded-[16px] bg-white px-5 py-2 shadow-soft ring-1 ring-line sm:px-6';

/* Every property home.css's bare `button` rule sets is overridden with `!`. */
const textButton =
  'rounded-none! bg-transparent p-0! font-sans text-[14px]! font-semibold text-blue underline-offset-4 hover:underline';

/* Read-only summary, then the authorization text, then submit. SSNs and dates
   of birth are masked here; the applicant sees them in full in SignWell. */
export default function ReviewStep(p: Props) {
  return (
    <div>
      {p.sections.map((s, i) => (
        <Reveal key={s.step} className="reveal mb-8" style={{ transitionDelay: `${Math.min(i, 3) * 0.05}s` }}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-heading text-[19px] text-ink">{s.title}</h3>
            <button type="button" className={textButton} aria-label={`Edit ${s.title}`} onClick={() => p.onEdit(s.step)}>
              Edit
            </button>
          </div>
          <div className={panel}>
            {s.fields.map((f) => (
              <div
                key={f.key}
                className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 text-[14.5px] last:border-b-0"
              >
                <span className="text-slate">{f.label}</span>
                <span className="text-right font-medium break-words text-ink">{displayValue(f, p.values[f.key] ?? '')}</span>
              </div>
            ))}
          </div>
        </Reveal>
      ))}

      <Reveal className="reveal mb-8">
        <h3 className="mb-3! font-heading text-[19px] text-ink">Authorization</h3>
        <div className="max-h-[240px] overflow-y-auto rounded-[16px] bg-cream p-5 text-[13.5px] leading-relaxed text-ink ring-1 ring-line sm:p-6" tabIndex={0}>
          {AUTHORIZATION_TEXT}
        </div>
        <p className="mt-3 text-[14px] text-slate">
          You&rsquo;ll review the completed application and sign this authorization in SignWell on the next screen.
        </p>
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
          {p.submitting ? 'Preparing your application…' : 'Continue to sign'}
        </button>
        <p className="max-w-[480px] text-center text-[13px] leading-relaxed text-slate">
          Your information is sent securely to SignWell, our e-signature provider, and shared with your KIBA
          advisor. See our{' '}
          <a href="/privacy-policy" className="text-blue underline underline-offset-2">
            privacy policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
