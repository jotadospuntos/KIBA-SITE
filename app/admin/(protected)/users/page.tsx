import { asc } from 'drizzle-orm';
import { requireAdminUser } from '@/lib/admin/access';
import { db } from '@/lib/db';
import { adminRole, adminUsers } from '@/lib/db/schema';
import { formatWhen } from '../format';
import { changeRole, createUser, setActive } from './actions';

/* /admin/users — the allowlist. Admin only. */

const field =
  'rounded-lg bg-white px-3 py-2 text-sm text-ink ring-1 ring-line focus:outline-2 focus:outline-blue';
const smallButton =
  'rounded-md px-3 py-1.5 text-sm font-medium ring-1 ring-line hover:bg-ivory focus-visible:outline-2 focus-visible:outline-blue';

export default async function UsersPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const me = await requireAdminUser('admin');
  const users = await db().select().from(adminUsers).orderBy(asc(adminUsers.email));
  const ok = typeof searchParams.ok === 'string' ? searchParams.ok : null;
  const error = typeof searchParams.error === 'string' ? searchParams.error : null;

  return (
    <>
      <h1 className="font-heading text-3xl font-semibold text-navy-deep">Users</h1>
      <p className="mt-2 max-w-2xl text-slate">
        Only people on this list can sign in, with their @kibadvisors.com Google account.{' '}
        <strong className="text-ink">Editors</strong> manage the blog.{' '}
        <strong className="text-ink">Admins</strong> can also manage users and see the audit log.
        Changes apply immediately, including to anyone already signed in.
      </p>

      {(ok || error) && (
        <p
          role={error ? 'alert' : 'status'}
          className={`mt-6 rounded-lg p-3 text-sm ring-1 ${
            error ? 'bg-red-50 text-red-800 ring-red-200' : 'bg-green-50 text-green-800 ring-green-200'
          }`}
        >
          {error ?? ok}
        </p>
      )}

      <div className="mt-8 overflow-x-auto rounded-xl bg-white ring-1 ring-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-ivory text-xs tracking-wide text-slate uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last sign-in</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => {
              const self = u.id === me.id;
              return (
                <tr key={u.id} className={u.active ? '' : 'text-slate'}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{u.email}</div>
                    {u.name && <div className="text-xs text-slate">{u.name}</div>}
                  </td>
                  <td className="px-4 py-3">
                    {self ? (
                      <span className="capitalize">{u.role} (you)</span>
                    ) : (
                      <form action={changeRole} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={u.id} />
                        <select name="role" defaultValue={u.role} aria-label={`Role for ${u.email}`} className={field}>
                          {adminRole.enumValues.map((r) => (
                            <option key={r} value={r} className="capitalize">
                              {r}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className={smallButton}>
                          Save
                        </button>
                      </form>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {self ? (
                      'Active'
                    ) : (
                      <form action={setActive} className="flex items-center gap-3">
                        <input type="hidden" name="id" value={u.id} />
                        <input type="hidden" name="active" value={u.active ? 'false' : 'true'} />
                        <span>{u.active ? 'Active' : 'Deactivated'}</span>
                        <button type="submit" className={smallButton}>
                          {u.active ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </form>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {u.lastSignInAt ? formatWhen(u.lastSignInAt) : 'Never'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="mt-10 max-w-xl rounded-xl bg-white p-6 ring-1 ring-line">
        <h2 className="font-heading text-lg font-semibold text-ink">Add someone</h2>
        <form action={createUser} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="flex grow flex-col gap-1 text-sm">
            <span className="text-slate">Email</span>
            <input name="email" type="email" required placeholder="name@kibadvisors.com" className={field} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate">Role</span>
            <select name="role" defaultValue="editor" className={field}>
              {adminRole.enumValues.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-lg bg-navy-deep px-4 py-2 text-sm font-semibold text-white hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            Add
          </button>
        </form>
      </section>
    </>
  );
}
