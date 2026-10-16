import 'server-only';
import { del, get, list, put } from '@vercel/blob';
import { PREFIX as DEBT_PREFIX, readSubmission } from '@/lib/debt-schedule/storage';
import { PREFIX as TAX_PREFIX } from '@/lib/tax-returns/constants';
import { readSubmission as readTaxSubmission } from '@/lib/tax-returns/storage';

/*
 * SERVER-ONLY. Submissions that never reached GoHighLevel, for
 * /admin/failed-syncs. Both forms leave a `ghl-failed.json` marker in the
 * private Blob store when the GHL step fails:
 *
 *   debt-schedules/<uuid>/ghl-failed.json            next to the PDF + submission.json
 *   funding-applications/<docId>/ghl-failed.json     time + step + SignWell id ONLY
 *   tax-returns/<uuid>/ghl-failed.json               next to the files + submission.json
 *
 * The funding marker deliberately holds nothing the applicant typed: that
 * flow stores nothing on our side (SignWell holds the document), and staff
 * look the applicant up in SignWell by document id.
 *
 * All three prefixes are swept after RETENTION_DAYS by the debt-schedule cleanup cron.
 */

export const FUNDING_PREFIX = 'funding-applications/';
const MARKER = 'ghl-failed.json';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type FailureKind = 'debt-schedule' | 'funding-application' | 'tax-returns';
export const FAILURE_KINDS: FailureKind[] = ['debt-schedule', 'funding-application', 'tax-returns'];

export type SyncFailure = {
  kind: FailureKind;
  id: string;
  at: Date;
  stage: string;
  /* Debt schedules and tax returns: who it was, from submission.json. */
  contact?: { name: string; business: string; email: string };
};

const PREFIXES: Record<FailureKind, string> = {
  'debt-schedule': DEBT_PREFIX,
  'funding-application': FUNDING_PREFIX,
  'tax-returns': TAX_PREFIX
};
const prefixFor = (kind: FailureKind) => PREFIXES[kind];

export async function markFundingGhlFailed(documentId: string, stage: string) {
  await put(`${FUNDING_PREFIX}${documentId}/${MARKER}`, JSON.stringify({ at: new Date().toISOString(), stage }), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json'
  });
}

async function markers(prefix: string) {
  const found: { id: string; url: string; uploadedAt: Date }[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    for (const b of page.blobs) {
      const [id, file] = b.pathname.slice(prefix.length).split('/');
      if (file === MARKER) found.push({ id, url: b.url, uploadedAt: b.uploadedAt });
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return found;
}

/* Cheap: one listing per prefix, no file reads. For the /admin banner. */
export async function countSyncFailures(): Promise<number> {
  const counts = await Promise.all(FAILURE_KINDS.map(async (k) => (await markers(prefixFor(k))).length));
  return counts.reduce((a, b) => a + b, 0);
}

/* Newest first. Reads each marker for its step, and each saved submission for who it was. */
export async function listSyncFailures(): Promise<SyncFailure[]> {
  const all = await Promise.all(
    FAILURE_KINDS.map(async (kind) =>
      Promise.all(
        (await markers(prefixFor(kind))).map(async (m): Promise<SyncFailure> => {
          const marker = await readMarker(kind, m.id);
          const failure: SyncFailure = { kind, id: m.id, at: m.uploadedAt, stage: marker?.stage ?? 'unknown' };
          if (kind === 'debt-schedule') {
            const sub = await readSubmission(m.id);
            if (sub) failure.contact = { name: sub.data.contactName, business: sub.data.businessName, email: sub.data.email };
          } else if (kind === 'tax-returns') {
            const sub = await readTaxSubmission(m.id);
            if (sub) failure.contact = { name: sub.contact.contactName, business: sub.contact.businessName, email: sub.contact.email };
          }
          return failure;
        })
      )
    )
  );
  return all.flat().sort((a, b) => b.at.getTime() - a.at.getTime());
}

async function readMarker(kind: FailureKind, id: string): Promise<{ stage?: string } | null> {
  const result = await get(`${prefixFor(kind)}${id}/${MARKER}`, { access: 'private' });
  return result && result.statusCode === 200 ? new Response(result.stream).json() : null;
}

/* Removes the marker only - saved files and data stay until the cron. */
export async function clearSyncFailure(kind: FailureKind, id: string) {
  if (!UUID.test(id)) throw new Error('Invalid submission id');
  await del(`${prefixFor(kind)}${id}/${MARKER}`);
}

export const isSubmissionId = (id: string) => UUID.test(id);
