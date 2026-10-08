import { GHL_LOCATION_ID, GhlError } from '@/lib/debt-schedule/ghl';
import { STAFF_LINK_DAYS } from './constants';
import { secret } from './env';
import { FIELD_BY_KEY, toSignwellValue } from './fields';
import type { Application } from './fields';

/*
 * SERVER-ONLY GoHighLevel sync for the funding application: upsert the
 * applicant (owner 1) as a contact by email + cell phone, then add a note with
 * the application link. Same API conventions as lib/debt-schedule/ghl.ts.
 *
 * ONLY non-sensitive data goes to GHL: names, contact details, the business
 * name and the amount requested. No SSN, date of birth, credit score, EIN or
 * revenue - those live in SignWell, behind the link.
 */

const BASE = 'https://services.leadconnectorhq.com';

async function ghl(stage: GhlError['stage'], path: string, body: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret('GHL_PRIVATE_TOKEN')}`,
      Version: '2021-07-28',
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new GhlError(stage, res.status);
  return res.json() as Promise<Record<string, unknown>>;
}

/* +1XXXXXXXXXX - GHL matches contacts on phone, and E.164 avoids duplicates. */
function e164(phone: string) {
  const d = phone.replace(/\D/g, '');
  return d.length === 10 ? `+1${d}` : undefined;
}

export async function upsertApplicant(app: Application): Promise<string> {
  const v = app.values;
  const phone = e164(v.owner1_cell_phone ?? '');
  const json = await ghl('upsert', '/contacts/upsert', {
    locationId: GHL_LOCATION_ID,
    firstName: v.owner1_first_name,
    lastName: v.owner1_last_name,
    email: v.owner1_email,
    ...(phone ? { phone } : {}),
    companyName: v.business_legal_name,
    source: 'funding-application'
  });
  const id = (json.contact as { id?: string } | undefined)?.id;
  if (!id) throw new GhlError('upsert', 200);
  return id;
}

export async function addApplicationNote(contactId: string, app: Application, staffUrl: string) {
  const v = app.values;
  const amount = toSignwellValue(FIELD_BY_KEY.get('funding_amount')!, v.funding_amount ?? '');
  const lines = [
    `Funding application submitted — ${v.business_legal_name}${v.business_dba ? ` (DBA ${v.business_dba})` : ''}`,
    `Amount requested: ${amount}`,
    `Use of funds: ${v.use_of_funds}`,
    '',
    `Application (signed PDF): ${staffUrl}`,
    `The PDF opens once the applicant has signed in SignWell. The link works for ${STAFF_LINK_DAYS} days; after that, find the document in SignWell.`
  ];
  await ghl('note', `/contacts/${contactId}/notes`, { body: lines.join('\n') });
}
