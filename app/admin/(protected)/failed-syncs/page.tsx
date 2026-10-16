import { requireAdminUser } from '@/lib/admin/access';
import { signedPdfUrl } from '@/lib/debt-schedule/signed-link';
import { SITE_URL } from '@/lib/site';
import { listSyncFailures } from '@/lib/sync-failures';
import type { SyncFailure } from '@/lib/sync-failures';
import { formatWhen } from '../format';
import { resolveFailure, retrySync } from './actions';

/* /admin/failed-syncs — submissions that never reached GoHighLevel. Admin only. */

const smallButton =
  'rounded-md px-3 py-1.5 text-sm font-medium ring-1 ring-line hover:bg-ivory focus-visible:outline-2 focus-visible:outline-blue';

const KIND_LABEL: Record<SyncFailure['kind'], string> = {
  'debt-schedule': 'Debt schedule',
  'funding-application': 'Funding application',
  'tax-returns': 'Tax returns'
};

const STEP: Record<string, string> = { upsert: 'creating the contact', tag: 'adding the tag', note: 'adding the note' };

export default async function FailedSyncsPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireAdminUser('admin');
  const ok = typeof searchParams.ok === 'string' ? searchParams.ok : null;
  const error = typeof searchParams.error === 'string' ? searchParams.error : null;

  let failures: SyncFailure[] | null = null;
  try {
    failures = await listSyncFailures();
  } catch (e) {
    console.error(`[admin] failed-syncs list - ${e instanceof Error ? e.message : 'unknown error'}`);
  }

  return (
    <>
      <h1 className="font-heading text-3xl font-semibold text-navy-deep">Failed syncs</h1>
      <p className="mt-2 max-w-2xl text-slate">
        Submissions that were saved but never reached GoHighLevel. The client saw a normal confirmation, so
        nobody else knows about these. Retry a debt schedule, or add the contact by hand and mark it resolved.
        Entries disappear on their own after 45 days.
      </p>

      {(ok || error) && (
        <p
          role={error ? 'alert' : 'status'}
          className={`mt-6 rounded-lg p-3 text-sm ring-1 ${
            error ? 'bg-red-50 text-red-800 ring-red-200' : 'bg-green-50 text-green-800 ring-green-200'
          }`}
        >
          {error ?? ok}
        </p>
      )}

      {failures === null ? (
        <p role="alert" className="mt-8 rounded-lg bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-200">
          Couldn&rsquo;t read the list from storage. Reload in a minute; if it keeps failing, check the Blob
          integration in Vercel.
        </p>
      ) : failures.length === 0 ? (
        <p className="mt-8 rounded-xl bg-white p-6 text-slate ring-1 ring-line">Nothing failed. Every submission reached GoHighLevel.</p>
      ) : (
        <ul className="mt-8 grid gap-4">
          {failures.map((f) => (
            <li key={`${f.kind}/${f.id}`} className="rounded-xl bg-white p-5 ring-1 ring-line">
              <div className="text-sm text-slate">
                {formatWhen(f.at)} · <span className="font-medium text-ink">
                  {KIND_LABEL[f.kind]}
                </span>{' '}
                · failed while {STEP[f.stage] ?? f.stage}
              </div>

              {f.kind !== 'funding-application' ? (
                <p className="mt-2 text-ink">
                  {f.contact ? (
                    <>
                      <span className="font-semibold">{f.contact.name}</span> · {f.contact.business} ·{' '}
                      <a href={`mailto:${f.contact.email}`} className="text-blue underline">
                        {f.contact.email}
                      </a>
                    </>
                  ) : (
                    <span className="text-slate">The saved submission is no longer available.</span>
                  )}
                </p>
              ) : (
                <p className="mt-2 text-ink">
                  SignWell document <code className="rounded bg-ivory px-1.5 py-0.5 text-sm">{f.id}</code> — find the
                  applicant in SignWell by this id.
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {f.kind === 'tax-returns' && f.contact && (
                  <form action={retrySync}>
                    <input type="hidden" name="id" value={f.id} />
                    <input type="hidden" name="kind" value={f.kind} />
                    <button type="submit" className={`${smallButton} bg-navy-deep text-white hover:bg-navy-soft`}>
                      Retry sync
                    </button>
                  </form>
                )}
                {f.kind === 'debt-schedule' && f.contact && (
                  <>
                    <a
                      href={signedPdfUrl(SITE_URL, f.id, Date.now() + 60 * 60 * 1000)}
                      className={smallButton}
                      target="_blank"
                      rel="noopener"
                    >
                      Download PDF
                    </a>
                    <form action={retrySync}>
                      <input type="hidden" name="id" value={f.id} />
                      <button type="submit" className={`${smallButton} bg-navy-deep text-white hover:bg-navy-soft`}>
                        Retry sync
                      </button>
                    </form>
                  </>
                )}
                <form action={resolveFailure}>
                  <input type="hidden" name="id" value={f.id} />
                  <input type="hidden" name="kind" value={f.kind} />
                  <button type="submit" className={smallButton}>
                    Mark resolved
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
