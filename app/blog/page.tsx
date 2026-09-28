import type { Metadata } from 'next';
import BlogIndexPage from './BlogIndexPage';

/*
 * /blog — post index. Server component for the metadata; the page itself is a
 * client component for the animation hooks. Same split as every other route.
 */
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

export default function Page() {
  return <BlogIndexPage />;
}
