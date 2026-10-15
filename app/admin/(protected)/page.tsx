import { requireAdminUser } from '@/lib/admin/access';
import { countSyncFailures } from '@/lib/sync-failures';

/* /admin — the landing page. One tile per section the signed-in person can use. */
export default async function AdminHome() {
  const user = await requireAdminUser();

  const tiles = [
    { title: 'Blog', body: 'Write, schedule and publish posts.', href: '/admin/blog' as string | null },
    ...(user.role === 'admin'
      ? [
          { title: 'Users', body: 'Who can sign in, and what they can do.', href: '/admin/users' },
          { title: 'Audit log', body: 'Every sign-in and change, newest first.', href: '/admin/audit' },
          { title: 'Failed syncs', body: 'Submissions that never reached GoHighLevel.', href: '/admin/failed-syncs' }
        ]
      : [])
  ];

  /* A storage hiccup skips the banner, never the dashboard. */
  const failed = user.role === 'admin' ? await countSyncFailures().catch(() => 0) : 0;

  return (
    <>
      <h1 className="font-heading text-3xl font-semibold text-navy-deep">
        Welcome{user.name ? `, ${user.name.split(' ')[0]}` : ''}
      </h1>
      <p className="mt-2 text-slate">KIBA&rsquo;s staff dashboard.</p>

      {failed > 0 && (
        <a
          href="/admin/failed-syncs"
          role="alert"
          className="mt-6 block rounded-lg bg-red-50 p-4 font-medium text-red-800 ring-1 ring-red-200 hover:bg-red-100"
        >
          ⚠ {failed} submission{failed === 1 ? '' : 's'} didn&rsquo;t reach GoHighLevel → Review
        </a>
      )}

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => {
          const inner = (
            <>
              <h2 className="font-heading text-lg font-semibold text-ink">{t.title}</h2>
              <p className="mt-1 text-sm text-slate">{t.body}</p>
              {!t.href && (
                <span className="mt-3 inline-block rounded-full bg-ivory px-2.5 py-0.5 text-xs font-medium text-slate">
                  Coming next
                </span>
              )}
            </>
          );
          return (
            <li key={t.title}>
              {t.href ? (
                <a
                  href={t.href}
                  className="block h-full rounded-xl bg-white p-6 ring-1 ring-line transition-shadow hover:shadow-md"
                >
                  {inner}
                </a>
              ) : (
                <div className="h-full rounded-xl bg-white/60 p-6 ring-1 ring-line">{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
