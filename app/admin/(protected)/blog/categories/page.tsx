import { asc, count, eq } from 'drizzle-orm';
import { ArrowLeft } from 'lucide-react';
import { requireAdminUser } from '@/lib/admin/access';
import { db } from '@/lib/db';
import { blogCategories, blogPosts } from '@/lib/db/schema';
import { createCategory, deleteCategory, renameCategory } from './actions';

/* /admin/blog/categories — the list editors choose from. Admin only. */

const field = 'rounded-lg bg-white px-3 py-2 text-sm text-ink ring-1 ring-line focus:outline-2 focus:outline-blue';
const small = 'rounded-md px-3 py-1.5 text-sm font-medium ring-1 ring-line hover:bg-ivory focus-visible:outline-2 focus-visible:outline-blue';

export default async function CategoriesPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireAdminUser('admin');
  const rows = await db()
    .select({ id: blogCategories.id, name: blogCategories.name, posts: count(blogPosts.id) })
    .from(blogCategories)
    .leftJoin(blogPosts, eq(blogPosts.categoryId, blogCategories.id))
    .groupBy(blogCategories.id)
    .orderBy(asc(blogCategories.name));
  const ok = typeof searchParams.ok === 'string' ? searchParams.ok : null;
  const error = typeof searchParams.error === 'string' ? searchParams.error : null;

  return (
    <>
      <a href="/admin/blog" className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-ink">
        <ArrowLeft className="size-4" /> Blog
      </a>
      <h1 className="mt-3 font-heading text-3xl font-semibold text-navy-deep">Blog categories</h1>
      <p className="mt-2 max-w-2xl text-slate">
        Editors pick a category for each post from this list. Renaming one updates every post that
        uses it. A category can only be deleted once no post uses it.
      </p>

      {(ok || error) && (
        <p
          role={error ? 'alert' : 'status'}
          className={`mt-6 rounded-lg p-3 text-sm ring-1 ${error ? 'bg-red-50 text-red-800 ring-red-200' : 'bg-green-50 text-green-800 ring-green-200'}`}
        >
          {error ?? ok}
        </p>
      )}

      <ul className="mt-8 max-w-2xl divide-y divide-line rounded-xl bg-white ring-1 ring-line">
        {rows.length === 0 && <li className="px-4 py-6 text-center text-slate">No categories yet.</li>}
        {rows.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <form action={renameCategory} className="flex grow items-center gap-2">
              <input type="hidden" name="id" value={c.id} />
              <input name="name" defaultValue={c.name} aria-label={`Name for ${c.name}`} maxLength={60} required className={`${field} grow`} />
              <button type="submit" className={small}>Rename</button>
            </form>
            <span className="w-16 text-right text-xs text-slate">{c.posts} post{c.posts === 1 ? '' : 's'}</span>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={c.id} />
              <button type="submit" disabled={c.posts > 0} className={`${small} text-red-700 disabled:opacity-40`}>
                Delete
              </button>
            </form>
          </li>
        ))}
      </ul>

      <form action={createCategory} className="mt-6 flex max-w-2xl items-end gap-3 rounded-xl bg-white p-5 ring-1 ring-line">
        <label className="flex grow flex-col gap-1 text-sm">
          <span className="font-medium text-ink">New category</span>
          <input name="name" required maxLength={60} placeholder="e.g. SBA Loans" className={field} />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-navy-deep px-4 py-2 text-sm font-semibold text-white hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          Add
        </button>
      </form>
    </>
  );
}
