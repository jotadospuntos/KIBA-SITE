import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PostPage from '../PostPage';
import { POSTS, getPost } from '../posts';

/*
 * /blog/<slug> — one dynamic route for every article, the same pattern as
 * /capital-solutions/[slug]. generateStaticParams emits them as static pages
 * and dynamicParams=false 404s an unknown slug.
 *
 * Passes the SLUG, not the Post object: PostPage is a client component, and
 * while Post happens to be serializable today, the capital-solutions route
 * learned the hard way what happens when a non-serializable field is added
 * later. Looking it up client-side also keeps the body text out of the RSC
 * payload, so it isn't shipped twice.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug);
  if (!post) return {};

  const url = `https://go.kibadvisors.com/blog/${post.slug}`;
  return {
    title: `${post.title} — Kingdom Impact Business Advisors`,
    description: post.excerpt,
    robots: { index: false, follow: false },
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      authors: [post.author],
      images: [{ url: 'https://go.kibadvisors.com/img/v2-preview.png', width: 1200, height: 630 }]
    }
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  if (!getPost(params.slug)) notFound();
  return <PostPage slug={params.slug} />;
}
