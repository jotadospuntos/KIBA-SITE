'use server';

import { and, count, eq, ne, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireAdminUser } from '@/lib/admin/access';
import { audit } from '@/lib/admin/audit';
import { revalidateBlog } from '@/lib/blog/revalidate';
import { db } from '@/lib/db';
import { blogCategories, blogPosts } from '@/lib/db/schema';

/*
 * Blog categories. ADMIN only (editors pick from the list). A category in use
 * can be renamed — every post using it follows — but not deleted.
 * Results come back as ?ok= / ?error=, like /admin/users.
 */

function done(param: 'ok' | 'error', message: string): never {
  revalidatePath('/admin/blog/categories');
  redirect(`/admin/blog/categories?${param}=${encodeURIComponent(message)}`);
}

/* Inner runs of spaces collapse, so "SBA  Loans" can't sit beside "SBA Loans". */
const name = z.string().trim().min(1).max(60).transform((v) => v.replace(/\s+/g, ' '));

/* Case-insensitive: "sba loans" is the same category as "SBA Loans". */
async function nameTaken(value: string, exceptId?: string) {
  const same = sql`lower(${blogCategories.name}) = lower(${value})`;
  const [hit] = await db()
    .select({ id: blogCategories.id })
    .from(blogCategories)
    .where(exceptId ? and(same, ne(blogCategories.id, exceptId)) : same)
    .limit(1);
  return !!hit;
}

export async function createCategory(formData: FormData) {
  const me = await requireAdminUser('admin');
  const parsed = name.safeParse(formData.get('name'));
  if (!parsed.success) done('error', 'Enter a category name (up to 60 characters).');
  if (await nameTaken(parsed.data)) done('error', `"${parsed.data}" already exists.`);
  await db().insert(blogCategories).values({ name: parsed.data });
  await audit({ actorEmail: me.email, action: 'blog.category_create', targetType: 'blog_category', targetId: parsed.data });
  done('ok', `Added "${parsed.data}".`);
}

export async function renameCategory(formData: FormData) {
  const me = await requireAdminUser('admin');
  const id = z.uuid().safeParse(formData.get('id'));
  const parsed = name.safeParse(formData.get('name'));
  if (!id.success || !parsed.success) done('error', 'Enter a category name (up to 60 characters).');
  const [cat] = await db().select().from(blogCategories).where(eq(blogCategories.id, id.data)).limit(1);
  if (!cat) done('error', 'That category no longer exists.');
  if (cat.name === parsed.data) done('ok', 'No change.');
  if (await nameTaken(parsed.data, cat.id)) done('error', `"${parsed.data}" already exists.`);
  await db().update(blogCategories).set({ name: parsed.data }).where(eq(blogCategories.id, cat.id));
  await audit({
    actorEmail: me.email,
    action: 'blog.category_rename',
    targetType: 'blog_category',
    targetId: parsed.data,
    detail: { from: cat.name, to: parsed.data }
  });
  revalidateBlog();
  done('ok', `Renamed "${cat.name}" to "${parsed.data}".`);
}

export async function deleteCategory(formData: FormData) {
  const me = await requireAdminUser('admin');
  const id = z.uuid().safeParse(formData.get('id'));
  if (!id.success) done('error', 'Unknown category.');
  const [cat] = await db().select().from(blogCategories).where(eq(blogCategories.id, id.data)).limit(1);
  if (!cat) done('ok', 'Already deleted.');
  const [{ n }] = await db().select({ n: count() }).from(blogPosts).where(eq(blogPosts.categoryId, cat.id));
  if (n > 0) done('error', `"${cat.name}" is used by ${n} post${n === 1 ? '' : 's'}. Move them to another category first.`);
  await db().delete(blogCategories).where(eq(blogCategories.id, cat.id));
  await audit({ actorEmail: me.email, action: 'blog.category_delete', targetType: 'blog_category', targetId: cat.name });
  done('ok', `Deleted "${cat.name}".`);
}
