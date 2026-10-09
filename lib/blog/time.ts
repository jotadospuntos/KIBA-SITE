/*
 * Blog dates live in KIBA's time zone (Central), whatever time zone the server
 * or the person scheduling is in. Stored as UTC timestamps; these helpers
 * convert to and from the "YYYY-MM-DDTHH:mm" value of a <input type="datetime-local">.
 */

export const BLOG_TZ = 'America/Chicago';

const PARTS = new Intl.DateTimeFormat('en-CA', {
  timeZone: BLOG_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23'
});

function centralParts(d: Date): Record<string, number> {
  const out: Record<string, number> = {};
  for (const p of PARTS.formatToParts(d)) if (p.type !== 'literal') out[p.type] = Number(p.value);
  return out;
}

/* Minutes Central is ahead of UTC at instant `d` (negative: -300 or -360). */
function offsetMinutes(d: Date): number {
  const p = centralParts(d);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  return Math.round((asUtc - Math.floor(d.getTime() / 60000) * 60000) / 60000);
}

const pad = (n: number) => String(n).padStart(2, '0');

export function toCentralInput(d: Date): string {
  const p = centralParts(d);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/* Null for anything that isn't a complete "YYYY-MM-DDTHH:mm". */
export function fromCentralInput(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m.map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  /* Guess with the offset at the wall time, then correct once: right on both
     sides of a DST change. */
  let utc = wall - offsetMinutes(new Date(wall)) * 60000;
  utc = wall - offsetMinutes(new Date(utc)) * 60000;
  const result = new Date(utc);
  return Number.isNaN(result.getTime()) ? null : result;
}

/* "April 22, 2026" — the byline date on the site. */
export function formatPostDate(d: Date): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: BLOG_TZ, dateStyle: 'long' }).format(d);
}

/* "Oct 9, 2026, 9:00 AM CT" — for the dashboard. */
export function formatAdminDateTime(d: Date): string {
  const s = new Intl.DateTimeFormat('en-US', {
    timeZone: BLOG_TZ,
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(d);
  return `${s} CT`;
}
