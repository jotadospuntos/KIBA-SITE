import type { Metadata } from 'next';
import BlogIndexPage from './BlogIndexPage';
import { BLOG_REVALIDATE_SECONDS, listPublishedPosts } from '@/lib/blog/queries';

/*
 * /blog — post index. Server component for the metadata and the data; the page
 * itself is a client component for the animation hooks. Same split as every
 * other route.
 *
 * Static, refreshed by the dashboard on every save (revalidateBlog) and every
 * five minutes regardless, which is what lets a scheduled post appear on time.
 */
export const revalidate = BLOG_REVALIDATE_SECONDS;

export const metadata: Metadata = {
  title: 'Blog — Kingdom Impact Business Advisors',
  description:
    'Clear thinking on capital decisions: cash flow, business credit and knowing when your business is actually ready for financing.',
  alternates: { canonical: '/blog' },
  openGraph: {
    type: 'website',
    url: '/blog',
    title: 'Blog — Kingdom Impact Business Advisors',
    description: 'Practical writing for business owners weighing whether, and when, to borrow.',
    images: [{ url: '/img/v2-preview.png', width: 1200, height: 630 }]
  }
};

export default async function Page() {
  return <BlogIndexPage posts={await listPublishedPosts()} />;
}
