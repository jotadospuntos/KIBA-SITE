import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CLIENT_LINK_TTL_MS, RETENTION_DAYS } from '@/lib/debt-schedule/constants';
import { MissingSecretError, missingSubmitSecrets } from '@/lib/debt-schedule/env';
import { fillDebtSchedule } from '@/lib/debt-schedule/fill-pdf';
import { GhlError, addSummaryNote, tagContact, upsertContact } from '@/lib/debt-schedule/ghl';
import { debtScheduleSchema } from '@/lib/debt-schedule/schema';
import { signedPdfUrl } from '@/lib/debt-schedule/signed-link';
import { markGhlFailed, saveSubmission } from '@/lib/debt-schedule/storage';
import { verifyTurnstile } from '@/lib/debt-schedule/turnstile';

/*
 * POST /api/debt-schedule — the whole delivery path, in a deliberate order:
 *
 *   1. Turnstile        (no IP rate limit: decided, Turnstile alone for now)
 *   2. re-validate with the shared zod schema - never trust the client
 *   3. fill the PDF
 *   4. save the PDF + raw JSON to private Blob   <- BEFORE GoHighLevel, so a
 *      GHL outage can never lose a submission
 *   5. GoHighLevel: upsert contact + fields, tag, note
 *   6. return a short-lived signed download link
 *
 * If step 5 fails the client still gets a success and their PDF - their data
 * is safe in Blob - and a ghl-failed.json marker is written next to it so the
 * sync can be replayed. The failure is logged by submission id only.
 *
 * NEVER LOG THE REQUEST BODY, or anything derived from it. Errors are logged
 * as name + message, and every message in lib/debt-schedule is written to
 * carry no client data.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

type Fail = { error: 'invalid' | 'bot' | 'server'; message: string };

function fail(status: number, error: Fail['error'], message: string) {
  return NextResponse.json<Fail>({ error, message }, { status });
}

function logError(where: string, e: unknown, id?: string) {
  const err = e instanceof Error ? `${e.name}: ${e.message}` : 'unknown error';
  console.error(`[debt-schedule] ${where}${id ? ` (${id})` : ''} - ${err}`);
}

export async function POST(req: NextRequest) {
  const missing = missingSubmitSecrets();
  if (missing.length) {
    /* Names only, never values. Env vars reach a deployment only when it is
       (re)built, so "added it in Vercel" still needs a redeploy. */
    console.error(`[debt-schedule] config - missing environment variable(s): ${missing.join(', ')}`);
    return fail(500, 'server', 'Something went wrong on our end.');
  }

  let body: { schedule?: unknown; turnstileToken?: unknown };
  try {
    body = await req.json();
  } catch {
    return fail(400, 'invalid', 'The form data could not be read.');
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  try {
    const human = await verifyTurnstile(String(body.turnstileToken ?? ''), ip);
    if (!human) return fail(403, 'bot', 'We couldn’t verify this submission. Please try again.');
  } catch (e) {
    logError('turnstile', e);
    return fail(500, 'server', 'Something went wrong on our end.');
  }

  const parsed = debtScheduleSchema.safeParse(body.schedule);
  if (!parsed.success) {
    return fail(400, 'invalid', 'Some of the information didn’t pass our checks. Please review and try again.');
  }
  const data = { ...parsed.data, debts: parsed.data.hasNoDebt ? [] : parsed.data.debts };
  const totals = data.debts.reduce(
    (t, d) => ({ balance: t.balance + d.currentBalance, payment: t.payment + d.monthlyPayment }),
    { balance: 0, payment: 0 }
  );

  const id = randomUUID();
  const origin = req.nextUrl.origin;
  let staffUrl: string;
  let downloadUrl: string;
  try {
    /* Signed first: it can't fail after the files exist. The staff link lives
       as long as the file does. */
    staffUrl = signedPdfUrl(origin, id, Date.now() + RETENTION_DAYS * 24 * 60 * 60 * 1000);
    downloadUrl = signedPdfUrl(origin, id, Date.now() + CLIENT_LINK_TTL_MS);
    const pdf = await fillDebtSchedule(data);
    await saveSubmission(id, pdf, data);
  } catch (e) {
    logError(e instanceof MissingSecretError ? 'config' : 'pdf/storage', e, id);
    return fail(500, 'server', 'Something went wrong on our end.');
  }

  let stage: GhlError['stage'] = 'upsert';
  try {
    const contactId = await upsertContact(data, staffUrl, totals);
    stage = 'tag';
    await tagContact(contactId);
    stage = 'note';
    await addSummaryNote(contactId, data, staffUrl, totals);
  } catch (e) {
    logError(`ghl ${stage}`, e, id);
    try {
      await markGhlFailed(id, stage);
    } catch (e2) {
      logError('ghl-failed marker', e2, id);
    }
  }

  return NextResponse.json({ downloadUrl });
}
