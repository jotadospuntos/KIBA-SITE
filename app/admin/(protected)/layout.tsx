import { requireAdminUser } from '@/lib/admin/access';
import { audit } from '@/lib/admin/audit';
import { signOut } from '@/lib/auth';

/*
 * Everything under /admin except the sign-in page. The (protected) folder is a
 * route group — it adds the access check and the header without changing any
 * URL. Each page still calls requireAdminUser() itself (with its own role),
 * because a layout check alone doesn't cover server actions.
 */
export const dynamic = 'force-dynamic';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminUser();

  const links = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/blog', label: 'Blog' },
    ...(user.role === 'admin'
      ? [
          { href: '/admin/users', label: 'Users' },
          { href: '/admin/audit', label: 'Audit log' }
        ]
      : [])
  ];

  return (
    <>
      <header className="bg-navy-deep text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4">
          <a href="/admin" className="font-heading text-lg font-semibold">
            KIBA Admin
          </a>
          <nav className="flex gap-5 text-sm">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-white/80 hover:text-white">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <span className="text-white/70">
              {user.email} · <span className="capitalize">{user.role}</span>
            </span>
            <form
              action={async () => {
                'use server';
                await audit({ actorEmail: user.email, action: 'auth.sign_out' });
                await signOut({ redirectTo: '/admin/sign-in' });
              }}
            >
              <button
                type="submit"
                className="rounded-md px-3 py-1.5 text-white ring-1 ring-white/30 hover:bg-white/10"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </>
  );
}
