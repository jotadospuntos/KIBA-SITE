import { requireAdminUser } from '@/lib/admin/access';

/* /admin — the landing page. Tiles for the sections that exist; the blog and
   submissions arrive in later steps and are shown as "coming next" so nobody
   wonders where they are. */
export default async function AdminHome() {
  const user = await requireAdminUser();

  const tiles = [
    { title: 'Blog', body: 'Write, schedule and publish posts.', href: null },
    ...(user.role === 'admin'
      ? [
          { title: 'Users', body: 'Who can sign in, and what they can do.', href: '/admin/users' },
          { title: 'Audit log', body: 'Every sign-in and change, newest first.', href: '/admin/audit' }
        ]
      : [])
  ];

  return (
    <>
      <h1 className="font-heading text-3xl font-semibold text-navy-deep">
        Welcome{user.name ? `, ${user.name.split(' ')[0]}` : ''}
      </h1>
      <p className="mt-2 text-slate">KIBA&rsquo;s staff dashboard.</p>

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
