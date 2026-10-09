'use server';

import { and, desc, eq, lt, ne, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireAdminUser } from '@/lib/admin/access';
import { audit } from '@/lib/admin/audit';
import { BLOG_AUTHORS, DEFAULT_AUTHOR } from '@/lib/blog/authors';
import { EMPTY_DOC, docText, imagesMissingAlt, isAllowedImageSrc, sanitizeDoc } from '@/lib/blog/doc';
import type { EditorPost, RevisionSummary, SaveIntent, SaveResult } from '@/lib/blog/editor-types';
import { revalidateBlog } from '@/lib/blog/revalidate';
import { SLUG_PATTERN, slugify } from '@/lib/blog/slug';
import { toEditorPost } from '@/lib/blog/editor-server';
import { formatAdminDateTime, fromCentralInput, toCentralInput } from '@/lib/blog/time';
import { db } from '@/lib/db';
import { blogCategories, blogPostRevisions, blogPosts, type BlogPost } from '@/lib/db/schema';

/*
 * Blog writes. Editors and admins both. Every action re-checks the signed-in
 * user first: a server action is a public POST endpoint, whatever the page
 * around it checked.
 *
 * Results are returned (not redirected) because the editor is a client
 * component that keeps its state across saves.
 */

const input = z.object({
  id: z.uuid().nullable(),
  updatedAt: z.string().nullable(),
  title: z.string().trim().max(200),
  slug: z.string().trim().toLowerCase().max(100),
  excerpt: z.string().trim().max(400),
  searchDescription: z.string().trim().max(300),
  categoryId: z.uuid().nullable(),
  author: z.string().trim().min(1).max(100),
  coverImageUrl: z.string().nullable(),
  coverImageAlt: z.string().trim().max(300),
  body: z.unknown(),
  publishAt: z.string()
});

const fail = (error: string): SaveResult => ({ ok: false, error });

/*
 * "New post": creates an empty draft and opens it at its permanent address.
 * Creating it up front (rather than on the first save) means the editor's URL
 * never changes under it — a client-side URL change made Next re-render the
 * page and could throw away whatever was typed right after the first save.
 *
 * The cost is an empty draft if someone clicks "New post" and walks away, so
 * this also clears that person's own untouched empty drafts older than an hour.
 */
export async function createDraft() {
  const me = await requireAdminUser('editor');
  await db()
    .delete(blogPosts)
    .where(
      and(
        eq(blogPosts.createdBy, me.email),
        eq(blogPosts.status, 'draft'),
        eq(blogPosts.title, ''),
        sql`${blogPosts.createdAt} = ${blogPosts.updatedAt}`,
        lt(blogPosts.createdAt, new Date(Date.now() - 60 * 60 * 1000))
      )
    );
  const [row] = await db()
    .insert(blogPosts)
    .values({
      title: '',
      slug: `draft-${crypto.randomUUID().slice(0, 8)}`,
      author: DEFAULT_AUTHOR,
      body: EMPTY_DOC,
      createdBy: me.email,
      updatedBy: me.email
    })
    .returning({ id: blogPosts.id });
  await audit({ actorEmail: me.email, action: 'blog.create', targetType: 'blog_post', targetId: row.id });
  redirect(`/admin/blog/${row.id}`);
}

export async function savePost(raw: EditorPost, intent: SaveIntent): Promise<SaveResult> {
  const me = await requireAdminUser('editor');
  const parsed = input.safeParse(raw);
  if (!parsed.success) return fail('Some fields are too long or invalid. Check the form and try again.');
  const v = parsed.data;

  const existing = v.id
    ? (await db().select().from(blogPosts).where(eq(blogPosts.id, v.id)).limit(1))[0]
    : undefined;
  if (v.id && !existing) return fail('This post no longer exists. It may have been deleted.');
  if (existing && v.updatedAt !== existing.updatedAt.toISOString()) {
    return fail(
      `${existing.updatedBy} saved this post at ${formatAdminDateTime(existing.updatedAt)}, after you opened it. ` +
        'Copy anything you need, then reload the page to see their version.'
    );
  }

  /* ---- normalize ---- */
  const title = v.title;
  const slug = v.slug || slugify(title) || existing?.slug || `draft-${crypto.randomUUID().slice(0, 8)}`;
  if (!SLUG_PATTERN.test(slug)) {
    return fail('The web address can only use lowercase letters, numbers and hyphens (e.g. "my-new-post").');
  }
  if (!BLOG_AUTHORS.includes(v.author) && v.author !== existing?.author) return fail('Pick an author from the list.');
  const coverImageUrl = v.coverImageUrl && isAllowedImageSrc(v.coverImageUrl) ? v.coverImageUrl : null;
  const body = sanitizeDoc(v.body);
  let publishAt: Date | null = null;
  if (v.publishAt) {
    publishAt = fromCentralInput(v.publishAt);
    if (!publishAt) return fail('The publish date and time is incomplete.');
  }

  const status: BlogPost['status'] =
    intent === 'publish' ? 'published' : intent === 'unpublish' ? 'draft' : (existing?.status ?? 'draft');

  /* ---- what publishing requires ---- */
  if (status === 'published') {
    const missing: string[] = [];
    if (!v.title) missing.push('a title');
    if (!v.categoryId) missing.push('a category');
    if (!v.excerpt) missing.push('a summary');
    if (!docText(body).trim()) missing.push('some body text');
    if (coverImageUrl && !v.coverImageAlt) missing.push('a description of the share image');
    if (imagesMissingAlt(body)) missing.push('a description (alt text) for every image in the post');
    if (missing.length) return fail(`To publish, the post needs ${missing.join(', ')}.`);
    publishAt ??= intent === 'publish' ? new Date() : existing?.publishAt ?? new Date();
  }

  if (v.categoryId) {
    const [cat] = await db().select({ id: blogCategories.id }).from(blogCategories).where(eq(blogCategories.id, v.categoryId));
    if (!cat) return fail('That category was removed. Pick another one.');
  }
  const [clash] = await db()
    .select({ id: blogPosts.id, title: blogPosts.title })
    .from(blogPosts)
    .where(v.id ? and(eq(blogPosts.slug, slug), ne(blogPosts.id, v.id)) : eq(blogPosts.slug, slug))
    .limit(1);
  if (clash) return fail(`The web address "/blog/${slug}" is already used by "${clash.title}". Choose another.`);

  /* ---- write ---- */
  const now = new Date();
  const values = {
    title,
    slug,
    excerpt: v.excerpt,
    searchDescription: v.searchDescription,
    categoryId: v.categoryId,
    author: v.author,
    coverImageUrl,
    coverImageAlt: coverImageUrl ? v.coverImageAlt : '',
    body,
    status,
    publishAt,
    updatedBy: me.email,
    updatedAt: now
  };
  const [row] = existing
    ? await db().update(blogPosts).set(values).where(eq(blogPosts.id, existing.id)).returning()
    : await db().insert(blogPosts).values({ ...values, createdBy: me.email, createdAt: now }).returning();

  const { updatedBy, updatedAt, ...snapshot } = values;
  await db().insert(blogPostRevisions).values({ postId: row.id, savedBy: me.email, snapshot });

  const scheduled = status === 'published' && publishAt !== null && publishAt > now;
  const action = !existing
    ? 'blog.create'
    : intent === 'publish'
      ? scheduled ? 'blog.schedule' : 'blog.publish'
      : intent === 'unpublish' ? 'blog.unpublish' : 'blog.update';
  await audit({
    actorEmail: me.email,
    action,
    targetType: 'blog_post',
    targetId: row.slug,
    detail: { title: row.title, ...(scheduled && publishAt ? { publishAt: publishAt.toISOString() } : {}) }
  });

  if (existing?.status === 'published' || status === 'published') {
    revalidateBlog([row.slug, ...(existing ? [existing.slug] : [])]);
  }

  const message =
    intent === 'unpublish'
      ? 'Unpublished. The post is a draft again and no longer on the site.'
      : status === 'draft'
        ? 'Draft saved.'
        : scheduled && publishAt
          ? `Scheduled. It goes live ${formatAdminDateTime(publishAt)}.`
          : intent === 'publish'
            ? `Published. It's live at /blog/${row.slug}.`
            : 'Saved. The live post is updated.';

  return { ok: true, post: toEditorPost(row), message };
}

export async function deletePost(id: string, title: string): Promise<{ ok: boolean; error?: string }> {
  const me = await requireAdminUser('editor');
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return { ok: false, error: 'Unknown post.' };
  const [row] = await db().select().from(blogPosts).where(eq(blogPosts.id, parsed.data)).limit(1);
  if (!row) return { ok: true };
  if (row.status === 'published') return { ok: false, error: 'Unpublish the post before deleting it.' };
  await db().delete(blogPosts).where(eq(blogPosts.id, row.id));
  await audit({ actorEmail: me.email, action: 'blog.delete', targetType: 'blog_post', targetId: row.slug, detail: { title: row.title || title } });
  return { ok: true };
}

export async function listRevisions(postId: string): Promise<RevisionSummary[]> {
  await requireAdminUser('editor');
  const parsed = z.uuid().safeParse(postId);
  if (!parsed.success) return [];
  const rows = await db()
    .select()
    .from(blogPostRevisions)
    .where(eq(blogPostRevisions.postId, parsed.data))
    .orderBy(desc(blogPostRevisions.savedAt))
    .limit(30);
  return rows.map((r) => {
    const s = r.snapshot as { title?: string; status?: string };
    return { id: r.id, savedAt: formatAdminDateTime(r.savedAt), savedBy: r.savedBy, title: s.title ?? '', status: s.status ?? '' };
  });
}

/* A revision's content, shaped as editor fields. The editor loads it into the
   form; nothing changes until the person saves. */
export async function getRevision(
  postId: string,
  revisionId: number
): Promise<Omit<EditorPost, 'id' | 'updatedAt' | 'updatedBy' | 'status' | 'liveSlug'> | null> {
  await requireAdminUser('editor');
  if (!z.uuid().safeParse(postId).success || !Number.isInteger(revisionId)) return null;
  const [r] = await db()
    .select()
    .from(blogPostRevisions)
    .where(and(eq(blogPostRevisions.id, revisionId), eq(blogPostRevisions.postId, postId)))
    .limit(1);
  if (!r) return null;
  const s = r.snapshot as Record<string, unknown>;
  const str = (k: string) => (typeof s[k] === 'string' ? (s[k] as string) : '');
  const publishAt = typeof s.publishAt === 'string' ? new Date(s.publishAt) : null;
  return {
    title: str('title'),
    slug: str('slug'),
    excerpt: str('excerpt'),
    searchDescription: str('searchDescription'),
    categoryId: str('categoryId') || null,
    author: str('author'),
    coverImageUrl: str('coverImageUrl') || null,
    coverImageAlt: str('coverImageAlt'),
    body: sanitizeDoc(s.body),
    publishAt: publishAt && !Number.isNaN(publishAt.getTime()) ? toCentralInput(publishAt) : ''
  };
}
