import type { Metadata } from 'next';
import BlogIndexPage from './BlogIndexPage';

/*
 * /blog — post index. Server component for the metadata; the page itself is a
 * client component for the animation hooks. Same split as every other route.
 *
 * NOINDEX matches the rest of the subdomain. Worth revisiting for the blog
 * specifically: articles are the one thing here with real organic search value,
 * and kibadvisors.com/blog/ is currently the indexable copy. Flipping it is the
 * human's call (see CLAUDE.md "Scope boundary").
 */
export const metadata: Metadata = {
  title: 'Blog — Kingdom Impact Business Advisors',
  description:
    'Clear thinking on capital decisions: cash flow, business credit and knowing when your business is actually ready for financing.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://go.kibadvisors.com/blog' },
  openGraph: {
    type: 'website',
    url: 'https://go.kibadvisors.com/blog',
    title: 'Blog — Kingdom Impact Business Advisors',
    description: 'Practical writing for business owners weighing whether, and when, to borrow.',
    images: [{ url: 'https://go.kibadvisors.com/img/v2-preview.png', width: 1200, height: 630 }]
  }
};

export default function Page() {
  return <BlogIndexPage />;
}
