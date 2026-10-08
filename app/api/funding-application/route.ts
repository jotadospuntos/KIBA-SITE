import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { GhlError } from '@/lib/debt-schedule/ghl';
import { verifyTurnstile } from '@/lib/debt-schedule/turnstile';
import { STAFF_LINK_DAYS } from '@/lib/funding-application/constants';
import { missingSubmitSecrets } from '@/lib/funding-application/env';
import { parseApplication } from '@/lib/funding-application/fields';
import { addApplicationNote, upsertApplicant } from '@/lib/funding-application/ghl';
import { createApplicationDocument } from '@/lib/funding-application/signwell';
import { staffDocumentUrl } from '@/lib/funding-application/staff-link';

/*
 * POST /api/funding-application, in a deliberate order:
 *
 *   1. Turnstile
 *   2. re-validate with the same rules the form uses (fields.ts)
 *   3. SignWell: create the pre-filled document from the template
 *   4. GoHighLevel: upsert the applicant, add a note with the staff link
 *   5. return the embedded signing URL
 *
 * Nothing is stored on our side: SignWell holds the document, and GHL gets no
 * sensitive fields. If step 3 fails the applicant gets an error and their form
 * is still on screen. If step 4 fails they still get to sign - the document
 * exists, and SignWell CCs KIBA on completion - and the failure is logged by
 * SignWell document id so the contact can be added by hand.
 *
 * NEVER LOG THE REQUEST BODY. This one carries SSNs.
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
  console.error(`[funding-application] ${where}${id ? ` (${id})` : ''} - ${err}`);
}

export async function POST(req: NextRequest) {
  const missing = missingSubmitSecrets();
  if (missing.length) {
    console.error(
      `[funding-application] config - missing environment variable(s): ${missing.join(', ')} ` +
        `(env=${process.env.VERCEL_ENV ?? 'local'}; variables reach a deployment only when it is rebuilt)`
    );
    return fail(500, 'server', 'Something went wrong on our end.');
  }

  let body: { application?: unknown; turnstileToken?: unknown };
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

  const parsed = parseApplication(body.application);
  if (!parsed.ok) {
    return fail(400, 'invalid', 'Some of the information didn’t pass our checks. Please review and try again.');
  }
  const app = parsed.app;

  let documentId: string;
  let signingUrl: string;
  try {
    ({ documentId, signingUrl } = await createApplicationDocument(app));
  } catch (e) {
    logError('signwell', e);
    return fail(500, 'server', 'We couldn’t prepare your application for signing.');
  }

  let stage: GhlError['stage'] = 'upsert';
  try {
    const staffUrl = staffDocumentUrl(req.nextUrl.origin, documentId, Date.now() + STAFF_LINK_DAYS * 864e5);
    const contactId = await upsertApplicant(app);
    stage = 'note';
    await addApplicationNote(contactId, app, staffUrl);
  } catch (e) {
    logError(`ghl ${stage}`, e, documentId);
  }

  return NextResponse.json({ signingUrl });
}
