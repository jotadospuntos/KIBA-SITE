import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { missingSubmitSecrets } from '@/lib/debt-schedule/env';
import { verifyTurnstile } from '@/lib/debt-schedule/turnstile';
import { UPLOAD_TICKET_MS } from '@/lib/tax-returns/constants';
import { taxContactSchema } from '@/lib/tax-returns/schema';
import { uploadTicket } from '@/lib/tax-returns/signed-link';
import { saveContact } from '@/lib/tax-returns/storage';

/*
 * POST /api/tax-returns — step 1 of 3 of a tax-return upload:
 *
 *   1. here: Turnstile + contact details -> submission.json, and an upload ticket
 *   2. /api/tax-returns/upload: one Blob client-upload token per file (ticket required)
 *   3. /api/tax-returns/finalize: check the files, then GoHighLevel
 *
 * The files go browser -> Blob directly, because a function's request body is
 * capped at 4.5 MB and a set of returns is often far bigger.
 *
 * NEVER LOG THE REQUEST BODY.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const fail = (status: number, message: string) => NextResponse.json({ message }, { status });

export async function POST(req: NextRequest) {
  const missing = missingSubmitSecrets();
  if (missing.length) {
    console.error(`[tax-returns] config - missing environment variable(s): ${missing.join(', ')}`);
    return fail(500, 'Something went wrong on our end.');
  }

  const body = (await req.json().catch(() => null)) as { contact?: unknown; turnstileToken?: unknown } | null;
  if (!body) return fail(400, 'The form data could not be read.');

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  try {
    if (!(await verifyTurnstile(String(body.turnstileToken ?? ''), ip))) {
      return fail(403, 'We couldn’t verify this submission. Please try again.');
    }
  } catch (e) {
    console.error(`[tax-returns] turnstile - ${e instanceof Error ? e.message : 'unknown error'}`);
    return fail(500, 'Something went wrong on our end.');
  }

  const parsed = taxContactSchema.safeParse(body.contact);
  if (!parsed.success) return fail(400, 'Some of the information didn’t pass our checks. Please review and try again.');

  const id = randomUUID();
  try {
    await saveContact(id, parsed.data);
  } catch (e) {
    console.error(`[tax-returns] storage (${id}) - ${e instanceof Error ? e.message : 'unknown error'}`);
    return fail(500, 'Something went wrong on our end.');
  }
  return NextResponse.json({ id, ticket: uploadTicket(id, Date.now() + UPLOAD_TICKET_MS) });
}
