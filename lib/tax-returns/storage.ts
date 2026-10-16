import { del, get, list, put } from '@vercel/blob';
import { RETENTION_DAYS } from '@/lib/debt-schedule/constants';
import { SITE_URL } from '@/lib/site';
import { FILE_PATH, PREFIX } from './constants';
import type { TaxContact } from './schema';
import { staffFileUrl } from './signed-link';

/*
 * SERVER-ONLY. The same PRIVATE Blob store as the debt schedule. Tax returns
 * carry SSNs, so they live only here - never in the database, never in GHL
 * (GHL gets signed links). One folder per submission:
 *
 *   tax-returns/<uuid>/submission.json   who uploaded (contact details only)
 *   tax-returns/<uuid>/files/<n>-<name>.pdf   uploaded by the BROWSER, straight
 *                                        to Blob (a function body caps at 4.5 MB)
 *   tax-returns/<uuid>/ghl-failed.json   only if the GHL sync failed
 *
 * Swept after RETENTION_DAYS by the debt-schedule cleanup cron.
 */

const options = { access: 'private' as const, addRandomSuffix: false, allowOverwrite: false };
const json = (id: string) => `${PREFIX}${id}/submission.json`;

export async function saveContact(id: string, contact: TaxContact) {
  await put(json(id), JSON.stringify({ receivedAt: new Date().toISOString(), contact }), {
    ...options,
    contentType: 'application/json'
  });
}

export async function readSubmission(id: string): Promise<{ receivedAt: string; contact: TaxContact } | null> {
  const result = await get(json(id), { access: 'private' });
  return result && result.statusCode === 200 ? new Response(result.stream).json() : null;
}

export async function listFiles(id: string) {
  const page = await list({ prefix: `${PREFIX}${id}/files/`, limit: 1000 });
  return page.blobs.flatMap((b) => {
    const m = FILE_PATH.exec(b.pathname);
    return m ? [{ name: m[2], pathname: b.pathname, url: b.url }] : [];
  });
}

export async function readFile(id: string, name: string) {
  const result = await get(`${PREFIX}${id}/files/${name}`, { access: 'private' });
  return result && result.statusCode === 200 ? result.stream : null;
}

/* The upload token only checks the declared content type, so finalize reads
   each file's first bytes and drops anything that isn't really a PDF. */
export async function isPdf(pathname: string) {
  const result = await get(pathname, { access: 'private' });
  if (!result || result.statusCode !== 200) return false;
  const reader = result.stream.getReader();
  const { value } = await reader.read();
  await reader.cancel();
  return !!value && Buffer.from(value.slice(0, 5)).toString('latin1') === '%PDF-';
}

export const deleteBlobs = (urls: string[]) => (urls.length ? del(urls) : Promise.resolve());

export async function markGhlFailed(id: string, stage: string) {
  await put(`${PREFIX}${id}/ghl-failed.json`, JSON.stringify({ at: new Date().toISOString(), stage }), {
    ...options,
    allowOverwrite: true,
    contentType: 'application/json'
  });
}

/* Staff links for every file, valid as long as the files exist. Shared by
   finalize and the admin retry so the two can't drift. */
export async function staffLinks(id: string, receivedAt: string) {
  const exp = Date.parse(receivedAt) + RETENTION_DAYS * 24 * 60 * 60 * 1000;
  return (await listFiles(id)).map((f) => ({ name: f.name, url: staffFileUrl(SITE_URL, id, f.name, exp) }));
}
