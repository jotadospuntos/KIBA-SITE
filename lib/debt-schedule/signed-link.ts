import { createHmac, timingSafeEqual } from 'node:crypto';
import { secret } from './env';

/*
 * SERVER-ONLY. The PDFs live in a PRIVATE Blob store (decided: option A), so
 * nobody can open one from its storage URL. Every link we hand out - the
 * client's "Download your copy" and the staff link on the GoHighLevel contact -
 * points at /api/debt-schedule/file with an id, an expiry and an HMAC of the
 * two. The file route re-computes the HMAC and streams the PDF only if it
 * matches and hasn't expired.
 *
 * Nothing personal goes in the URL: the id is a random UUID.
 */

function sign(id: string, expires: number): string {
  return createHmac('sha256', secret('DEBT_SCHEDULE_LINK_SECRET'))
    .update(`${id}.${expires}`)
    .digest('base64url');
}

export function signedPdfUrl(origin: string, id: string, expires: number): string {
  const url = new URL('/api/debt-schedule/file', origin);
  url.searchParams.set('id', id);
  url.searchParams.set('exp', String(expires));
  url.searchParams.set('sig', sign(id, expires));
  return url.toString();
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/* The id if the link is genuine and current, otherwise null. */
export function verifySignedPdf(params: URLSearchParams): string | null {
  const id = params.get('id') ?? '';
  const exp = Number(params.get('exp'));
  const sig = params.get('sig') ?? '';
  if (!UUID.test(id) || !Number.isFinite(exp) || exp < Date.now()) return null;

  const expected = Buffer.from(sign(id, exp));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  return id;
}
