import {
  SIGNING_EMAIL_DELAY_MIN,
  SIGNWELL_CC,
  SIGNWELL_PLACEHOLDER,
  SIGNWELL_TEMPLATE_ID,
  SIGNWELL_TEST_MODE
} from './constants';
import { secret } from './env';
import { ALL_FIELDS, toSignwellValue } from './fields';
import type { Application } from './fields';

/*
 * SERVER-ONLY SignWell client (https://developers.signwell.com). Two calls:
 *
 *   createApplicationDocument  POST /api/v1/document_templates/documents
 *     One document from the template, every box pre-filled by API ID, sent
 *     straight to signing (draft: false). Embedded signing, so the applicant
 *     signs on our page; send_email + a delay means SignWell also emails them
 *     the link if they haven't finished by then. embedded_signing_notifications
 *     is what makes SignWell send the completed copy to the CC list - without
 *     it, embedded documents notify nobody.
 *
 *   fetchCompletedPdf          GET /api/v1/documents/{id}/completed_pdf
 *     For the staff link. 400 until the document has been signed.
 *
 * NEVER LOG A REQUEST OR RESPONSE BODY. Requests carry SSNs, and SignWell's
 * error bodies can echo field values back. Errors carry the HTTP status and,
 * for a 422, the NAMES of the offending keys - enough to spot a template API
 * ID mismatch, and nothing a client typed.
 */

const BASE = 'https://www.signwell.com/api/v1';

export class SignwellError extends Error {
  constructor(
    public stage: 'create' | 'pdf',
    public status: number,
    detail = ''
  ) {
    super(`SignWell ${stage} failed with HTTP ${status}${detail ? ` (keys: ${detail})` : ''}`);
    this.name = 'SignwellError';
  }
}

function headers() {
  return { 'X-Api-Key': secret('SIGNWELL_API_KEY'), 'Content-Type': 'application/json', Accept: 'application/json' };
}

/* Key names only, from a 422 body - never values. */
async function errorKeys(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { errors?: unknown; meta?: { messages?: unknown } };
    const errors = body.errors;
    if (errors && typeof errors === 'object') return Object.keys(errors).join(', ');
  } catch {
    /* not JSON */
  }
  return '';
}

/* Every non-blank field, by API ID. Not sent: owner1_printed_name, which is
   SignWell's own auto-fill Name field, filled from the recipient name. */
export function templateFields(app: Application) {
  return ALL_FIELDS.flatMap((f) => {
    const value = toSignwellValue(f, app.values[f.key] ?? '');
    return value ? [{ api_id: f.key, value }] : [];
  });
}

export async function createApplicationDocument(
  app: Application
): Promise<{ documentId: string; signingUrl: string }> {
  if (!SIGNWELL_TEMPLATE_ID) throw new Error('SIGNWELL_TEMPLATE_ID is not set in lib/funding-application/constants.ts');

  const v = app.values;
  const signer = `${v.owner1_first_name} ${v.owner1_last_name}`.trim();
  const res = await fetch(`${BASE}/document_templates/documents`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      test_mode: SIGNWELL_TEST_MODE,
      template_id: SIGNWELL_TEMPLATE_ID,
      name: `KIBA Lending Application — ${v.business_legal_name}`,
      draft: false,
      embedded_signing: true,
      embedded_signing_notifications: true,
      recipients: [
        {
          id: '1',
          placeholder_name: SIGNWELL_PLACEHOLDER,
          name: signer,
          email: v.owner1_email,
          send_email: true,
          send_email_delay: SIGNING_EMAIL_DELAY_MIN
        }
      ],
      template_fields: templateFields(app),
      copied_contacts: SIGNWELL_CC
    })
  });
  if (!res.ok) throw new SignwellError('create', res.status, res.status === 422 ? await errorKeys(res) : '');

  const doc = (await res.json()) as { id?: string; recipients?: { id?: string; embedded_signing_url?: string | null }[] };
  const signingUrl = doc.recipients?.find((r) => r.id === '1')?.embedded_signing_url ?? doc.recipients?.[0]?.embedded_signing_url;
  if (!doc.id || !signingUrl) throw new SignwellError('create', 200, 'no id or embedded_signing_url');
  return { documentId: doc.id, signingUrl };
}

/* 'pending' while unsigned (SignWell answers 400 until the PDF exists). */
export async function fetchCompletedPdf(id: string): Promise<Response | 'pending' | 'missing'> {
  const res = await fetch(`${BASE}/documents/${encodeURIComponent(id)}/completed_pdf?audit_page=true`, {
    headers: { 'X-Api-Key': secret('SIGNWELL_API_KEY') }
  });
  if (res.status === 400) return 'pending';
  if (res.status === 404) return 'missing';
  if (!res.ok) throw new SignwellError('pdf', res.status);
  return res;
}
