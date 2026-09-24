/*
 * Display helpers. Amounts are always numbers in state; these only turn them
 * into text. Never keep "$1,234.00" in the model.
 */

export function formatMoney(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '$0.00';
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatPercent(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '';
  return n.toLocaleString('en-US', { maximumFractionDigits: 3 }) + '%';
}

/* Accepts "1,234.50", "$1234.5", "7.25%". Empty or unparseable -> NaN, which
   the schema rejects with the field's own message. */
export function parseNumber(value: string): number {
  const cleaned = value.replace(/[^0-9.\-]/g, '');
  return cleaned === '' ? NaN : parseFloat(cleaned);
}

/* The text an amount input shows after blur: "1,234.50", or "" if unparseable.
   Applied on blur only - reformatting mid-keystroke fights the cursor. */
export function formatMoneyInput(value: string): string {
  const n = parseNumber(value);
  return Number.isFinite(n)
    ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '';
}

/* The raw text an input starts with when editing a saved number. */
export function numberToInput(n: number | undefined, money: boolean): string {
  if (n == null || !Number.isFinite(n)) return '';
  return money ? formatMoneyInput(String(n)) : String(n);
}

/* yyyy-mm-dd -> mm/dd/yyyy, the US format the printed template uses. */
export function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  const p = iso.split('-');
  return p.length === 3 ? `${p[1]}/${p[2]}/${p[0]}` : '—';
}

/* Today in the visitor's own timezone. toISOString() would give UTC, which is
   already "tomorrow" for a US client entering this in the evening. */
export function todayISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}
