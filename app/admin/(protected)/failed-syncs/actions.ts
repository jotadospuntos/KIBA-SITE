'use server';

import { redirect } from 'next/navigation';
import { requireAdminUser } from '@/lib/admin/access';
import { audit } from '@/lib/admin/audit';
import { RETENTION_DAYS } from '@/lib/debt-schedule/constants';
import { syncToGhl } from '@/lib/debt-schedule/ghl';
import { debtTotals } from '@/lib/debt-schedule/schema';
import { signedPdfUrl } from '@/lib/debt-schedule/signed-link';
import { readSubmission } from '@/lib/debt-schedule/storage';
import { SITE_URL } from '@/lib/site';
import { clearSyncFailure, isSubmissionId } from '@/lib/sync-failures';
import type { FailureKind } from '@/lib/sync-failures';

/*
 * Admin-only, re-checked in each action (a server action is a public POST
 * endpoint). Results come back as ?ok= / ?error=, like /admin/users.
 * Audit entries carry the submission id only, never what the client typed.
 */

function done(param: 'ok' | 'error', message: string): never {
  redirect(`/admin/failed-syncs?${param}=${encodeURIComponent(message)}`);
}

/* Re-runs the three GHL steps from the saved submission.json. */
export async function retrySync(formData: FormData) {
  const me = await requireAdminUser('admin');
  const id = String(formData.get('id') ?? '');
  if (!isSubmissionId(id)) done('error', 'That submission id isn’t valid.');

  const sub = await readSubmission(id);
  if (!sub) done('error', 'The saved submission is gone (deleted after 45 days?). Mark it resolved instead.');

  const data = { ...sub.data, debts: sub.data.hasNoDebt ? [] : sub.data.debts };
  /* Same expiry the original staff link had: as long as the file exists. */
  const staffUrl = signedPdfUrl(SITE_URL, id, Date.parse(sub.receivedAt) + RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const failure = await syncToGhl(data, staffUrl, debtTotals(data.debts));
  if (failure) {
    const why = failure.error instanceof Error ? failure.error.message : 'unknown error';
    done('error', `GoHighLevel failed again at the ${failure.stage} step (${why}). Try later, or add the contact by hand.`);
  }

  await clearSyncFailure('debt-schedule', id);
  await audit({ actorEmail: me.email, action: 'sync.retry', targetType: 'debt-schedule', targetId: id });
  done('ok', `${data.contactName} is in GoHighLevel now.`);
}

/* For funding applications, or anything fixed by hand in GHL. */
export async function resolveFailure(formData: FormData) {
  const me = await requireAdminUser('admin');
  const id = String(formData.get('id') ?? '');
  const kind = formData.get('kind');
  if (!isSubmissionId(id) || (kind !== 'debt-schedule' && kind !== 'funding-application')) {
    done('error', 'That submission isn’t valid.');
  }
  await clearSyncFailure(kind as FailureKind, id);
  await audit({ actorEmail: me.email, action: 'sync.resolve', targetType: kind as string, targetId: id });
  done('ok', 'Marked resolved.');
}
