import { RETENTION_DAYS } from './constants';
import { secret } from './env';
import { formatDate, formatMoney } from './format';
import type { DebtSchedule } from './schema';

/*
 * SERVER-ONLY GoHighLevel v2 API client for the debt schedule. NOT lib/ghl.ts,
 * which is the front-end calendar/form embed config and unrelated.
 *
 * Every request: base https://services.leadconnectorhq.com, `Authorization:
 * Bearer <Private Integration token>`, `Version: 2021-07-28`, and a locationId
 * on writes. A missing Version header or locationId comes back as an error
 * that doesn't say which is missing.
 *
 * Three calls per submission, well inside GHL's 100 requests / 10s:
 *   1. upsert the contact by email, with the five custom fields
 *   2. add the tag (a separate call, because tags on upsert can REPLACE the
 *      contact's existing tags rather than add to them)
 *   3. add a readable summary note
 *
 * Never log a request or response body here - both carry the client's data.
 */

const BASE = 'https://services.leadconnectorhq.com';

/* Not secret - the token is. Supplied by the business from its GHL sub-account. */
export const GHL_LOCATION_ID = 'SmdgjvInJlHiM1usPQXA';

const FIELD_IDS = {
  pdfUrl: 'XxkAHP7lCpJJUMEhD2FK', // Debt Schedule PDF (text/URL)
  totalBalance: 'LxbwcjLRnpIYfaJ7o4V0', // Total Debt Balance (currency)
  totalPayment: 'eN7KwMiWG2GJiNVJDuJ1', // Total Monthly Debt Payment (currency)
  data: 'O4gg61DMMgcpKHs2pr1A', // Debt Schedule Data (large text)
  submittedOn: 'XgH5uKzBE7ia24WNikrA' // Debt Schedule Submitted On (date)
} as const;

export const GHL_TAG = 'Debt Schedule Submitted';

export class GhlError extends Error {
  constructor(
    public stage: 'upsert' | 'tag' | 'note',
    public status: number
  ) {
    /* Status only: GHL's error bodies can echo the submitted contact back. */
    super(`GoHighLevel ${stage} failed with HTTP ${status}`);
    this.name = 'GhlError';
  }
}

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

function splitName(full: string) {
  const [first, ...rest] = full.trim().split(/\s+/);
  return { firstName: first ?? '', lastName: rest.join(' ') };
}

type Totals = { balance: number; payment: number };

export async function upsertContact(data: DebtSchedule, pdfUrl: string, totals: Totals): Promise<string> {
  const json = await ghl('upsert', '/contacts/upsert', {
    locationId: GHL_LOCATION_ID,
    ...splitName(data.contactName),
    email: data.email,
    ...(data.phone ? { phone: data.phone } : {}),
    companyName: data.businessName,
    source: 'debt-schedule',
    customFields: [
      { id: FIELD_IDS.pdfUrl, field_value: pdfUrl },
      { id: FIELD_IDS.totalBalance, field_value: Math.round(totals.balance * 100) / 100 },
      { id: FIELD_IDS.totalPayment, field_value: Math.round(totals.payment * 100) / 100 },
      { id: FIELD_IDS.data, field_value: JSON.stringify(data) },
      { id: FIELD_IDS.submittedOn, field_value: new Date().toISOString().slice(0, 10) }
    ]
  });
  const id = (json.contact as { id?: string } | undefined)?.id;
  if (!id) throw new GhlError('upsert', 200);
  return id;
}

export async function tagContact(contactId: string) {
  await ghl('tag', `/contacts/${contactId}/tags`, { tags: [GHL_TAG] });
}

export async function addSummaryNote(contactId: string, data: DebtSchedule, pdfUrl: string, totals: Totals) {
  const lines = [
    `Debt schedule submitted — ${data.businessName}`,
    `As of ${formatDate(data.asOfDate)} · ${data.hasNoDebt ? 'No business debt' : `${data.debts.length} debt${data.debts.length === 1 ? '' : 's'}`}`,
    `Total open balances: ${formatMoney(totals.balance)}`,
    `Total monthly payments: ${formatMoney(totals.payment)}`,
    '',
    `PDF: ${pdfUrl}`,
    `(The link stops working when the file is deleted, ${RETENTION_DAYS} days after submission.)`
  ];
  await ghl('note', `/contacts/${contactId}/notes`, { body: lines.join('\n') });
}
