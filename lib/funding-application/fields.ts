import { parseNumber } from '@/lib/debt-schedule/format';

/*
 * THE ONE SOURCE OF TRUTH for the funding application. Every box on "KIBA
 * Lending Application v6.pdf" is one entry here, and everything else is
 * derived from this list: the form's steps and inputs, the review screen, the
 * values sent to the SignWell template, and the validation the server re-runs.
 * Adding a field to the PDF is one entry here plus the same API ID in SignWell.
 *
 * `key` IS the SignWell field API ID. Don't rename one without renaming it in
 * the template too - a mismatch fails silently (the box just stays empty).
 *
 * Values are kept as the text the visitor sees ("(251) 210-8445",
 * "250,000.00", "2015-03-01"); toSignwellValue() turns them into what the PDF
 * prints.
 */

export type Kind =
  | 'text'
  | 'email'
  | 'phone'
  | 'url'
  | 'ein'
  | 'ssn'
  | 'date'
  | 'dob'
  | 'state'
  | 'select'
  | 'money'
  | 'int'
  | 'percent'
  | 'score'
  | 'zip';

export type FieldDef = {
  key: string;
  label: string;
  kind: Kind;
  required: boolean;
  /* Grid columns out of 6 from `sm` up (phones are always one column). */
  span: 2 | 3 | 6;
  options?: readonly string[];
  max?: number;
  autoComplete?: string;
  hint?: string;
};

export const US_STATES: ReadonlyArray<readonly [code: string, name: string]> = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'],
  ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'],
  ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'],
  ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'],
  ['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'],
  ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
  ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
  ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'],
  ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'], ['SD', 'South Dakota'],
  ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'],
  ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming']
];
const STATE_CODES = new Set(US_STATES.map(([c]) => c));

/* The PDF's boxes are free text; these lists are ours. */
export const ENTITY_TYPES = [
  'LLC',
  'S Corporation',
  'C Corporation',
  'Sole Proprietorship',
  'Partnership',
  'Non-Profit'
] as const;
export const OWN_RENT = ['Own', 'Rent'] as const;

/* "Use of Funds" is a single line on the PDF, so it's capped at what fits. */
export const MAX_USE_OF_FUNDS = 100;
const MAX_TEXT = 80;

/* ---------------------------------------------------------------- the PDF */

export const BUSINESS_FIELDS: FieldDef[] = [
  { key: 'business_legal_name', label: 'Legal business name', kind: 'text', required: true, span: 6, autoComplete: 'organization' },
  { key: 'business_dba', label: 'DBA (doing business as)', kind: 'text', required: false, span: 6, hint: 'Only if it trades under a different name.' },
  { key: 'business_ein', label: 'Federal Tax ID # (EIN)', kind: 'ein', required: true, span: 3 },
  { key: 'business_state_of_incorporation', label: 'State of incorporation', kind: 'state', required: true, span: 3 },
  { key: 'business_start_date', label: 'Business start date', kind: 'date', required: true, span: 3 },
  { key: 'business_industry', label: 'Industry', kind: 'text', required: true, span: 3 },
  { key: 'business_location_phone', label: 'Business phone', kind: 'phone', required: true, span: 3, hint: 'The physical location’s number.' },
  { key: 'business_cell_phone', label: 'Business cell phone', kind: 'phone', required: false, span: 3 },
  { key: 'business_email', label: 'Business email', kind: 'email', required: true, span: 3 },
  { key: 'business_website', label: 'Website', kind: 'url', required: false, span: 3 },
  { key: 'business_street', label: 'Business street address', kind: 'text', required: true, span: 6, autoComplete: 'street-address' },
  { key: 'business_city', label: 'City', kind: 'text', required: true, span: 2, autoComplete: 'address-level2' },
  { key: 'business_state', label: 'State', kind: 'state', required: true, span: 2 },
  { key: 'business_zip', label: 'ZIP code', kind: 'zip', required: true, span: 2, autoComplete: 'postal-code' }
];

export const FINANCIAL_FIELDS: FieldDef[] = [
  { key: 'business_entity_type', label: 'Type of business entity', kind: 'select', options: ENTITY_TYPES, required: true, span: 3 },
  { key: 'business_w2_employees', label: 'Number of W-2 employees', kind: 'int', required: true, span: 3 },
  { key: 'business_gross_revenue', label: 'Gross annual revenue', kind: 'money', required: true, span: 3 },
  { key: 'business_monthly_deposits', label: 'Monthly bank deposit volume', kind: 'money', required: true, span: 3 },
  { key: 'funding_amount', label: 'Funding amount requested', kind: 'money', required: true, span: 6 },
  { key: 'business_own_rent', label: 'Do you own or rent the place of business?', kind: 'select', options: OWN_RENT, required: true, span: 3 },
  { key: 'business_housing_payment', label: 'Monthly mortgage / rent', kind: 'money', required: true, span: 3, hint: 'Enter 0 if there’s none.' },
  { key: 'use_of_funds', label: 'Use of funds', kind: 'text', max: MAX_USE_OF_FUNDS, required: true, span: 6, hint: 'One line, e.g. “Equipment purchase and working capital.”' }
];

/*
 * ONE OWNER FOR NOW (decided by the human): the SignWell template has no
 * fields in the PDF's Owner / Officer 2 column, so the form doesn't ask for a
 * second owner. ownerFields(2) produces that column's IDs (owner2_*) for the
 * day it comes back: add those fields to the template, add a step for them,
 * and restore the "two owners can't exceed 100%" check.
 *
 * Owner 1 is the person filling this in and the one who signs.
 */
export function ownerFields(n: 1 | 2): FieldDef[] {
  const p = `owner${n}_`;
  const you = n === 1;
  return [
    { key: `${p}first_name`, label: 'First name', kind: 'text', required: true, span: 3, autoComplete: you ? 'given-name' : 'off' },
    { key: `${p}last_name`, label: 'Last name', kind: 'text', required: true, span: 3, autoComplete: you ? 'family-name' : 'off' },
    { key: `${p}ownership_pct`, label: 'Ownership %', kind: 'percent', required: true, span: 2 },
    { key: `${p}dob`, label: 'Date of birth', kind: 'dob', required: true, span: 2, autoComplete: you ? 'bday' : 'off' },
    { key: `${p}ssn`, label: 'SSN', kind: 'ssn', required: true, span: 2, autoComplete: 'off' },
    { key: `${p}cell_phone`, label: 'Cell phone', kind: 'phone', required: true, span: 3, autoComplete: you ? 'tel' : 'off' },
    { key: `${p}email`, label: 'Email', kind: 'email', required: true, span: 3, autoComplete: you ? 'email' : 'off' },
    { key: `${p}score_transunion`, label: 'TransUnion', kind: 'score', required: false, span: 2 },
    { key: `${p}score_experian`, label: 'Experian', kind: 'score', required: false, span: 2 },
    { key: `${p}score_equifax`, label: 'Equifax', kind: 'score', required: false, span: 2 },
    { key: `${p}street`, label: 'Home street address', kind: 'text', required: true, span: 6, autoComplete: you ? 'street-address' : 'off' },
    { key: `${p}city`, label: 'City', kind: 'text', required: true, span: 2, autoComplete: you ? 'address-level2' : 'off' },
    { key: `${p}state`, label: 'State', kind: 'state', required: true, span: 2 },
    { key: `${p}zip`, label: 'ZIP code', kind: 'zip', required: true, span: 2, autoComplete: you ? 'postal-code' : 'off' },
    { key: `${p}own_rent`, label: 'Do you own or rent your home?', kind: 'select', options: OWN_RENT, required: true, span: 3 },
    { key: `${p}housing_payment`, label: 'Monthly mortgage / rent', kind: 'money', required: true, span: 3, hint: 'Enter 0 if there’s none.' }
  ];
}

export const OWNER1_FIELDS = ownerFields(1);

/* The first field of the credit-score row - the form puts a group heading
   above it. */
export const SCORE_GROUP_START = new Set(['owner1_score_transunion']);

export const ALL_FIELDS: FieldDef[] = [...BUSINESS_FIELDS, ...FINANCIAL_FIELDS, ...OWNER1_FIELDS];
export const FIELD_BY_KEY = new Map(ALL_FIELDS.map((f) => [f.key, f]));

/* Never autosaved to localStorage, and masked on the review screen. */
export const SENSITIVE: ReadonlySet<Kind> = new Set<Kind>(['ssn', 'dob']);

export type Values = Record<string, string>;
export type Application = { values: Values };

/* --------------------------------------------------------------- formatting */

const digits = (v: string) => v.replace(/\D/g, '');

/* As-you-type masks. Applied on every change; they only ever add separators
   to the digits typed, so the cursor stays at the end while typing forward. */
export function mask(kind: Kind, raw: string): string {
  const d = digits(raw);
  switch (kind) {
    case 'phone': {
      const n = d.startsWith('1') && d.length > 10 ? d.slice(1, 11) : d.slice(0, 10);
      if (n.length <= 3) return n.length ? `(${n}` : '';
      if (n.length <= 6) return `(${n.slice(0, 3)}) ${n.slice(3)}`;
      return `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`;
    }
    case 'ssn': {
      const n = d.slice(0, 9);
      if (n.length <= 3) return n;
      if (n.length <= 5) return `${n.slice(0, 3)}-${n.slice(3)}`;
      return `${n.slice(0, 3)}-${n.slice(3, 5)}-${n.slice(5)}`;
    }
    case 'ein': {
      const n = d.slice(0, 9);
      return n.length <= 2 ? n : `${n.slice(0, 2)}-${n.slice(2)}`;
    }
    case 'zip': {
      const n = d.slice(0, 9);
      return n.length <= 5 ? n : `${n.slice(0, 5)}-${n.slice(5)}`;
    }
    case 'int':
    case 'score':
      return d.slice(0, kind === 'score' ? 3 : 7);
    case 'percent':
      return raw.replace(/[^0-9.]/g, '').slice(0, 6);
    case 'money':
      return raw.replace(/[^0-9.,]/g, '').slice(0, 18);
    default:
      return raw;
  }
}

/* What the review screen shows. SSNs show only their last four. */
export function displayValue(f: FieldDef, v: string): string {
  if (!v.trim()) return '—';
  if (f.kind === 'ssn') return `•••-••-${digits(v).slice(-4)}`;
  if (f.kind === 'dob') return '••/••/' + v.slice(0, 4);
  return toSignwellValue(f, v);
}

function usDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}

function money(v: string) {
  const n = parseNumber(v);
  if (!Number.isFinite(n)) return '';
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

/* The text printed into the template's box. */
export function toSignwellValue(f: FieldDef, raw: string): string {
  const v = raw.trim();
  if (!v) return '';
  switch (f.kind) {
    case 'date':
    case 'dob':
      return usDate(v);
    case 'money':
      return money(v);
    case 'percent':
      return `${parseNumber(v)}%`;
    case 'int':
    case 'score':
      return String(parseInt(digits(v), 10));
    default:
      return v;
  }
}

/* --------------------------------------------------------------- validation */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function yearsAgoISO(years: number) {
  const t = todayISO();
  return `${Number(t.slice(0, 4)) - years}${t.slice(4)}`;
}

/* One field on its own. Returns the message to show, or undefined. */
export function validateField(f: FieldDef, raw: string | undefined): string | undefined {
  const v = (raw ?? '').trim();
  if (!v) return f.required ? 'This field is required.' : undefined;
  if (v.length > (f.max ?? MAX_TEXT) && (f.kind === 'text' || f.kind === 'url' || f.kind === 'email')) {
    return `Keep this under ${f.max ?? MAX_TEXT} characters.`;
  }

  switch (f.kind) {
    case 'email':
      return EMAIL.test(v) ? undefined : 'Enter a valid email address.';
    case 'phone':
      return digits(v).length === 10 ? undefined : 'Enter a 10-digit phone number.';
    case 'url':
      return /^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i.test(v) ? undefined : 'Enter a web address, e.g. example.com.';
    case 'ein':
      return digits(v).length === 9 ? undefined : 'An EIN has 9 digits (XX-XXXXXXX).';
    case 'ssn': {
      const d = digits(v);
      if (d.length !== 9) return 'An SSN has 9 digits (XXX-XX-XXXX).';
      const area = d.slice(0, 3);
      if (area === '000' || area === '666' || area >= '900' || d.slice(3, 5) === '00' || d.slice(5) === '0000') {
        return 'That isn’t a valid SSN.';
      }
      return undefined;
    }
    case 'zip':
      return /^\d{5}(-\d{4})?$/.test(v) ? undefined : 'Enter a 5-digit ZIP code.';
    case 'state':
      return STATE_CODES.has(v) ? undefined : 'Choose a state.';
    case 'select':
      return f.options?.includes(v) ? undefined : 'Choose one.';
    case 'date':
      if (!ISO_DATE.test(v)) return 'Enter a date.';
      if (v > todayISO()) return 'This date can’t be in the future.';
      return v < '1800-01-01' ? 'Enter a valid date.' : undefined;
    case 'dob':
      if (!ISO_DATE.test(v)) return 'Enter a date of birth.';
      if (v > yearsAgoISO(18)) return 'Owners must be at least 18.';
      return v < yearsAgoISO(120) ? 'Enter a valid date of birth.' : undefined;
    case 'money': {
      const n = parseNumber(v);
      return Number.isFinite(n) && n >= 0 ? undefined : 'Enter an amount.';
    }
    case 'int':
      return /^\d+$/.test(v) ? undefined : 'Enter a whole number.';
    case 'percent': {
      const n = parseNumber(v);
      return Number.isFinite(n) && n > 0 && n <= 100 ? undefined : 'Enter a percentage between 0 and 100.';
    }
    case 'score': {
      const n = Number(v);
      return /^\d+$/.test(v) && n >= 300 && n <= 850 ? undefined : 'Credit scores run from 300 to 850.';
    }
    default:
      return undefined;
  }
}

export type Errors = Record<string, string>;

/* Every error for a set of fields (one step, or all of them). */
export function validateFields(fields: FieldDef[], app: Application): Errors {
  const errors: Errors = {};
  for (const f of fields) {
    const e = validateField(f, app.values[f.key]);
    if (e) errors[f.key] = e;
  }
  return errors;
}

/*
 * The server's check, and the client's last one before submitting: the shape,
 * then every field. Unknown keys are dropped rather than rejected, so nothing
 * but the fields in this file can reach the PDF.
 */
export function parseApplication(input: unknown): { ok: true; app: Application } | { ok: false } {
  if (!input || typeof input !== 'object') return { ok: false };
  const { values } = input as { values?: unknown };
  if (!values || typeof values !== 'object') return { ok: false };

  const clean: Values = {};
  for (const f of ALL_FIELDS) {
    const v = (values as Record<string, unknown>)[f.key];
    if (v !== undefined && typeof v !== 'string') return { ok: false };
    clean[f.key] = (v ?? '').trim();
  }
  const app = { values: clean };
  return Object.keys(validateFields(ALL_FIELDS, app)).length ? { ok: false } : { ok: true, app };
}
