import { createHmac, timingSafeEqual } from 'node:crypto';
import { secret } from '@/lib/debt-schedule/env';

/*
 * SERVER-ONLY. Two HMAC tokens, same key as the debt schedule's links but with
 * prefixed payloads, so no signature from one can validate as another:
 *
 *   upload ticket   "<id>.<exp>.<sig>", returned by /api/tax-returns after
 *                   Turnstile. Turnstile tokens are single-use, so this is what
 *                   authorises each file's upload token and the finalize call.
 *   staff file link /api/tax-returns/file?id&name&exp&sig, in the GHL note.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const NAME = /^[\w.-]{1,100}\.pdf$/;

const sign = (payload: string) =>
  createHmac('sha256', secret('DEBT_SCHEDULE_LINK_SECRET')).update(`tax-returns.${payload}`).digest('base64url');

function matches(expected: string, given: string) {
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const uploadTicket = (id: string, exp: number) => `${id}.${exp}.${sign(`upload.${id}.${exp}`)}`;

/* The submission id if the ticket is genuine and current, otherwise null. */
export function verifyTicket(ticket: unknown): string | null {
  const [id = '', expRaw = '', sig = ''] = String(ticket ?? '').split('.');
  const exp = Number(expRaw);
  if (!UUID.test(id) || !Number.isFinite(exp) || exp < Date.now()) return null;
  return matches(sign(`upload.${id}.${exp}`), sig) ? id : null;
}

export function staffFileUrl(origin: string, id: string, name: string, exp: number) {
  const url = new URL('/api/tax-returns/file', origin);
  url.searchParams.set('id', id);
  url.searchParams.set('name', name);
  url.searchParams.set('exp', String(exp));
  url.searchParams.set('sig', sign(`file.${id}/${name}.${exp}`));
  return url.toString();
}

export function verifyFileLink(params: URLSearchParams): { id: string; name: string } | null {
  const id = params.get('id') ?? '';
  const name = params.get('name') ?? '';
  const exp = Number(params.get('exp'));
  if (!UUID.test(id) || !NAME.test(name) || !Number.isFinite(exp) || exp < Date.now()) return null;
  return matches(sign(`file.${id}/${name}.${exp}`), params.get('sig') ?? '') ? { id, name } : null;
}
