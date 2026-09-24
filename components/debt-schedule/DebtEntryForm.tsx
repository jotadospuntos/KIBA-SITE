'use client';

import { useEffect, useRef, useState } from 'react';
import type { MutableRefObject, RefObject } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import {
  DEBT_TYPES,
  MAX_COLLATERAL,
  MAX_LENDER,
  MAX_OTHER_TYPE,
  SECURED,
  STATUS
} from '@/lib/debt-schedule/constants';
import type { DebtType, PaymentStatus, SecuredStatus } from '@/lib/debt-schedule/constants';
import { formatMoneyInput, numberToInput, parseNumber } from '@/lib/debt-schedule/format';
import {
  debtEntrySchema,
  debtWarnings,
  validateDebt
} from '@/lib/debt-schedule/schema';
import type { DebtEntry, DebtErrors, DebtField, DebtWarnings } from '@/lib/debt-schedule/schema';
import { ADD_DEBT_BUTTON_ID } from './DebtList';
import { Adorned, Field, GroupLabel, describedBy, inputClass } from './fields';

/*
 * One debt, editing view: a Base UI Dialog that is a full-screen sheet on
 * phones and a centred modal from `sm` up. Base UI supplies the focus trap,
 * Escape-to-close, the scroll lock and the backdrop click; the caller passes
 * `returnFocus` so focus goes back to the card (or button) that opened it.
 *
 * The open/close fade is a CSS transition on Base UI's data-starting-style /
 * data-ending-style attributes, so it's governed by home.css's reduced-motion
 * rule and ?motion=1 like every other CSS transition on the site.
 *
 * Draft values are kept as the raw strings the inputs show; they only become
 * numbers in toCandidate(). Validation runs on blur and on save, never on
 * change - typing into a field just clears that field's error.
 */

type Draft = {
  lenderName: string;
  typeOfDebt: DebtType | '';
  otherDebtType: string;
  originalAmount: string;
  currentBalance: string;
  interestRate: string;
  monthlyPayment: string;
  openDate: string;
  maturityDate: string;
  noMaturity: boolean;
  securedStatus: SecuredStatus | '';
  paymentStatus: PaymentStatus | '';
  collateral: string;
};

/* Also the order focus moves in when a save fails. */
const FIELD_ORDER: DebtField[] = [
  'lenderName',
  'typeOfDebt',
  'otherDebtType',
  'originalAmount',
  'currentBalance',
  'interestRate',
  'monthlyPayment',
  'openDate',
  'maturityDate',
  'securedStatus',
  'paymentStatus',
  'collateral'
];

const fieldId = (f: DebtField) => `debt-${f}`;

function toDraft(d: DebtEntry | null): Draft {
  return {
    lenderName: d?.lenderName ?? '',
    typeOfDebt: d?.typeOfDebt ?? '',
    otherDebtType: d?.otherDebtType ?? '',
    originalAmount: numberToInput(d?.originalAmount, true),
    currentBalance: numberToInput(d?.currentBalance, true),
    interestRate: numberToInput(d?.interestRate, false),
    monthlyPayment: numberToInput(d?.monthlyPayment, true),
    openDate: d?.openDate ?? '',
    maturityDate: d?.maturityDate ?? '',
    noMaturity: d?.noMaturity ?? false,
    securedStatus: d?.securedStatus ?? '',
    paymentStatus: d?.paymentStatus ?? '',
    collateral: d?.collateral ?? ''
  };
}

/* The conditional fields are dropped, not just hidden, when they don't apply,
   so switching "Other" -> "PPP" can't leave a stale description behind. */
function toCandidate(d: Draft): Partial<DebtEntry> {
  return {
    lenderName: d.lenderName.trim(),
    typeOfDebt: d.typeOfDebt || undefined,
    otherDebtType: d.typeOfDebt === 'Other' ? d.otherDebtType.trim() : undefined,
    originalAmount: parseNumber(d.originalAmount),
    currentBalance: parseNumber(d.currentBalance),
    interestRate: parseNumber(d.interestRate),
    monthlyPayment: parseNumber(d.monthlyPayment),
    openDate: d.openDate,
    maturityDate: d.noMaturity || !d.maturityDate ? undefined : d.maturityDate,
    noMaturity: d.noMaturity,
    securedStatus: d.securedStatus || undefined,
    paymentStatus: d.paymentStatus || undefined,
    collateral: d.securedStatus === 'Secured' ? d.collateral.trim() : undefined
  };
}

type Props = {
  open: boolean;
  /* Changing this remounts the form with a fresh draft ("Save & add another"). */
  formKey: number;
  initial: DebtEntry | null;
  returnFocus: RefObject<HTMLElement | null>;
  onSave: (entry: DebtEntry, addAnother: boolean) => void;
  onClose: () => void;
};

export default function DebtEntryDialog({ open, formKey, initial, returnFocus, onSave, onClose }: Props) {
  const lenderRef = useRef<HTMLInputElement | null>(null);

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[100] bg-navy-deep/55 backdrop-blur-[2px] transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup
          initialFocus={lenderRef}
          /* The opener can be gone by close time - "Add your first debt" is
             replaced by the list once a debt exists - so fall back to the
             list's "Add another debt" button rather than letting focus drop
             to the top of the page. */
          finalFocus={() =>
            returnFocus.current?.isConnected
              ? returnFocus.current
              : document.getElementById(ADD_DEBT_BUTTON_ID)
          }
          className={
            'fixed inset-0 z-[101] flex flex-col bg-white font-body text-ink shadow-soft outline-none ' +
            'transition-[opacity,scale] duration-200 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 ' +
            'data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0 ' +
            'sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[min(88vh,860px)] sm:w-[calc(100%-48px)] sm:max-w-[640px] ' +
            'sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[16px]'
          }
        >
          <DebtEntryForm
            key={formKey}
            initial={initial}
            lenderRef={lenderRef}
            onSave={onSave}
            onClose={onClose}
          />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DebtEntryForm({
  initial,
  lenderRef,
  onSave,
  onClose
}: {
  initial: DebtEntry | null;
  lenderRef: MutableRefObject<HTMLInputElement | null>;
  onSave: (entry: DebtEntry, addAnother: boolean) => void;
  onClose: () => void;
}) {
  const isEdit = initial !== null;
  const [draft, setDraft] = useState<Draft>(() => toDraft(initial));
  const [errors, setErrors] = useState<DebtErrors>({});
  const [warnings, setWarnings] = useState<DebtWarnings>(() =>
    initial ? debtWarnings(initial) : {}
  );
  const bodyRef = useRef<HTMLDivElement | null>(null);

  /* A remount after "Save & add another": back to the top, focus on the first
     field. On the very first open, the Popup's initialFocus does the same. */
  useEffect(() => {
    bodyRef.current?.scrollTo(0, 0);
    lenderRef.current?.focus();
  }, [lenderRef]);

  /* The latest draft, read synchronously. Blur handlers fire in the same tick
     as the change before them (autofill, fast typing, a date picker), so
     reading `draft` from the render closure can validate a stale value and
     re-flag a field that was just filled in. */
  const draftRef = useRef(draft);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    draftRef.current = { ...draftRef.current, [key]: value };
    setDraft(draftRef.current);
    setErrors((e) => {
      if (!(key in e)) return e;
      const next = { ...e };
      delete next[key as DebtField];
      return next;
    });
  }

  /* Validate one field on blur, against the latest draft. */
  function blur(field: DebtField) {
    const candidate = toCandidate(draftRef.current);
    const message = validateDebt(candidate)[field];
    setErrors((e) => {
      const next = { ...e };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
    setWarnings(debtWarnings(candidate));
  }

  function blurMoney(field: 'originalAmount' | 'currentBalance' | 'monthlyPayment') {
    set(field, formatMoneyInput(draftRef.current[field]));
    blur(field);
  }

  function save(addAnother: boolean) {
    const candidate = toCandidate(draftRef.current);
    const found = validateDebt(candidate);
    setErrors(found);
    setWarnings(debtWarnings(candidate));
    const first = FIELD_ORDER.find((f) => found[f]);
    if (first) {
      document.getElementById(fieldId(first))?.focus();
      return;
    }
    const parsed = debtEntrySchema.safeParse(candidate);
    if (parsed.success) onSave(parsed.data, addAnother);
  }

  const err = (f: DebtField) => errors[f];
  const aria = (f: DebtField, warning?: string) => ({
    id: fieldId(f),
    'aria-invalid': err(f) ? true : undefined,
    'aria-describedby': describedBy(fieldId(f), err(f), warning)
  });
  const selectClass = (value: string) =>
    `${inputClass} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235b5f7a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-[length:18px] bg-[right_14px_center] bg-no-repeat pr-11 ${
      value ? '' : 'text-slate-light'
    }`;

  return (
    <>
      <div className="flex items-center justify-between gap-4 px-6 pb-4 pt-5 ring-1 ring-line sm:px-8 sm:pt-6">
        <Dialog.Title className="font-heading text-[22px] font-semibold text-ink">
          {isEdit ? 'Edit debt' : 'Add a debt'}
        </Dialog.Title>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-10 place-items-center rounded-full! bg-transparent p-0! text-slate hover:bg-paper hover:text-ink"
        >
          <X className="size-5" />
        </button>
      </div>

      <div ref={bodyRef} className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
        <GroupLabel>Who and what</GroupLabel>
        <div className="grid gap-4">
          <Field id={fieldId('lenderName')} label="Lender's name" error={err('lenderName')}>
            <input
              ref={lenderRef}
              type="text"
              maxLength={MAX_LENDER}
              className={inputClass}
              value={draft.lenderName}
              onChange={(e) => set('lenderName', e.target.value)}
              onBlur={() => blur('lenderName')}
              {...aria('lenderName')}
            />
          </Field>
          <Field id={fieldId('typeOfDebt')} label="Type of debt" error={err('typeOfDebt')}>
            <select
              className={selectClass(draft.typeOfDebt)}
              value={draft.typeOfDebt}
              onChange={(e) => set('typeOfDebt', e.target.value as Draft['typeOfDebt'])}
              onBlur={() => blur('typeOfDebt')}
              {...aria('typeOfDebt')}
            >
              <option value="" disabled>
                Select one
              </option>
              {DEBT_TYPES.map((t) => (
                <option key={t} value={t} className="text-ink">
                  {t}
                </option>
              ))}
            </select>
          </Field>
          {draft.typeOfDebt === 'Other' && (
            <Field id={fieldId('otherDebtType')} label="Please specify" error={err('otherDebtType')}>
              <input
                type="text"
                maxLength={MAX_OTHER_TYPE}
                placeholder="e.g. Merchant cash advance"
                className={inputClass}
                value={draft.otherDebtType}
                onChange={(e) => set('otherDebtType', e.target.value)}
                onBlur={() => blur('otherDebtType')}
                {...aria('otherDebtType')}
              />
            </Field>
          )}
        </div>

        <GroupLabel>The numbers</GroupLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id={fieldId('originalAmount')} label="Original amount" error={err('originalAmount')}>
            <Adorned symbol="$" side="left">
              <input
                inputMode="decimal"
                className={`${inputClass} pl-8 tabular-nums`}
                value={draft.originalAmount}
                onChange={(e) => set('originalAmount', e.target.value)}
                onBlur={() => blurMoney('originalAmount')}
                {...aria('originalAmount')}
              />
            </Adorned>
          </Field>
          <Field
            id={fieldId('currentBalance')}
            label="Current balance"
            error={err('currentBalance')}
            warning={warnings.currentBalance}
          >
            <Adorned symbol="$" side="left">
              <input
                inputMode="decimal"
                className={`${inputClass} pl-8 tabular-nums`}
                value={draft.currentBalance}
                onChange={(e) => set('currentBalance', e.target.value)}
                onBlur={() => blurMoney('currentBalance')}
                {...aria('currentBalance', warnings.currentBalance)}
              />
            </Adorned>
          </Field>
          <Field id={fieldId('interestRate')} label="Interest rate" error={err('interestRate')}>
            <Adorned symbol="%" side="right">
              <input
                inputMode="decimal"
                className={`${inputClass} pr-9 tabular-nums`}
                value={draft.interestRate}
                onChange={(e) => set('interestRate', e.target.value)}
                onBlur={() => blur('interestRate')}
                {...aria('interestRate')}
              />
            </Adorned>
          </Field>
          <Field
            id={fieldId('monthlyPayment')}
            label="Monthly payment"
            error={err('monthlyPayment')}
            warning={warnings.monthlyPayment}
          >
            <Adorned symbol="$" side="left">
              <input
                inputMode="decimal"
                className={`${inputClass} pl-8 tabular-nums`}
                value={draft.monthlyPayment}
                onChange={(e) => set('monthlyPayment', e.target.value)}
                onBlur={() => blurMoney('monthlyPayment')}
                {...aria('monthlyPayment', warnings.monthlyPayment)}
              />
            </Adorned>
          </Field>
        </div>

        <GroupLabel>The dates</GroupLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id={fieldId('openDate')} label="Open date" error={err('openDate')}>
            <input
              type="date"
              className={inputClass}
              value={draft.openDate}
              onChange={(e) => set('openDate', e.target.value)}
              onBlur={() => blur('openDate')}
              {...aria('openDate')}
            />
          </Field>
          <Field
            id={fieldId('maturityDate')}
            label={
              <>
                Maturity date <span className="font-normal text-slate">— optional</span>
              </>
            }
            error={err('maturityDate')}
          >
            <input
              type="date"
              className={inputClass}
              value={draft.noMaturity ? '' : draft.maturityDate}
              disabled={draft.noMaturity}
              onChange={(e) => set('maturityDate', e.target.value)}
              onBlur={() => blur('maturityDate')}
              {...aria('maturityDate')}
            />
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-[13px] text-slate">
              <input
                type="checkbox"
                className="size-4 accent-blue"
                checked={draft.noMaturity}
                onChange={(e) => {
                  set('noMaturity', e.target.checked);
                  if (e.target.checked) {
                    set('maturityDate', '');
                    setErrors((x) => {
                      const next = { ...x };
                      delete next.maturityDate;
                      return next;
                    });
                  }
                }}
              />
              No maturity (revolving)
            </label>
          </Field>
        </div>

        <GroupLabel>Status</GroupLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id={fieldId('securedStatus')} label="Secured or unsecured" error={err('securedStatus')}>
            <select
              className={selectClass(draft.securedStatus)}
              value={draft.securedStatus}
              onChange={(e) => set('securedStatus', e.target.value as Draft['securedStatus'])}
              onBlur={() => blur('securedStatus')}
              {...aria('securedStatus')}
            >
              <option value="" disabled>
                Select one
              </option>
              {SECURED.map((s) => (
                <option key={s} value={s} className="text-ink">
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field id={fieldId('paymentStatus')} label="Current or delinquent" error={err('paymentStatus')}>
            <select
              className={selectClass(draft.paymentStatus)}
              value={draft.paymentStatus}
              onChange={(e) => set('paymentStatus', e.target.value as Draft['paymentStatus'])}
              onBlur={() => blur('paymentStatus')}
              {...aria('paymentStatus')}
            >
              <option value="" disabled>
                Select one
              </option>
              {STATUS.map((s) => (
                <option key={s} value={s} className="text-ink">
                  {s}
                </option>
              ))}
            </select>
          </Field>
          {draft.securedStatus === 'Secured' && (
            <Field
              id={fieldId('collateral')}
              label="Type of collateral"
              error={err('collateral')}
              className="sm:col-span-2"
            >
              <input
                type="text"
                maxLength={MAX_COLLATERAL}
                placeholder="e.g. Equipment, real estate, receivables"
                className={inputClass}
                value={draft.collateral}
                onChange={(e) => set('collateral', e.target.value)}
                onBlur={() => blur('collateral')}
                {...aria('collateral')}
              />
            </Field>
          )}
        </div>
      </div>

      {/* A <div>, not a <footer>: home.css paints every bare footer navy. */}
      {/* Phones: full-width buttons stacked with Save on top (flex-col-reverse
          keeps the DOM - and so the tab order - Cancel-first, as on desktop). */}
      <div className="flex flex-col-reverse gap-2.5 bg-paper px-6 py-4 ring-1 ring-line pb-[max(16px,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:rounded-b-[16px] sm:px-8 [&>button]:justify-center">
        <button type="button" className="btn btn-dark-ghost" onClick={onClose}>
          Cancel
        </button>
        {!isEdit && (
          <button type="button" className="btn bg-navy-deep text-white hover:bg-navy-soft" onClick={() => save(true)}>
            Save &amp; add another
          </button>
        )}
        <button type="button" className="btn btn-primary" onClick={() => save(false)}>
          Save
        </button>
      </div>
    </>
  );
}
