'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Check, Clock, Lock } from 'lucide-react';
import Reveal from '@/components/Reveal/Reveal';
import { GroupLabel } from '@/components/debt-schedule/fields';
import type { TurnstileHandle } from '@/components/debt-schedule/Turnstile';
import { STORAGE_KEY } from '@/lib/funding-application/constants';
import {
  BUSINESS_FIELDS,
  FIELD_BY_KEY,
  FINANCIAL_FIELDS,
  OWNER1_FIELDS,
  SCORE_GROUP_START,
  SENSITIVE,
  parseApplication,
  validateField,
  validateFields
} from '@/lib/funding-application/fields';
import type { Errors, FieldDef, Values } from '@/lib/funding-application/fields';
import FieldInput from './FieldInput';
import ReviewStep from './ReviewStep';
import SigningView from './SigningView';

/*
 * The orchestrator: four steps of fields, a review step, then signing.
 * Every field, label and rule comes from lib/funding-application/fields.ts.
 *
 * AUTOSAVE: everything except SSNs and dates of birth is written to
 * localStorage on every change and restored on load, so a reload or a trip to
 * find a number loses nothing. The sensitive fields are deliberately never
 * stored - on a shared computer they'd outlive the visit - so a restored
 * draft asks for them again. The key is cleared once the server accepts the
 * application.
 *
 * SUBMIT posts to /api/funding-application with a Turnstile token and gets
 * back an embedded SignWell signing URL; SigningView takes it from there.
 */

type Step = { title: string; short: string; intro: string; fields: FieldDef[] };

const STEPS: Step[] = [
  {
    title: 'Your business',
    short: 'Business',
    intro: 'The business applying for funding, exactly as it’s registered.',
    fields: BUSINESS_FIELDS
  },
  {
    title: 'Financials & request',
    short: 'Financials',
    intro: 'Round numbers are fine here. Your advisor will confirm the details with you.',
    fields: FINANCIAL_FIELDS
  },
  {
    title: 'About you',
    short: 'You',
    intro: 'You’re listed as Owner / Officer 1 and you’ll be the one signing the application.',
    fields: OWNER1_FIELDS
  }
];
const REVIEW = STEPS.length;

type View = 'form' | 'signing';

export default function FundingApplicationForm() {
  const [values, setValues] = useState<Values>({});
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});

  const [hydrated, setHydrated] = useState(false);
  const [restored, setRestored] = useState(false);
  const [view, setView] = useState<View>('form');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle | null>(null);
  const [signing, setSigning] = useState<{ url: string; email: string } | null>(null);

  const topRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const [moved, setMoved] = useState(false);

  /* Restore after mount - localStorage doesn't exist during SSR. */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { values?: unknown; step?: unknown };
        const clean: Values = {};
        if (saved.values && typeof saved.values === 'object') {
          for (const [k, v] of Object.entries(saved.values)) {
            const f = FIELD_BY_KEY.get(k);
            if (f && !SENSITIVE.has(f.kind) && typeof v === 'string') clean[k] = v;
          }
        }
        setValues(clean);
        if (typeof saved.step === 'number' && saved.step >= 0 && saved.step <= REVIEW) {
          /* Never land on review with the SSNs missing. */
          setStep(Math.min(saved.step, REVIEW - 1));
        }
        setRestored(Object.values(clean).some((v) => v.trim()));
      }
    } catch {
      /* Corrupt or blocked storage: start blank. */
    }
    setHydrated(true);
  }, []);

  /* Autosave, minus the sensitive fields, only after the restore has run. */
  useEffect(() => {
    if (!hydrated || view !== 'form') return;
    const safe: Values = {};
    for (const [k, v] of Object.entries(values)) {
      const f = FIELD_BY_KEY.get(k);
      if (f && !SENSITIVE.has(f.kind) && v) safe[k] = v;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ values: safe, step }));
    } catch {
      /* Private mode / quota: the form still works, it just won't persist. */
    }
  }, [hydrated, view, values, step]);

  /* After a step change: back to the top, focus on the new heading. */
  useEffect(() => {
    if (!moved) return;
    topRef.current?.scrollIntoView({ block: 'start' });
    headingRef.current?.focus({ preventScroll: true });
    setMoved(false);
  }, [moved, step, view]);

  const app = { values };

  function stepFields(i: number) {
    return STEPS[i].fields;
  }

  function setValue(key: string, v: string) {
    setValues((vals) => ({ ...vals, [key]: v }));
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  }

  function blurField(f: FieldDef, v: string) {
    const e = validateField(f, v);
    setErrors((errs) => {
      const next = { ...errs };
      if (e) next[f.key] = e;
      else delete next[f.key];
      return next;
    });
  }

  function goTo(i: number) {
    setStep(i);
    setSubmitError(undefined);
    setMoved(true);
  }

  /* Validate the current step; on failure focus the first bad field. */
  function next() {
    const fields = stepFields(step);
    const errs = validateFields(fields, app);
    setErrors(errs);
    const first = fields.find((f) => errs[f.key]);
    if (first) {
      document.getElementById(first.key)?.focus();
      return;
    }
    goTo(step + 1);
  }

  async function submit() {
    /* Re-check every step: a restored draft can reach review only by walking
       the steps, but this is the last line before the server anyway. */
    for (let i = 0; i < REVIEW; i++) {
      const errs = validateFields(stepFields(i), app);
      if (Object.keys(errs).length) {
        setErrors(errs);
        goTo(i);
        return;
      }
    }
    const parsed = parseApplication(app);
    if (!parsed.ok) return;
    if (!turnstileToken) {
      setSubmitError('Please wait for the security check above to finish, then try again.');
      return;
    }

    setSubmitting(true);
    setSubmitError(undefined);
    try {
      const res = await fetch('/api/funding-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application: parsed.app, turnstileToken })
      });
      const json = (await res.json().catch(() => ({}))) as { signingUrl?: string; message?: string };
      if (!res.ok || !json.signingUrl) {
        setSubmitError(`${json.message ?? 'Something went wrong on our end.'} Please try again, or call us at 251-210-8445.`);
        return;
      }
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* no-op */
      }
      setSigning({ url: json.signingUrl, email: parsed.app.values.owner1_email });
      /* Drop the answers from memory: SignWell has them now. */
      setValues({});
      setView('signing');
      setMoved(true);
    } catch {
      setSubmitError('We couldn’t reach our server. Check your connection and try again.');
    } finally {
      /* Turnstile tokens are single-use, whatever happened. */
      turnstileRef.current?.reset();
      setSubmitting(false);
    }
  }

  if (view === 'signing' && signing) {
    return (
      <div ref={topRef} className="scroll-mt-28">
        <SigningView signingUrl={signing.url} email={signing.email} />
      </div>
    );
  }

  const reviewSections = STEPS.map((s, i) => ({ step: i, title: s.title, fields: stepFields(i) }));
  const title = step === REVIEW ? 'Review your application' : STEPS[step].title;
  const intro =
    step === REVIEW
      ? 'Check everything reads correctly. You can jump back to fix any section.'
      : STEPS[step].intro;

  return (
    <div ref={topRef} className="scroll-mt-28">
      {restored && (
        <div
          role="status"
          className="mb-6 flex items-start justify-between gap-4 rounded-[12px] bg-ivory px-5 py-3 text-[14.5px] text-navy-deep ring-1 ring-blue-soft/40"
        >
          <span>
            We restored your progress from last time. For your security, SSNs and dates of birth are never
            saved on this device, so you&rsquo;ll need to enter those again.
          </span>
          <button
            type="button"
            onClick={() => setRestored(false)}
            className="shrink-0 rounded-none! bg-transparent p-0! text-[14px]! font-semibold text-blue hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* A div, not <nav>: home.css styles every bare nav as the site header. */}
      <div role="group" aria-label="Application progress" className="mb-8">
        <ol className="m-0! flex list-none gap-1.5 p-0!">
          {[...STEPS.map((s) => s.short), 'Review'].map((label, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <li key={label} className="min-w-0 flex-1" aria-current={current ? 'step' : undefined}>
                <div className={`h-1.5 rounded-full ${done || current ? 'bg-blue' : 'bg-line'}`} />
                <div
                  className={`mt-2 hidden items-center gap-1 truncate font-mono text-[11px] uppercase tracking-[0.1em] sm:flex ${
                    current ? 'text-blue' : 'text-slate'
                  }`}
                >
                  {done && <Check className="size-3 shrink-0" strokeWidth={3} />}
                  {label}
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-2 font-mono text-[11.5px] uppercase tracking-[0.1em] text-slate sm:hidden">
          Step {step + 1} of {REVIEW + 1}
        </p>
      </div>

      <div className="mb-6">
        <h2 ref={headingRef} tabIndex={-1} className="font-heading text-[clamp(24px,3vw,32px)] text-ink outline-none">
          {title}
        </h2>
        <p className="mt-2 text-[16px] text-slate">{intro}</p>
      </div>

      {step === REVIEW ? (
        <ReviewStep
          sections={reviewSections}
          values={values}
          submitting={submitting}
          submitError={submitError}
          turnstileRef={turnstileRef}
          onTurnstileToken={setTurnstileToken}
          onEdit={goTo}
          onSubmit={submit}
        />
      ) : (
        <Reveal key={step} className="reveal">
          <div className="rounded-[16px] bg-white p-6 shadow-soft ring-1 ring-line sm:p-7">
            {stepFields(step).length > 0 && (
              <div className="grid grid-cols-6 gap-4">
                {stepFields(step).map((f) => (
                  <FieldGroup key={f.key} field={f}>
                    <FieldInput
                      field={f}
                      value={values[f.key] ?? ''}
                      error={errors[f.key]}
                      onChange={(v) => setValue(f.key, v)}
                      onBlur={(v) => blurField(f, v)}
                    />
                  </FieldGroup>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      )}

      <div className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        {step > 0 ? (
          <button type="button" className="btn btn-dark-ghost justify-center" onClick={() => goTo(step - 1)}>
            Back
          </button>
        ) : (
          <span />
        )}
        {step < REVIEW && (
          <button type="button" className="btn btn-primary justify-center" onClick={next}>
            {step === REVIEW - 1 ? 'Review application' : 'Continue'}
          </button>
        )}
      </div>
    </div>
  );
}

/* The credit-score row gets its own heading, since the PDF groups them. */
function FieldGroup({ field, children }: { field: FieldDef; children: ReactNode }) {
  if (!SCORE_GROUP_START.has(field.key)) return <>{children}</>;
  return (
    <>
      <div className="col-span-6 mt-2">
        <GroupLabel>Credit scores — optional</GroupLabel>
        <p className="-mt-1 text-[13.5px] text-slate">If you know them. Leave blank if you don&rsquo;t.</p>
      </div>
      {children}
    </>
  );
}

/* The hero's chips. */
export function HeroChips() {
  const chip =
    'inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[13.5px] text-white/85 ring-1 ring-white/15';
  return (
    <div className="flex flex-wrap gap-2.5">
      <span className={chip}>
        <Clock className="size-4" />
        About 10 minutes
      </span>
      <span className={chip}>
        <Lock className="size-4" />
        Sent securely for e-signature
      </span>
    </div>
  );
}
