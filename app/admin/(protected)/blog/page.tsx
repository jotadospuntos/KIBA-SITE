import { desc, eq } from 'drizzle-orm';
import { Plus } from 'lucide-react';
import { requireAdminUser } from '@/lib/admin/access';
import { formatAdminDateTime } from '@/lib/blog/time';
import { db } from '@/lib/db';
import { blogCategories, blogPosts } from '@/lib/db/schema';
import { createDraft } from './actions';

/* /admin/blog — every post, newest activity first. Editors and admins. */

const PILL = {
  Draft: 'bg-ivory text-slate ring-line',
  Scheduled: 'bg-amber-50 text-amber-800 ring-amber-200',
  Published: 'bg-green-50 text-green-800 ring-green-200'
} as const;

export default async function BlogListPage() {
  const user = await requireAdminUser('editor');
  const rows = await db()
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      status: blogPosts.status,
      publishAt: blogPosts.publishAt,
      author: blogPosts.author,
      updatedAt: blogPosts.updatedAt,
      updatedBy: blogPosts.updatedBy,
      category: blogCategories.name
    })
    .from(blogPosts)
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .orderBy(desc(blogPosts.updatedAt));

  const now = Date.now();
  const stateOf = (r: (typeof rows)[number]): keyof typeof PILL =>
    r.status === 'draft' ? 'Draft' : r.publishAt && r.publishAt.getTime() > now ? 'Scheduled' : 'Published';

  return (
    <>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-navy-deep">Blog</h1>
          <p className="mt-2 text-slate">Write, schedule and publish posts for kibadvisors.com/blog.</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {user.role === 'admin' && (
            <a href="/admin/blog/categories" className="text-sm text-blue underline">Categories</a>
          )}
          <form action={createDraft}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-navy-deep px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
            >
              <Plus className="size-4" /> New post
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl bg-white ring-1 ring-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-ivory text-xs tracking-wide text-slate uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Publish date</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Last edited</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate">No posts yet. Start with &ldquo;New post&rdquo;.</td>
              </tr>
            )}
            {rows.map((r) => {
              const state = stateOf(r);
              return (
                <tr key={r.id} className="hover:bg-paper">
                  <td className="px-4 py-3">
                    <a href={`/admin/blog/${r.id}`} className="font-medium text-ink hover:text-blue hover:underline">
                      {r.title || 'Untitled post'}
                    </a>
                    <div className="text-xs text-slate">{r.author} · /blog/{r.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${PILL[state]}`}>{state}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.publishAt ? formatAdminDateTime(r.publishAt) : '—'}</td>
                  <td className="px-4 py-3">{r.category ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="whitespace-nowrap">{formatAdminDateTime(r.updatedAt)}</div>
                    <div className="text-xs text-slate">{r.updatedBy}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
