import 'server-only';
import { asc } from 'drizzle-orm';
import { BLOG_AUTHORS } from '@/lib/blog/authors';
import { db } from '@/lib/db';
import { blogCategories } from '@/lib/db/schema';

/* What the editor's dropdowns need (/admin/blog/<id>). */
export async function editorOptions() {
  const categories = await db()
    .select({ id: blogCategories.id, name: blogCategories.name })
    .from(blogCategories)
    .orderBy(asc(blogCategories.name));
  return { categories, authors: BLOG_AUTHORS };
}
