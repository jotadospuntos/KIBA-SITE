'use client';

/*
 * The DSCR calculator: two slides in one card.
 *   1. EBITDA from the latest tax return.
 *   2. Monthly debt payments by type -> annual debt service -> DSCR.
 * The math lives in lib/dscr/calc.ts; this file is only inputs and display.
 *
 * BUILT TO BE EMBEDDED. Everything visual is Tailwind on the KIBA @theme tokens
 * and the card carries its own background, so it drops into any route here and,
 * later, into the bare /embed route. It doesn't depend on home.css. It does
 * have to SURVIVE home.css, though, since every site route loads it: home.css is
 * unlayered, so its bare `button{ padding; border-radius; font-size }` and
 * `h1,h2,h3{ margin:0 }` beat Tailwind. Every <button> and heading here
 * therefore sets those with `!` (the same fix as components/debt-schedule).
 *
 * NOTHING LEAVES THE BROWSER. No API call in this prototype; inputs are only
 * autosaved to localStorage so the "build your debt schedule first" detour
 * doesn't lose slide 1. When the opt-in is added, revisit the hero copy that
 * says so.
 *
 * NO LENDER THRESHOLDS in the result. "Lenders look for 1.25+" and the like
 * are lending claims, and the business hasn't supplied any. The result copy
 * only states the arithmetic. Add bands when the human provides them.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Popover } from '@base-ui/react/popover';
import {
  ArrowLeft,
  ArrowRight,
  CircleHelp,
  ExternalLink,
  FileText,
  Lightbulb,
  MessagesSquare,
  Plus,
  RotateCcw,
  X
} from 'lucide-react';
import {
  DEBT_SERVICE_FACTOR,
  MCA_MULTIPLIER,
  adjustedDebtService,
  annualDebtService,
  dscr,
  ebitda,
  mcaMonthly,
  parseAmount,
  totalMonthlyPayments,
  type McaFrequency
} from '@/lib/dscr/calc';

const STORAGE_KEY = 'kiba-dscr-calculator';
const MAX_OTHER = 5;

type OtherRow = { id: number; name: string; monthly: string };

type FormState = {
  revenue: string;
  netIncome: string;
  interest: string;
  depreciation: string;
  eidl: string;
  sba: string;
  equipment: string;
  lineOfCredit: string;
  mca: string;
  mcaFrequency: McaFrequency;
  other: OtherRow[];
};

type AmountKey = Exclude<keyof FormState, 'mcaFrequency' | 'other'>;

const EMPTY: FormState = {
  revenue: '',
  netIncome: '',
  interest: '',
  depreciation: '',
  eidl: '',
  sba: '',
  equipment: '',
  lineOfCredit: '',
  mca: '',
  mcaFrequency: 'daily',
  other: [{ id: 1, name: '', monthly: '' }]
};

/* ---------- parsing + validation ---------- */

/* Blank counts as 0 everywhere except net income, which has to be entered. */
function amountError(raw: string, opts: { required?: boolean; allowNegative?: boolean } = {}) {
  const n = parseAmount(raw);
  if (n === null) return opts.required ? 'Enter your net income. Use a minus sign for a loss.' : undefined;
  if (Number.isNaN(n)) return 'Enter a dollar amount.';
  if (n < 0 && !opts.allowNegative) return 'Enter a positive amount.';
  return undefined;
}

function amount(raw: string): number {
  const n = parseAmount(raw);
  return n === null || Number.isNaN(n) ? 0 : n;
}

function money(n: number, cents = false): string {
  const abs = Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0
  });
  return (n < 0 ? '-$' : '$') + abs;
}

/* What an amount input shows after blur. Mid-keystroke reformatting fights the
   cursor, so this only runs on blur. Unparseable text is left alone so the
   error can point at it. */
function formatOnBlur(raw: string): string {
  const n = parseAmount(raw);
  if (n === null || Number.isNaN(n)) return raw;
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/* ---------- small pieces ---------- */

const inputClass =
  'h-12 w-full rounded-[12px] bg-white pl-8 pr-4 font-body text-[16px] text-ink tabular-nums ring-1 ring-line outline-none transition-shadow ' +
  'placeholder:text-slate-light focus:ring-2 focus:ring-blue-soft aria-invalid:ring-2 aria-invalid:ring-destructive';

function MoneyField({
  id,
  label,
  hint,
  value,
  error,
  onChange,
  onBlur,
  hideLabel = false,
  children
}: {
  id: string;
  label: ReactNode;
  /* For inputs whose visible label is a legend or sits beside them. */
  hideLabel?: boolean;
  hint?: ReactNode;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  children?: ReactNode;
}) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'mb-1 block font-sans text-[14px] font-semibold text-ink'}>
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mb-2 font-mono text-[11.5px] leading-snug tracking-[0.02em] text-slate">
          {hint}
        </p>
      )}
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-body text-[15px] text-slate"
        >
          $
        </span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          className={inputClass}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
      </div>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] leading-snug text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function SlideHeading({ children, headingRef }: { children: ReactNode; headingRef: React.Ref<HTMLHeadingElement> }) {
  return (
    <h2
      ref={headingRef}
      tabIndex={-1}
      className="mb-2! font-heading text-[clamp(22px,2.4vw,26px)] leading-tight text-ink outline-none"
    >
      {children}
    </h2>
  );
}

/* The "Need help?" menu on slide 2. Opens on hover for mouse users and on
   click/tap/Enter for everyone else - hover alone would lock out touch and
   keyboard, which is most of the people who'd need it. */
function NeedHelp({ debtScheduleHref, advisorHref }: { debtScheduleHref: string; advisorHref: string }) {
  const item = 'flex gap-3 rounded-[12px] p-3';
  const icon = 'mt-0.5 size-[18px] shrink-0 text-blue';
  return (
    <Popover.Root>
      <Popover.Trigger
        openOnHover
        delay={80}
        closeDelay={180}
        className="gap-1.5! rounded-full! bg-ivory px-3! py-1.5! font-sans text-[13.5px]! font-semibold text-blue ring-1 ring-blue/15 hover:bg-blue/10 data-[popup-open]:bg-blue/10"
      >
        <CircleHelp className="size-4" aria-hidden="true" />
        Need help?
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={8} collisionPadding={12} className="z-[60]">
          <Popover.Popup className="w-[min(360px,calc(100vw-24px))] rounded-[16px] bg-white p-2 text-left shadow-soft ring-1 ring-line outline-none origin-[var(--transform-origin)] transition-[opacity,transform] duration-150 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0">
            <Popover.Title className="mb-0! px-3 pb-1 pt-2 font-heading text-[16px] text-ink">
              Not sure of your payments?
            </Popover.Title>

            <div className={item}>
              <Lightbulb className={icon} aria-hidden="true" />
              <div>
                <div className="font-sans text-[14px] font-semibold text-ink">Check your statements</div>
                <p className="mt-0.5 text-[13.5px] leading-snug text-slate">
                  Each loan&rsquo;s payment is on its monthly statement, or look for the recurring debit on
                  your business bank statement. For an MCA, use the daily or weekly debit.
                </p>
              </div>
            </div>

            <a
              href={debtScheduleHref}
              target="_blank"
              rel="noopener"
              className={`${item} no-underline transition-colors hover:bg-ivory focus-visible:bg-ivory`}
            >
              <FileText className={icon} aria-hidden="true" />
              <div>
                <div className="flex items-center gap-1.5 font-sans text-[14px] font-semibold text-ink">
                  Build your debt schedule first
                  <ExternalLink className="size-3.5 text-slate" aria-label="(opens in a new tab)" />
                </div>
                <p className="mt-0.5 text-[13.5px] leading-snug text-slate">
                  List each loan in our online debt schedule, then come back. What you&rsquo;ve entered
                  here stays saved.
                </p>
              </div>
            </a>

            <a
              href={advisorHref}
              className={`${item} no-underline transition-colors hover:bg-ivory focus-visible:bg-ivory`}
            >
              <MessagesSquare className={icon} aria-hidden="true" />
              <div>
                <div className="font-sans text-[14px] font-semibold text-ink">Have an advisor help</div>
                <p className="mt-0.5 text-[13.5px] leading-snug text-slate">
                  Book a call and a KIBA advisor will work through your numbers with you.
                </p>
              </div>
            </a>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

/* ---------- the calculator ---------- */

export default function DscrCalculator({
  forceMotion = false,
  taxYear = 2025,
  debtScheduleHref = '/debt-schedule',
  advisorHref = '/book-rr'
}: {
  forceMotion?: boolean;
  /* The latest tax year people are expected to have filed. A prop rather than
     "this year minus one", because in Jan-Apr most haven't filed that yet. */
  taxYear?: number;
  debtScheduleHref?: string;
  advisorHref?: string;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const nextOtherId = useRef(2);
  const cardRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  const prefersReduced = useReducedMotion();
  const animate = !prefersReduced || forceMotion;

  /* Restore after mount (localStorage doesn't exist during SSR). */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { step?: 1 | 2; form?: Partial<FormState> };
        if (saved.form) {
          const other = saved.form.other?.length ? saved.form.other : EMPTY.other;
          nextOtherId.current = Math.max(...other.map((o) => o.id)) + 1;
          setForm({ ...EMPTY, ...saved.form, other });
        }
        if (saved.step === 2) setStep(2);
      }
    } catch {
      /* corrupt or blocked storage: start empty */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, form }));
    } catch {
      /* storage full or blocked: the calculator still works, it just won't persist */
    }
  }, [hydrated, step, form]);

  const set = (key: AmountKey) => (v: string) => setForm((f) => ({ ...f, [key]: v }));
  const touch = (key: string) => () => setTouched((t) => new Set(t).add(key));
  const blurFormat = (key: AmountKey) => () => {
    setForm((f) => ({ ...f, [key]: formatOnBlur(f[key]) }));
    touch(key)();
  };

  /* ----- slide 1 ----- */
  const errors1 = {
    revenue: amountError(form.revenue),
    netIncome: amountError(form.netIncome, { required: true, allowNegative: true }),
    interest: amountError(form.interest),
    depreciation: amountError(form.depreciation)
  };
  const slide1Valid = !Object.values(errors1).some(Boolean);
  const ebitdaValue = ebitda({
    netIncome: amount(form.netIncome),
    interest: amount(form.interest),
    depreciation: amount(form.depreciation)
  });

  /* ----- slide 2 ----- */
  const errors2: Record<string, string | undefined> = {
    eidl: amountError(form.eidl),
    sba: amountError(form.sba),
    equipment: amountError(form.equipment),
    lineOfCredit: amountError(form.lineOfCredit),
    mca: amountError(form.mca)
  };
  form.other.forEach((o) => (errors2[`other-${o.id}`] = amountError(o.monthly)));
  const slide2Valid = !Object.values(errors2).some(Boolean);

  const debts = useMemo(
    () => ({
      eidl: amount(form.eidl),
      sba: amount(form.sba),
      equipment: amount(form.equipment),
      lineOfCredit: amount(form.lineOfCredit),
      mca: amount(form.mca),
      mcaFrequency: form.mcaFrequency,
      other: form.other.map((o) => ({ name: o.name, monthly: amount(o.monthly) }))
    }),
    [form]
  );
  const monthlyTotal = totalMonthlyPayments(debts);
  const annualDS = annualDebtService(debts);
  const adjustedDS = adjustedDebtService(debts);
  const dscrValue = dscr(ebitdaValue, adjustedDS);
  const mcaPerMonth = mcaMonthly(debts.mca, debts.mcaFrequency);

  const shown = (key: string, error?: string) => (touched.has(key) ? error : undefined);

  function goTo(next: 1 | 2) {
    if (next === 2 && !slide1Valid) {
      setTouched((t) => new Set([...t, 'revenue', 'netIncome', 'interest', 'depreciation']));
      const firstBad = (Object.keys(errors1) as (keyof typeof errors1)[]).find((k) => errors1[k]);
      if (firstBad) document.getElementById(`dscr-${firstBad}`)?.focus();
      return;
    }
    moved.current = true;
    setStep(next);
  }

  /* Runs as each slide's heading MOUNTS (a callback ref, because with
     AnimatePresence mode="wait" the new slide only mounts after the old one has
     finished leaving). Focus the heading so screen readers announce it and
     keyboard users start at the top, and bring the card's top back into view on
     phones, where Next sits a long way below it. Skipped on first load. */
  function onHeadingMount(el: HTMLHeadingElement | null) {
    if (!el || !moved.current) return;
    el.focus({ preventScroll: true });
    const top = cardRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) cardRef.current?.scrollIntoView({ behavior: animate ? 'smooth' : 'auto', block: 'start' });
  }

  function startOver() {
    setForm(EMPTY);
    nextOtherId.current = 2;
    setTouched(new Set());
    moved.current = true;
    setStep(1);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing to clear */
    }
  }

  function setOther(id: number, patch: Partial<OtherRow>) {
    setForm((f) => ({ ...f, other: f.other.map((o) => (o.id === id ? { ...o, ...patch } : o)) }));
  }
  function addOther() {
    setForm((f) => ({ ...f, other: [...f.other, { id: nextOtherId.current++, name: '', monthly: '' }] }));
  }
  function removeOther(id: number) {
    setForm((f) => {
      const other = f.other.filter((o) => o.id !== id);
      return { ...f, other: other.length ? other : [{ id: nextOtherId.current++, name: '', monthly: '' }] };
    });
  }

  const slideMotion = {
    initial: animate ? { opacity: 0, x: 24 } : { opacity: 1, x: 0 },
    animate: { opacity: 1, x: 0 },
    exit: animate ? { opacity: 0, x: -24 } : { opacity: 1, x: 0 },
    transition: animate ? { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const } : { duration: 0 }
  };

  const primaryBtn =
    'inline-flex items-center justify-center gap-2! rounded-full! bg-blue px-6! py-3! font-sans text-[15px]! font-semibold text-white ' +
    'shadow-[0_12px_24px_-10px_rgba(37,99,235,0.55)] transition-colors hover:bg-navy-soft no-underline';
  const quietBtn =
    'inline-flex items-center gap-1.5! rounded-full! bg-transparent px-3! py-2! font-sans text-[14px]! font-semibold text-slate hover:text-ink';

  return (
    <div
      ref={cardRef}
      className="scroll-mt-28 rounded-[20px] bg-white p-5 text-left text-ink shadow-soft ring-1 ring-line sm:p-8"
    >
      {/* Header + progress */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="whitespace-nowrap font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-blue">DSCR Calculator</div>
        <ol className="m-0 flex list-none items-center gap-2 p-0" aria-label="Progress">
          {[
            { n: 1, label: 'EBITDA' },
            { n: 2, label: 'DSCR' }
          ].map(({ n, label }) => (
            <li
              key={n}
              aria-current={step === n ? 'step' : undefined}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-[12.5px] font-semibold transition-colors ${
                step === n ? 'bg-blue text-white' : step > n ? 'bg-blue/10 text-blue' : 'bg-paper text-slate'
              }`}
            >
              <span className="tabular-nums">{n}</span>
              {label}
            </li>
          ))}
        </ol>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {step === 1 ? (
          <motion.div key="s1" {...slideMotion}>
            <SlideHeading headingRef={onHeadingMount}>Start with your tax return</SlideHeading>
            <p className="mb-6 text-[15px] leading-relaxed text-slate">
              Use your {taxYear} business tax return. Line numbers are for Form 1120-S (S corporation) and
              Schedule C (sole proprietor).
            </p>

            <div className="grid gap-5">
              <MoneyField
                id="dscr-revenue"
                label={`${taxYear} Gross revenue`}
                hint="1120-S Line 1a · Schedule C Line 1 · for reference, not part of EBITDA"
                value={form.revenue}
                error={shown('revenue', errors1.revenue)}
                onChange={set('revenue')}
                onBlur={blurFormat('revenue')}
              />
              <MoneyField
                id="dscr-netIncome"
                label={`${taxYear} Net income`}
                hint="1120-S Line 21 · Schedule C Line 31 · a loss is a negative number"
                value={form.netIncome}
                error={shown('netIncome', errors1.netIncome)}
                onChange={set('netIncome')}
                onBlur={blurFormat('netIncome')}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <MoneyField
                  id="dscr-interest"
                  label="Interest expense"
                  hint="1120-S Line 13 · Sch. C Lines 16a + 16b"
                  value={form.interest}
                  error={shown('interest', errors1.interest)}
                  onChange={set('interest')}
                  onBlur={blurFormat('interest')}
                />
                <MoneyField
                  id="dscr-depreciation"
                  label="Depreciation"
                  hint="1120-S Line 14 · Sch. C Line 13"
                  value={form.depreciation}
                  error={shown('depreciation', errors1.depreciation)}
                  onChange={set('depreciation')}
                  onBlur={blurFormat('depreciation')}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 rounded-[14px] bg-navy-deep px-5 py-4 text-white" aria-live="polite">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-blue-soft">Your EBITDA</div>
                <div className="text-[12.5px] text-white/60">Net income + interest + depreciation</div>
              </div>
              <div className="font-heading text-[24px] font-semibold tabular-nums">{money(ebitdaValue)}</div>
            </div>

            <div className="mt-6 flex justify-end">
              <button type="button" className={primaryBtn} onClick={() => goTo(2)}>
                Next: debt payments
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="s2" {...slideMotion}>
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <SlideHeading headingRef={onHeadingMount}>Your monthly debt payments</SlideHeading>
              <NeedHelp debtScheduleHref={debtScheduleHref} advisorHref={advisorHref} />
            </div>
            <p className="mb-6 text-[15px] leading-relaxed text-slate">
              Enter the total monthly payment for all loans of each type. Leave blank any you don&rsquo;t have.
            </p>

            <div className="grid gap-5 sm:grid-cols-2">
              <MoneyField id="dscr-eidl" label="EIDL loan" value={form.eidl} error={shown('eidl', errors2.eidl)} onChange={set('eidl')} onBlur={blurFormat('eidl')} />
              <MoneyField id="dscr-sba" label="SBA loans" value={form.sba} error={shown('sba', errors2.sba)} onChange={set('sba')} onBlur={blurFormat('sba')} />
              <MoneyField id="dscr-equipment" label="Equipment loans" value={form.equipment} error={shown('equipment', errors2.equipment)} onChange={set('equipment')} onBlur={blurFormat('equipment')} />
              <MoneyField id="dscr-lineOfCredit" label="Line of credit" value={form.lineOfCredit} error={shown('lineOfCredit', errors2.lineOfCredit)} onChange={set('lineOfCredit')} onBlur={blurFormat('lineOfCredit')} />
            </div>

            {/* MCA: entered as debited, converted to monthly (daily x 22, weekly x 4). */}
            <fieldset className="mt-5 min-w-0 border-0 p-0">
              <legend className="mb-1 font-sans text-[14px] font-semibold text-ink">MCA loans</legend>
              <p className="mb-2 font-mono text-[11.5px] leading-snug tracking-[0.02em] text-slate">
                The total debit for all MCAs, as it comes out of your account
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="sm:flex-1">
                  <MoneyField
                    id="dscr-mca"
                    label="MCA payment amount"
                    hideLabel
                    value={form.mca}
                    error={shown('mca', errors2.mca)}
                    onChange={set('mca')}
                    onBlur={blurFormat('mca')}
                  />
                </div>
                <div role="radiogroup" aria-label="MCA payment frequency" className="flex h-12 shrink-0 rounded-full bg-paper p-1 ring-1 ring-line">
                  {(['daily', 'weekly'] as const).map((freq) => (
                    <label
                      key={freq}
                      className={`flex cursor-pointer items-center rounded-full px-4 font-sans text-[14px] font-semibold capitalize transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue-soft ${
                        form.mcaFrequency === freq ? 'bg-white text-blue shadow-sm ring-1 ring-line' : 'text-slate'
                      }`}
                    >
                      <input
                        type="radio"
                        name="dscr-mca-frequency"
                        value={freq}
                        className="sr-only"
                        checked={form.mcaFrequency === freq}
                        onChange={() => setForm((f) => ({ ...f, mcaFrequency: freq }))}
                      />
                      {freq}
                    </label>
                  ))}
                </div>
              </div>
              {debts.mca > 0 && !errors2.mca && (
                <p className="mt-1.5 text-[13px] text-slate tabular-nums">
                  &asymp; {money(mcaPerMonth)} a month ({money(debts.mca)} &times; {MCA_MULTIPLIER[form.mcaFrequency]}{' '}
                  {form.mcaFrequency === 'daily' ? 'business days' : 'weeks'})
                </p>
              )}
            </fieldset>

            {/* Anything not listed above, each optionally named. */}
            <fieldset className="mt-5 min-w-0 border-0 p-0">
              <legend className="mb-1 font-sans text-[14px] font-semibold text-ink">Other business loans</legend>
              <p className="mb-2 font-mono text-[11.5px] leading-snug tracking-[0.02em] text-slate">
                Mortgages, bank loans, cards, anything not listed above
              </p>
              <div className="grid gap-3">
                {form.other.map((o, i) => {
                  const key = `other-${o.id}`;
                  const err = shown(key, errors2[key]);
                  const canRemove = form.other.length > 1 || o.name !== '' || o.monthly !== '';
                  return (
                    <div key={o.id} className="flex items-start gap-2">
                      <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_1fr]">
                        <div>
                          <label htmlFor={`dscr-other-name-${o.id}`} className="sr-only">
                            Other loan {i + 1} name (optional)
                          </label>
                          <input
                            id={`dscr-other-name-${o.id}`}
                            type="text"
                            maxLength={40}
                            autoComplete="off"
                            placeholder="Name (optional), e.g. Truck note"
                            className={inputClass.replace('pl-8', 'pl-4')}
                            value={o.name}
                            onChange={(e) => setOther(o.id, { name: e.target.value })}
                          />
                        </div>
                        <MoneyField
                          id={`dscr-${key}`}
                          label={`Other loan ${i + 1} monthly payment`}
                          hideLabel
                          value={o.monthly}
                          error={err}
                          onChange={(v) => setOther(o.id, { monthly: v })}
                          onBlur={() => {
                            setOther(o.id, { monthly: formatOnBlur(o.monthly) });
                            touch(key)();
                          }}
                        />
                      </div>
                      {canRemove && (
                        <button
                          type="button"
                          onClick={() => removeOther(o.id)}
                          aria-label={`Remove ${o.name || `other loan ${i + 1}`}`}
                          className="grid size-12 shrink-0 place-items-center rounded-full! bg-transparent p-0! text-slate hover:bg-paper hover:text-ink"
                        >
                          <X className="size-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {form.other.length < MAX_OTHER && (
                <button type="button" onClick={addOther} className={`${quietBtn} mt-2 px-0! text-blue! hover:text-navy-soft!`}>
                  <Plus className="size-4" aria-hidden="true" />
                  Add another loan
                </button>
              )}
            </fieldset>

            {/* Result */}
            <div className="mt-7 overflow-hidden rounded-[16px] bg-navy-deep text-white" aria-live="polite">
              <dl className="m-0 grid grid-cols-2 gap-px bg-white/10">
                {[
                  { label: 'EBITDA', value: money(ebitdaValue) },
                  { label: 'Monthly payments', value: money(monthlyTotal) },
                  { label: 'Annual debt service', value: money(annualDS) },
                  { label: `Debt service \u00d7 ${DEBT_SERVICE_FACTOR}`, value: money(adjustedDS) }
                ].map((s) => (
                  <div key={s.label} className="bg-navy-deep px-3 py-3 sm:px-4">
                    <dt className="font-mono text-[10.5px] uppercase leading-tight tracking-[0.1em] text-blue-soft">{s.label}</dt>
                    <dd className="m-0 mt-1 font-heading text-[15px] font-semibold tabular-nums sm:text-[17px]">{s.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="px-5 py-5 sm:px-6">
                <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-blue-soft">Your DSCR</div>
                {!slide2Valid ? (
                  <p className="mt-1 text-[15px] text-white/75">Fix the highlighted amounts to see your DSCR.</p>
                ) : dscrValue === null ? (
                  <p className="mt-1 text-[15px] text-white/75">Enter your monthly payments to see your DSCR.</p>
                ) : (
                  <>
                    <div className="mt-1 font-heading text-[44px] font-semibold leading-none tabular-nums">
                      {dscrValue.toFixed(2)}
                      <span className="text-[26px] text-blue-soft">x</span>
                    </div>
                    <p className="mt-3 text-[14.5px] leading-relaxed text-white/80">
                      {ebitdaValue <= 0
                        ? 'With EBITDA at or below zero, your earnings don’t cover your debt payments.'
                        : dscrValue >= 1
                          ? `With a 25% cushion on your annual debt payments, your earnings cover them ${dscrValue.toFixed(2)} times.`
                          : `With a 25% cushion on your annual debt payments, your earnings cover ${Math.round(dscrValue * 100)}% of them.`}{' '}
                      EBITDA &divide; (annual debt service &times; {DEBT_SERVICE_FACTOR}).
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                      <a href={advisorHref} className={primaryBtn}>
                        Start the Conversation
                      </a>
                      <span className="text-[13.5px] text-white/60">See what this means for your funding options.</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4">
              <button type="button" className={quietBtn} onClick={() => goTo(1)}>
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back
              </button>
              <button type="button" className={quietBtn} onClick={startOver}>
                <RotateCcw className="size-4" aria-hidden="true" />
                Start over
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
