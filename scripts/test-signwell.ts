/*
 * Checks the SignWell template against lib/funding-application/fields.ts.
 *
 *   npx tsx scripts/test-signwell.ts
 *     Prints every field API ID the template needs (what to type into SignWell).
 *
 *   npx tsx --env-file=.env.local scripts/test-signwell.ts --check
 *     Reads the template from SignWell and compares it with the form: missing
 *     or misspelled API IDs, the signer's name, field types and assignments,
 *     and whether a signature and a date-signed field exist.
 *
 *   npx tsx --env-file=.env.local scripts/test-signwell.ts --send you@kibadvisors.com
 *     Creates a TEST MODE document (watermarked, not billed, not binding) in
 *     which every box is filled with its own API ID, and emails it to that
 *     address. Open it and check each label sits in the right box: a box that's
 *     empty means its API ID in the template doesn't match.
 *     Needs SIGNWELL_API_KEY in .env.local and SIGNWELL_TEMPLATE_ID set.
 */
import { SIGNWELL_PLACEHOLDER, SIGNWELL_TEMPLATE_ID } from '../lib/funding-application/constants';
import { ALL_FIELDS, FIELD_BY_KEY } from '../lib/funding-application/fields';

/* Every text field the form fills. owner1_printed_name isn't here: it's
   SignWell's auto-fill Name field, filled from the signer's name. */
const ids = ALL_FIELDS.map((f) => f.key);

/* Fields the form can leave blank. If one of these is required in the
   template, the applicant can't finish signing without typing into it. */
const canBeBlank = (id: string) => FIELD_BY_KEY.get(id)?.required === false;

type TemplateField = { api_id: string; type: string; required: boolean; placeholder_name?: string; page: number };

async function check(key: string) {
  const res = await fetch(`https://www.signwell.com/api/v1/document_templates/${SIGNWELL_TEMPLATE_ID}`, {
    headers: { 'X-Api-Key': key, Accept: 'application/json' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} reading the template`);
  const t = (await res.json()) as { name: string; fields: TemplateField[][]; placeholders: { name: string }[] };
  const fields = t.fields.flat();
  const byId = new Map(fields.map((f) => [f.api_id, f]));
  const problems: string[] = [];

  console.log(`Template: ${t.name}`);
  console.log(`Signers: ${t.placeholders.map((p) => p.name).join(', ')}`);
  if (!t.placeholders.some((p) => p.name === SIGNWELL_PLACEHOLDER)) {
    problems.push(`No signer named "${SIGNWELL_PLACEHOLDER}" (names must match exactly).`);
  }
  if (t.placeholders.length > 1) problems.push(`More than one signer: only "${SIGNWELL_PLACEHOLDER}" signs. Remove the others.`);

  const missing = ids.filter((id) => !byId.has(id));
  const extra = fields.filter((f) => f.type === 'text' && !ids.includes(f.api_id)).map((f) => f.api_id);
  for (const id of missing) problems.push(`Missing text field: ${id}`);
  for (const id of extra) problems.push(`Text field with an API ID the form doesn't send: ${id} (typo?)`);
  for (const id of ids) {
    const f = byId.get(id);
    if (!f) continue;
    if (f.type !== 'text') problems.push(`${id} is a ${f.type} field; it should be text.`);
    if (f.required && canBeBlank(id)) problems.push(`${id} is required; it should be optional (it's often left blank).`);
    if (f.placeholder_name && f.placeholder_name !== SIGNWELL_PLACEHOLDER) {
      problems.push(`${id} is assigned to "${f.placeholder_name}"; it should be "${SIGNWELL_PLACEHOLDER}".`);
    }
  }
  const printed = byId.get('owner1_printed_name');
  if (!printed) problems.push('No owner1_printed_name field (an auto-fill Name field works best).');
  if (!fields.some((f) => f.type === 'signature')) problems.push('No signature field.');
  if (!fields.some((f) => f.type.includes('date') && !ids.includes(f.api_id))) problems.push('No date-signed field.');

  console.log(`Fields: ${fields.length} (${ids.length - missing.length}/${ids.length} of the form's IDs found)\n`);
  console.log(problems.length ? problems.map((p) => `✗ ${p}`).join('\n') : '✓ Template matches the form.');
}

async function main() {
  if (process.argv.includes('--check')) {
    const key = process.env.SIGNWELL_API_KEY;
    if (!key) throw new Error('SIGNWELL_API_KEY is not set (use --env-file=.env.local)');
    return check(key);
  }
  const i = process.argv.indexOf('--send');
  if (i === -1) {
    console.log(`${ids.length} text-field API IDs:\n`);
    for (const id of ids) console.log(id);
    return;
  }

  const email = process.argv[i + 1];
  const key = process.env.SIGNWELL_API_KEY;
  if (!email) throw new Error('Usage: --send <email>');
  if (!key) throw new Error('SIGNWELL_API_KEY is not set (use --env-file=.env.local)');
  if (!SIGNWELL_TEMPLATE_ID) throw new Error('Set SIGNWELL_TEMPLATE_ID in lib/funding-application/constants.ts first');

  const res = await fetch('https://www.signwell.com/api/v1/document_templates/documents', {
    method: 'POST',
    headers: { 'X-Api-Key': key, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      test_mode: true,
      template_id: SIGNWELL_TEMPLATE_ID,
      name: 'TEMPLATE CHECK — every box shows its own API ID',
      draft: false,
      recipients: [{ id: '1', placeholder_name: SIGNWELL_PLACEHOLDER, name: 'owner1_printed_name', email }],
      template_fields: ids.map((id) => ({ api_id: id, value: id }))
    })
  });
  const body = await res.text();
  if (!res.ok) {
    /* Safe to print here: the values are just the API IDs. */
    console.error(`HTTP ${res.status}\n${body}`);
    process.exit(1);
  }
  console.log(`Created test document ${JSON.parse(body).id} - check ${email}.`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
