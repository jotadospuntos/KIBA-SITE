import 'server-only';
import { and, desc, eq, lte } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db';
import { blogCategories, blogPosts } from '@/lib/db/schema';
import { readingMinutes, sanitizeDoc, type Doc } from './doc';
import { formatPostDate } from './time';

/*
 * What the PUBLIC blog reads. A post is public when it is `published` and its
 * publish_at has passed; a published post with a future publish_at is
 * scheduled, and simply isn't returned yet.
 *
 * Cached under the 'blog' tag: every save in the dashboard calls
 * revalidateBlog(), so a publish shows immediately. The 5-minute revalidate is
 * what makes a SCHEDULED post appear on its own, no cron needed.
 *
 * With no DATABASE_URL (a preview build without it) the blog renders empty
 * instead of failing the build.
 */

export const BLOG_TAG = 'blog';
export const BLOG_REVALIDATE_SECONDS = 300;

/* Plain, serializable shapes: these cross into client components. */
export type PostSummary = {
  slug: string;
  title: string;
  category: string;
  author: string;
  publishedAt: string;
  dateLabel: string;
  excerpt: string;
  readingMinutes: number;
};

export type PublicPost = PostSummary & {
  searchDescription: string;
  coverImageUrl: string | null;
  coverImageAlt: string;
  body: Doc;
};

type Row = typeof blogPosts.$inferSelect & { categoryName: string | null };

export function toPublicPost(row: Row): PublicPost {
  const body = sanitizeDoc(row.body);
  const published = row.publishAt ?? row.updatedAt;
  return {
    slug: row.slug,
    title: row.title,
    category: row.categoryName ?? '',
    author: row.author,
    publishedAt: published.toISOString(),
    dateLabel: formatPostDate(published),
    excerpt: row.excerpt,
    readingMinutes: readingMinutes(body),
    searchDescription: row.searchDescription,
    coverImageUrl: row.coverImageUrl,
    coverImageAlt: row.coverImageAlt,
    body
  };
}

const toSummary = ({ searchDescription, coverImageUrl, coverImageAlt, body, ...s }: PublicPost): PostSummary => s;

async function publicRows(slug?: string): Promise<Row[]> {
  if (!process.env.DATABASE_URL) {
    console.warn('[blog] DATABASE_URL is not set; rendering the blog empty');
    return [];
  }
  return db()
    .select({ post: blogPosts, categoryName: blogCategories.name })
    .from(blogPosts)
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .where(
      and(
        eq(blogPosts.status, 'published'),
        lte(blogPosts.publishAt, new Date()),
        slug ? eq(blogPosts.slug, slug) : undefined
      )
    )
    .orderBy(desc(blogPosts.publishAt))
    .then((rows) => rows.map((r) => ({ ...r.post, categoryName: r.categoryName })));
}

export const listPublishedPosts = unstable_cache(
  async (): Promise<PostSummary[]> => (await publicRows()).map((r) => toSummary(toPublicPost(r))),
  ['blog-list'],
  { tags: [BLOG_TAG], revalidate: BLOG_REVALIDATE_SECONDS }
);

export const getPublishedPost = unstable_cache(
  async (slug: string): Promise<PublicPost | null> => {
    const [row] = await publicRows(slug);
    return row ? toPublicPost(row) : null;
  },
  ['blog-post'],
  { tags: [BLOG_TAG], revalidate: BLOG_REVALIDATE_SECONDS }
);
