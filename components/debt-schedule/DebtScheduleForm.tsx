'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Clock } from 'lucide-react';
import Reveal from '@/components/Reveal/Reveal';
import { STORAGE_KEY } from '@/lib/debt-schedule/constants';
import { todayISO } from '@/lib/debt-schedule/format';
import { debtScheduleSchema, sanitizeStoredDebts } from '@/lib/debt-schedule/schema';
import type { DebtEntry } from '@/lib/debt-schedule/schema';
import DebtEntryDialog from './DebtEntryForm';
import DebtList from './DebtList';
import type { DebtItem } from './DebtList';
import ReviewStep from './ReviewStep';
import TotalsBar from './TotalsBar';
import { Field, describedBy, inputClass } from './fields';

/*
 * The orchestrator: client details, the debt list, live totals, the per-debt
 * dialog, the review step and the success view, plus localStorage autosave.
 *
 * AUTOSAVE: the whole form is written to localStorage on every change, under
 * one fixed key (this is a single public page - no per-client tokens), and
 * restored on load with a dismissible banner. People leave this form to go and
 * find a statement; losing their work is the main reason these don't come
 * back. The key is cleared on a successful submit.
 *
 * PHASE 1: submit validates with the shared schema and console.logs the
 * payload. The API route, the PDF and the download link arrive in phases 2-3.
 */

type View = 'form' | 'review' | 'success';
type HeaderErrors = Partial<Record<'contactName' | 'businessName', string>>;

let idCounter = 0;
const newId = () => `debt-${++idCounter}`;

export default function DebtScheduleForm({ forceMotion }: { forceMotion: boolean }) {
  const [contactName, setContactName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [asOfDate, setAsOfDate] = useState('');
  const [hasNoDebt, setHasNoDebt] = useState(false);
  const [items, setItems] = useState<DebtItem[]>([]);

  const [hydrated, setHydrated] = useState(false);
  const [restored, setRestored] = useState(false);
  const [view, setView] = useState<View>('form');
  const [headerErrors, setHeaderErrors] = useState<HeaderErrors>({});
  const [debtsError, setDebtsError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formKey, setFormKey] = useState(0);
  const returnFocus = useRef<HTMLElement | null>(null);

  const topRef = useRef<HTMLDivElement | null>(null);
  const [pendingFocus, setPendingFocus] = useState<string | null>(null);

  const debts = useMemo(() => items.map((i) => i.debt), [items]);
  const totals = useMemo(
    () =>
      debts.reduce(
        (t, d) => ({ balance: t.balance + d.currentBalance, payment: t.payment + d.monthlyPayment }),
        { balance: 0, payment: 0 }
      ),
    [debts]
  );

  /* Restore. Runs after mount because localStorage (and the visitor's own
     "today") don't exist during SSR. */
  useEffect(() => {
    let date = todayISO();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Record<string, unknown>;
        const name = typeof saved.contactName === 'string' ? saved.contactName : '';
        const business = typeof saved.businessName === 'string' ? saved.businessName : '';
        const restoredDebts = sanitizeStoredDebts(saved.debts);
        if (typeof saved.asOfDate === 'string' && saved.asOfDate) date = saved.asOfDate;
        setContactName(name);
        setBusinessName(business);
        setHasNoDebt(saved.hasNoDebt === true);
        setItems(restoredDebts.map((debt) => ({ id: newId(), debt })));
        setRestored(Boolean(name || business || restoredDebts.length));
      }
    } catch {
      /* Corrupt or blocked storage: start blank. */
    }
    setAsOfDate(date);
    setHydrated(true);
  }, []);

  /* Autosave every change, but only after the restore above has run - saving
     the empty initial state first would wipe the draft it's about to load. */
  useEffect(() => {
    if (!hydrated || view === 'success') return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ contactName, businessName, asOfDate, hasNoDebt, debts })
      );
    } catch {
      /* Private mode / quota: the form still works, it just won't persist. */
    }
  }, [hydrated, view, contactName, businessName, asOfDate, hasNoDebt, debts]);

  /* Focus that has to wait for a view switch to render. */
  useEffect(() => {
    if (!pendingFocus) return;
    document.getElementById(pendingFocus)?.focus();
    setPendingFocus(null);
  }, [pendingFocus, view]);

  function scrollToTop() {
    topRef.current?.scrollIntoView({ block: 'start' });
  }

  function openDialog(index: number | null, trigger: HTMLElement | null) {
    returnFocus.current = trigger;
    setEditingIndex(index);
    setFormKey((k) => k + 1);
    setDialogOpen(true);
  }

  function saveDebt(entry: DebtEntry, addAnother: boolean) {
    if (editingIndex !== null) {
      setItems((list) => list.map((item, i) => (i === editingIndex ? { ...item, debt: entry } : item)));
    } else {
      setItems((list) => [...list, { id: newId(), debt: entry }]);
    }
    setDebtsError(undefined);
    if (addAnother && editingIndex === null) setFormKey((k) => k + 1);
    else setDialogOpen(false);
  }

  function deleteDebt(index: number) {
    const d = items[index];
    if (window.confirm(`Remove ${d.debt.lenderName || 'this debt'}?`)) {
      setItems((list) => list.filter((_, i) => i !== index));
    }
  }

  function headerError(field: keyof HeaderErrors, value: string) {
    if (value.trim()) return undefined;
    return field === 'contactName' ? 'Please enter your name.' : 'Please enter your business name.';
  }

  function goReview() {
    const errs: HeaderErrors = {
      contactName: headerError('contactName', contactName),
      businessName: headerError('businessName', businessName)
    };
    setHeaderErrors(errs);
    const noDebts = !hasNoDebt && items.length === 0;
    setDebtsError(noDebts ? 'Add at least one debt, or tick the box if your business has none.' : undefined);

    if (errs.contactName || errs.businessName) {
      document.getElementById(errs.contactName ? 'contactName' : 'businessName')?.focus();
      return;
    }
    if (noDebts) {
      document.getElementById('debts-heading')?.scrollIntoView({ block: 'center' });
      return;
    }
    setView('review');
    scrollToTop();
  }

  function backToForm(focusId?: string) {
    setView('form');
    if (focusId) setPendingFocus(focusId);
    scrollToTop();
  }

  function submit() {
    const payload = {
      contactName,
      businessName,
      asOfDate,
      hasNoDebt,
      debts: hasNoDebt ? [] : debts
    };
    const result = debtScheduleSchema.safeParse(payload);
    if (!result.success) {
      /* Shouldn't be reachable - every debt was validated on save and the
         header on review - but never submit something the server will reject. */
      backToForm();
      return;
    }
    setSubmitting(true);
    // PHASE 1 STUB: replaced by POST /api/debt-schedule in phase 3.
    console.log('[debt-schedule] validated payload', result.data);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* no-op */
    }
    setSubmitting(false);
    setView('success');
    scrollToTop();
  }

  function startOver() {
    setContactName('');
    setBusinessName('');
    setAsOfDate(todayISO());
    setHasNoDebt(false);
    setItems([]);
    setHeaderErrors({});
    setDebtsError(undefined);
    setRestored(false);
    setView('form');
    scrollToTop();
  }

  return (
    <div ref={topRef} className="scroll-mt-28">
      {view === 'success' && (
        <div className="py-10 text-center" role="status">
          <div className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-blue text-white shadow-soft">
            <Check className="size-8" strokeWidth={2.4} />
          </div>
          <h2 className="font-heading text-[clamp(26px,3.2vw,34px)] text-ink">Debt schedule received</h2>
          <p className="mx-auto mt-3 max-w-[480px] text-[16px] text-slate">
            Thank you — we&rsquo;ve got everything we need, and your KIBA advisor will be in touch.
          </p>
          {/* The "Download your copy (PDF)" link lands here in phase 3. */}
          <button type="button" className="btn btn-dark-ghost mt-8!" onClick={startOver}>
            Start over
          </button>
        </div>
      )}

      {view === 'review' && (
        <ReviewStep
          contactName={contactName}
          businessName={businessName}
          asOfDate={asOfDate}
          hasNoDebt={hasNoDebt}
          debts={debts}
          balance={totals.balance}
          payment={totals.payment}
          submitting={submitting}
          onEditDetails={() => backToForm('contactName')}
          onEditDebt={(i) => {
            backToForm();
            openDialog(i, null);
          }}
          onBack={() => backToForm()}
          onSubmit={submit}
        />
      )}

      {view === 'form' && (
        <>
          {restored && (
            <div
              role="status"
              className="mb-6 flex items-center justify-between gap-4 rounded-[12px] bg-ivory px-5 py-3 text-[14.5px] text-navy-deep ring-1 ring-blue-soft/40"
            >
              <span>We restored your progress from last time.</span>
              <button
                type="button"
                onClick={() => setRestored(false)}
                className="rounded-none! bg-transparent p-0! text-[14px]! font-semibold text-blue hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <Reveal className="reveal mb-10 rounded-[16px] bg-cream p-6 ring-1 ring-line sm:p-7">
            <div className="mb-3 font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-blue">
              Before you start
            </div>
            <ul className="m-0! list-disc space-y-1.5 pl-5! text-[15px] leading-[1.6] text-ink marker:text-blue">
              <li>Only include debts that are in the business&rsquo;s name.</li>
              <li>Don&rsquo;t include personal debts, or debt taken out by an individual.</li>
              <li>Include all active EIDL or PPP loans.</li>
              <li>Include business credit cards — enter the amount you typically pay per month.</li>
            </ul>
          </Reveal>

          <Reveal className="reveal mb-10" style={{ transitionDelay: '0.06s' }}>
            <h2 className="mb-4! font-heading text-[clamp(22px,2.6vw,27px)] text-ink">Your details</h2>
            <div className="rounded-[16px] bg-white p-6 shadow-soft ring-1 ring-line sm:p-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="contactName" label="Your name" error={headerErrors.contactName}>
                  <input
                    id="contactName"
                    type="text"
                    autoComplete="name"
                    className={inputClass}
                    value={contactName}
                    aria-invalid={headerErrors.contactName ? true : undefined}
                    aria-describedby={describedBy('contactName', headerErrors.contactName)}
                    onChange={(e) => {
                      setContactName(e.target.value);
                      setHeaderErrors((h) => ({ ...h, contactName: undefined }));
                    }}
                    onBlur={(e) =>
                      setHeaderErrors((h) => ({ ...h, contactName: headerError('contactName', e.target.value) }))
                    }
                  />
                </Field>
                <Field id="businessName" label="Business name" error={headerErrors.businessName}>
                  <input
                    id="businessName"
                    type="text"
                    autoComplete="organization"
                    className={inputClass}
                    value={businessName}
                    aria-invalid={headerErrors.businessName ? true : undefined}
                    aria-describedby={describedBy('businessName', headerErrors.businessName)}
                    onChange={(e) => {
                      setBusinessName(e.target.value);
                      setHeaderErrors((h) => ({ ...h, businessName: undefined }));
                    }}
                    onBlur={(e) =>
                      setHeaderErrors((h) => ({ ...h, businessName: headerError('businessName', e.target.value) }))
                    }
                  />
                </Field>
              </div>
              <Field id="asOfDate" label="Date" className="mt-4 max-w-[260px]">
                <input
                  id="asOfDate"
                  type="date"
                  className={inputClass}
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value || todayISO())}
                />
              </Field>
            </div>
          </Reveal>

          <Reveal className="reveal" style={{ transitionDelay: '0.1s' }}>
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 id="debts-heading" className="font-heading text-[clamp(22px,2.6vw,27px)] text-ink">
                Your debts
              </h2>
              {items.length > 0 && !hasNoDebt && (
                <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-slate">
                  {items.length} added
                </span>
              )}
            </div>
            <DebtList
              items={items}
              hasNoDebt={hasNoDebt}
              forceMotion={forceMotion}
              error={debtsError}
              onAdd={(trigger) => openDialog(null, trigger)}
              onEdit={(i, trigger) => openDialog(i, trigger)}
              onDelete={deleteDebt}
              onNoDebtChange={(v) => {
                setHasNoDebt(v);
                if (v) setDebtsError(undefined);
              }}
            />
          </Reveal>

          <TotalsBar balance={totals.balance} payment={totals.payment} onReview={goReview} />
        </>
      )}

      <DebtEntryDialog
        open={dialogOpen}
        formKey={formKey}
        initial={editingIndex !== null ? items[editingIndex]?.debt ?? null : null}
        returnFocus={returnFocus}
        onSave={saveDebt}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}

/* The "about 5 minutes" chip, used by the page's hero. */
export function TimeEstimate() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[13.5px] text-white/85 ring-1 ring-white/15">
      <Clock className="size-4" />
      About 5 minutes with your statements handy
    </span>
  );
}
