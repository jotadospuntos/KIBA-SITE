'use client';

import { Adorned, Field, describedBy, inputClass } from '@/components/debt-schedule/fields';
import { formatMoneyInput } from '@/lib/debt-schedule/format';
import { US_STATES, mask } from '@/lib/funding-application/fields';
import type { FieldDef } from '@/lib/funding-application/fields';

/*
 * One field from lib/funding-application/fields.ts, rendered by its `kind`.
 * The label, error and aria wiring are the debt schedule's (Field +
 * describedBy), so both forms behave the same for screen readers.
 */

const selectClass = (value: string) =>
  `${inputClass} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235b5f7a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-[length:18px] bg-[right_14px_center] bg-no-repeat pr-11 ${
    value ? '' : 'text-slate-light'
  }`;

/* Literal class names, so Tailwind sees them. */
const SPAN = { 2: 'sm:col-span-2', 3: 'sm:col-span-3', 6: 'sm:col-span-6' } as const;

const INPUT_ATTRS: Partial<Record<FieldDef['kind'], { type?: string; inputMode?: 'numeric' | 'decimal' | 'email' | 'tel' | 'url'; placeholder?: string }>> = {
  email: { type: 'email', inputMode: 'email' },
  phone: { type: 'tel', inputMode: 'tel', placeholder: '(555) 555-5555' },
  url: { type: 'url', inputMode: 'url', placeholder: 'example.com' },
  ein: { inputMode: 'numeric', placeholder: 'XX-XXXXXXX' },
  ssn: { inputMode: 'numeric', placeholder: 'XXX-XX-XXXX' },
  zip: { inputMode: 'numeric' },
  int: { inputMode: 'numeric' },
  score: { inputMode: 'numeric', placeholder: '300–850' },
  percent: { inputMode: 'decimal' },
  money: { inputMode: 'decimal', placeholder: '0.00' },
  date: { type: 'date' },
  dob: { type: 'date' }
};

type Props = {
  field: FieldDef;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur: (value: string) => void;
};

export default function FieldInput({ field: f, value, error, onChange, onBlur }: Props) {
  const label = f.required ? (
    f.label
  ) : (
    <>
      {f.label} <span className="font-normal text-slate">— optional</span>
    </>
  );
  const common = {
    id: f.key,
    name: f.key,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': [describedBy(f.key, error), f.hint && !error ? `${f.key}-hint` : ''].filter(Boolean).join(' ') || undefined
  };

  let control;
  if (f.kind === 'state' || f.kind === 'select') {
    const options: ReadonlyArray<readonly [string, string]> =
      f.kind === 'state' ? US_STATES : (f.options ?? []).map((o) => [o, o] as const);
    control = (
      <select
        {...common}
        className={selectClass(value)}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onBlur(e.target.value)}
      >
        <option value="" disabled>
          Select one
        </option>
        {options.map(([v, text]) => (
          <option key={v} value={v} className="text-ink">
            {text}
          </option>
        ))}
      </select>
    );
  } else {
    const attrs = INPUT_ATTRS[f.kind] ?? {};
    const input = (
      <input
        {...common}
        type={attrs.type ?? 'text'}
        inputMode={attrs.inputMode}
        placeholder={attrs.placeholder}
        autoComplete={f.autoComplete}
        maxLength={f.kind === 'text' ? f.max ?? 80 : undefined}
        spellCheck={f.kind === 'text' ? undefined : false}
        className={`${inputClass} ${f.kind === 'money' ? 'pl-8' : ''} ${f.kind === 'percent' ? 'pr-9' : ''} ${
          f.kind === 'ssn' || f.kind === 'ein' ? 'tabular-nums' : ''
        }`}
        value={value}
        onChange={(e) => onChange(mask(f.kind, e.target.value))}
        onBlur={(e) => {
          const v = f.kind === 'money' && e.target.value.trim() ? formatMoneyInput(e.target.value) : e.target.value;
          if (v !== e.target.value) onChange(v);
          onBlur(v);
        }}
      />
    );
    control =
      f.kind === 'money' ? (
        <Adorned symbol="$" side="left">
          {input}
        </Adorned>
      ) : f.kind === 'percent' ? (
        <Adorned symbol="%" side="right">
          {input}
        </Adorned>
      ) : (
        input
      );
  }

  return (
    <Field id={f.key} label={label} error={error} className={`col-span-6 ${SPAN[f.span]}`}>
      {control}
      {f.hint && !error && (
        <p id={`${f.key}-hint`} className="mt-1.5 text-[13px] leading-snug text-slate">
          {f.hint}
        </p>
      )}
    </Field>
  );
}
