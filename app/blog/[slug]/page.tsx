import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PostPage from '../PostPage';
import { BLOG_REVALIDATE_SECONDS, getPublishedPost, listPublishedPosts } from '@/lib/blog/queries';

/*
 * /blog/<slug> — one dynamic route for every article. Posts come from the
 * database (written in /admin/blog). Those that exist at build time are
 * prerendered; a post published later renders on its first visit and is then
 * cached like the rest. Every save in the dashboard refreshes them, and the
 * five-minute revalidate is what brings a scheduled post out on time.
 *
 * An unknown, draft or not-yet-due slug 404s.
 */

export const revalidate = BLOG_REVALIDATE_SECONDS;

export async function generateStaticParams() {
  return (await listPublishedPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPublishedPost(params.slug);
  if (!post) return {};

  const url = `/blog/${post.slug}`;
  const description = post.searchDescription || post.excerpt;
  const image = post.coverImageUrl
    ? { url: post.coverImageUrl, alt: post.coverImageAlt }
    : { url: '/img/v2-preview.png', width: 1200, height: 630 };
  return {
    title: `${post.title} — Kingdom Impact Business Advisors`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description,
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [image]
    }
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const post = await getPublishedPost(params.slug);
  if (!post) notFound();
  /* "More from the blog": the four most recent others. */
  const others = (await listPublishedPosts()).filter((p) => p.slug !== post.slug).slice(0, 4);
  return <PostPage post={post} others={others} />;
}
