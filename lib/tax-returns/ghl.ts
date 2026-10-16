import { RETENTION_DAYS } from '@/lib/debt-schedule/constants';
import { GHL_LOCATION_ID, ghl, splitName } from '@/lib/debt-schedule/ghl';
import type { GhlError } from '@/lib/debt-schedule/ghl';
import type { TaxContact } from './schema';

/*
 * SERVER-ONLY. Same three steps as the debt schedule: upsert the contact by
 * email, tag it, add a note - here the note carries one signed link per file.
 * No custom fields (decided by the human). The files themselves never go to
 * GHL: they carry SSNs.
 */

export const GHL_TAG = 'Tax Returns Submitted';

type Link = { name: string; url: string };

export async function syncToGhl(
  contact: TaxContact,
  links: Link[]
): Promise<{ stage: GhlError['stage']; error: unknown } | null> {
  let stage: GhlError['stage'] = 'upsert';
  try {
    const json = await ghl('upsert', '/contacts/upsert', {
      locationId: GHL_LOCATION_ID,
      ...splitName(contact.contactName),
      email: contact.email,
      ...(contact.phone ? { phone: contact.phone } : {}),
      companyName: contact.businessName,
      source: 'tax-returns'
    });
    const contactId = (json.contact as { id?: string } | undefined)?.id;
    if (!contactId) return { stage, error: new Error('GoHighLevel upsert returned no contact id') };

    stage = 'tag';
    await ghl('tag', `/contacts/${contactId}/tags`, { tags: [GHL_TAG] });

    stage = 'note';
    const lines = [
      `Tax returns uploaded — ${contact.businessName}`,
      `${links.length} file${links.length === 1 ? '' : 's'}:`,
      ...links.map((l) => `• ${l.name}: ${l.url}`),
      '',
      `(The links stop working when the files are deleted, ${RETENTION_DAYS} days after upload.)`
    ];
    await ghl('note', `/contacts/${contactId}/notes`, { body: lines.join('\n') });
    return null;
  } catch (error) {
    return { stage, error };
  }
}
