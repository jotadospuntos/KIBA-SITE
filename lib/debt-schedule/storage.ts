import { del, get, list, put } from '@vercel/blob';
import { RETENTION_DAYS } from './constants';
import type { DebtSchedule } from './schema';

/*
 * SERVER-ONLY. Vercel Blob, PRIVATE access: files can only be read with the
 * store token, i.e. through our own signed-link route. The store must have
 * been created as a private store, or put() rejects `access: 'private'`.
 *
 * Layout, one folder per submission:
 *   debt-schedules/<uuid>/schedule.pdf
 *   debt-schedules/<uuid>/submission.json   the raw validated payload, so the
 *                                           PDF can be regenerated later and a
 *                                           failed GoHighLevel sync replayed
 *   debt-schedules/<uuid>/ghl-failed.json   only if the GHL sync failed
 *
 * Everything under the prefix is deleted after RETENTION_DAYS by the cleanup
 * cron. That covers Blob only - what was written onto the GoHighLevel contact
 * stays there until someone removes it in GHL.
 */

const PREFIX = 'debt-schedules/';
const paths = (id: string) => ({
  pdf: `${PREFIX}${id}/schedule.pdf`,
  json: `${PREFIX}${id}/submission.json`,
  failed: `${PREFIX}${id}/ghl-failed.json`
});

const options = { access: 'private' as const, addRandomSuffix: false, allowOverwrite: false };

export async function saveSubmission(id: string, pdf: Uint8Array, data: DebtSchedule) {
  const p = paths(id);
  await Promise.all([
    put(p.pdf, Buffer.from(pdf), { ...options, contentType: 'application/pdf' }),
    put(p.json, JSON.stringify({ receivedAt: new Date().toISOString(), data }), {
      ...options,
      contentType: 'application/json'
    })
  ]);
}

/* A marker staff (or a replay script) can find with list({ prefix }). */
export async function markGhlFailed(id: string, stage: string) {
  await put(paths(id).failed, JSON.stringify({ at: new Date().toISOString(), stage }), {
    ...options,
    contentType: 'application/json'
  });
}

export async function readPdf(id: string) {
  const result = await get(paths(id).pdf, { access: 'private' });
  return result && result.statusCode === 200 ? result.stream : null;
}

/* Deletes every blob under the prefix older than the retention window.
   Returns how many were removed. */
export async function deleteExpired(now = Date.now()): Promise<number> {
  const cutoff = now - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  let cursor: string | undefined;
  let removed = 0;
  do {
    const page = await list({ prefix: PREFIX, cursor, limit: 1000 });
    const expired = page.blobs.filter((b) => b.uploadedAt.getTime() < cutoff).map((b) => b.url);
    if (expired.length) {
      await del(expired);
      removed += expired.length;
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return removed;
}
