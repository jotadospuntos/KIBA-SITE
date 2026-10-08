import { createHmac, timingSafeEqual } from 'node:crypto';
import { secret } from './env';

/*
 * SERVER-ONLY. The "application link" in the GoHighLevel note. It points at
 * /api/funding-application/document, which fetches the signed PDF from
 * SignWell with our API key - so staff never need a SignWell login to open
 * it, and nobody without the signed link can.
 *
 * Same shape as the debt schedule's links (lib/debt-schedule/signed-link.ts)
 * and the same key, but the payload is prefixed, so a debt-schedule signature
 * can never validate here or vice versa.
 */

const PREFIX = 'funding-application';

function sign(id: string, expires: number): string {
  return createHmac('sha256', secret('DEBT_SCHEDULE_LINK_SECRET'))
    .update(`${PREFIX}.${id}.${expires}`)
    .digest('base64url');
}

export function staffDocumentUrl(origin: string, id: string, expires: number): string {
  const url = new URL('/api/funding-application/document', origin);
  url.searchParams.set('id', id);
  url.searchParams.set('exp', String(expires));
  url.searchParams.set('sig', sign(id, expires));
  return url.toString();
}

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/* The SignWell document id if the link is genuine and current, else null. */
export function verifyStaffLink(params: URLSearchParams): string | null {
  const id = params.get('id') ?? '';
  const exp = Number(params.get('exp'));
  const sig = params.get('sig') ?? '';
  if (!ID.test(id) || !Number.isFinite(exp) || exp < Date.now()) return null;

  const expected = Buffer.from(sign(id, exp));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  return id;
}
