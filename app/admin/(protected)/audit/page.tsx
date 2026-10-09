import { desc } from 'drizzle-orm';
import { requireAdminUser } from '@/lib/admin/access';
import { db } from '@/lib/db';
import { auditLog } from '@/lib/db/schema';
import { formatWhen } from '../format';

/* /admin/audit — the most recent activity, newest first. Admin only. */

const LIMIT = 200;

const LABELS: Record<string, string> = {
  'auth.sign_in': 'Signed in',
  'auth.sign_in_denied': 'Sign-in refused',
  'auth.sign_out': 'Signed out',
  'user.create': 'Added user',
  'user.role_change': 'Changed role',
  'user.deactivate': 'Deactivated user',
  'user.reactivate': 'Reactivated user'
};

export default async function AuditPage() {
  await requireAdminUser('admin');
  const rows = await db().select().from(auditLog).orderBy(desc(auditLog.at)).limit(LIMIT);

  return (
    <>
      <h1 className="font-heading text-3xl font-semibold text-navy-deep">Audit log</h1>
      <p className="mt-2 text-slate">The last {LIMIT} events. Times are Central.</p>

      <div className="mt-8 overflow-x-auto rounded-xl bg-white ring-1 ring-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-ivory text-xs tracking-wide text-slate uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Who</th>
              <th className="px-4 py-3 font-medium">What</th>
              <th className="px-4 py-3 font-medium">Target</th>
              <th className="px-4 py-3 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate">
                  Nothing yet.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className={r.action === 'auth.sign_in_denied' ? 'bg-red-50/60' : ''}>
                <td className="px-4 py-3 whitespace-nowrap">{formatWhen(r.at)}</td>
                <td className="px-4 py-3">{r.actorEmail ?? '—'}</td>
                <td className="px-4 py-3">{LABELS[r.action] ?? r.action}</td>
                <td className="px-4 py-3">{r.targetId ?? '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate">
                  {r.detail ? JSON.stringify(r.detail) : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
