import 'server-only';
import { del, get, list, put } from '@vercel/blob';
import { PREFIX as DEBT_PREFIX, readSubmission } from '@/lib/debt-schedule/storage';

/*
 * SERVER-ONLY. Submissions that never reached GoHighLevel, for
 * /admin/failed-syncs. Both forms leave a `ghl-failed.json` marker in the
 * private Blob store when the GHL step fails:
 *
 *   debt-schedules/<uuid>/ghl-failed.json            next to the PDF + submission.json
 *   funding-applications/<docId>/ghl-failed.json     time + step + SignWell id ONLY
 *
 * The funding marker deliberately holds nothing the applicant typed: that
 * flow stores nothing on our side (SignWell holds the document), and staff
 * look the applicant up in SignWell by document id.
 *
 * Both prefixes are swept after RETENTION_DAYS by the debt-schedule cleanup cron.
 */

export const FUNDING_PREFIX = 'funding-applications/';
const MARKER = 'ghl-failed.json';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type FailureKind = 'debt-schedule' | 'funding-application';

export type SyncFailure = {
  kind: FailureKind;
  id: string;
  at: Date;
  stage: string;
  /* Debt schedules only: who it was, from submission.json. */
  contact?: { name: string; business: string; email: string };
};

const prefixFor = (kind: FailureKind) => (kind === 'debt-schedule' ? DEBT_PREFIX : FUNDING_PREFIX);

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
  const [debt, funding] = await Promise.all([markers(DEBT_PREFIX), markers(FUNDING_PREFIX)]);
  return debt.length + funding.length;
}

/* Newest first. Reads each marker for its step, and each debt submission for who it was. */
export async function listSyncFailures(): Promise<SyncFailure[]> {
  const kinds: FailureKind[] = ['debt-schedule', 'funding-application'];
  const all = await Promise.all(
    kinds.map(async (kind) =>
      Promise.all(
        (await markers(prefixFor(kind))).map(async (m): Promise<SyncFailure> => {
          const marker = await readMarker(kind, m.id);
          const failure: SyncFailure = { kind, id: m.id, at: m.uploadedAt, stage: marker?.stage ?? 'unknown' };
          if (kind === 'debt-schedule') {
            const sub = await readSubmission(m.id);
            if (sub) failure.contact = { name: sub.data.contactName, business: sub.data.businessName, email: sub.data.email };
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

/* Removes the marker only - the debt schedule's PDF and data stay until the cron. */
export async function clearSyncFailure(kind: FailureKind, id: string) {
  if (!UUID.test(id)) throw new Error('Invalid submission id');
  await del(`${prefixFor(kind)}${id}/${MARKER}`);
}

export const isSubmissionId = (id: string) => UUID.test(id);
