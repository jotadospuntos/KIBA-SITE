/*
 * Self-check for the tax-return upload's security rules: tickets, staff file
 * links and the Blob path allowlist.
 *   DEBT_SCHEDULE_LINK_SECRET=x npx tsx scripts/test-tax-returns.ts
 */
import assert from 'node:assert/strict';
import { FILE_PATH, filePath, safeFileName } from '../lib/tax-returns/constants';
import { staffFileUrl, uploadTicket, verifyFileLink, verifyTicket } from '../lib/tax-returns/signed-link';

const id = '0b5f7c1e-2a3d-4e5f-8a9b-0c1d2e3f4a5b';
const later = Date.now() + 60_000;

const ticket = uploadTicket(id, later);
assert.equal(verifyTicket(ticket), id);
assert.equal(verifyTicket(uploadTicket(id, Date.now() - 1)), null, 'expired ticket');
assert.equal(verifyTicket(ticket.replace(/.$/, (c) => (c === 'A' ? 'B' : 'A'))), null, 'tampered signature');
assert.equal(verifyTicket(ticket.replace(id, id.replace('0b', '0c'))), null, 'other id');
assert.equal(verifyTicket(null), null);

const url = new URL(staffFileUrl('https://kibadvisors.com', id, '1-2024-1120S.pdf', later));
assert.deepEqual(verifyFileLink(url.searchParams), { id, name: '1-2024-1120S.pdf' });
url.searchParams.set('name', '2-other.pdf');
assert.equal(verifyFileLink(url.searchParams), null, 'renamed file');
// A ticket signature must never work as a file link, or the reverse.
assert.equal(verifyTicket(`${id}.${later}.${new URL(staffFileUrl('https://x', id, 'a.pdf', later)).searchParams.get('sig')}`), null);

assert.equal(safeFileName('2024 Form 1120-S (final).PDF', 0), '1-2024-Form-1120-S-final.pdf');
assert.equal(safeFileName('../../.pdf', 2), '3-tax-return.pdf');
for (const name of ['2024 Form 1120-S (final).PDF', '../../evil.pdf', 'résumé.pdf', 'x'.repeat(300) + '.pdf']) {
  assert.match(filePath(id, safeFileName(name, 9)), FILE_PATH, name);
}
assert.doesNotMatch(`tax-returns/${id}/files/../submission.json`, FILE_PATH);
assert.doesNotMatch(`tax-returns/${id}/submission.json`, FILE_PATH);
assert.doesNotMatch(`debt-schedules/${id}/files/a.pdf`, FILE_PATH);

console.log('tax-returns checks passed');
