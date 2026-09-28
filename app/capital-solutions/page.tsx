import type { Metadata } from 'next';
import CapitalSolutionsPage from './CapitalSolutionsPage';

/*
 * /capital-solutions — the hub for the six program pages. Server component for
 * the metadata; the page itself is a client component for the animation hooks.
 * Same split as every other route here.
 */
export const metadata: Metadata = {
  title: 'Capital Solutions — Kingdom Impact Business Advisors',
  description:
    'SBA loans, business acquisition financing, term loans, equipment financing, commercial real estate and revolving lines of credit. KIBA starts with your business, not with a loan product.',
  alternates: { canonical: '/capital-solutions' },
  openGraph: {
    type: 'website',
    url: '/capital-solutions',
    title: 'Capital Solutions — Kingdom Impact Business Advisors',
    description:
      'Six funding programs, and an honest answer on which one fits your business — or whether to borrow at all.',
    images: [{ url: '/img/v2-preview.png', width: 1200, height: 630 }]
  }
};

export default function Page() {
  return <CapitalSolutionsPage />;
}
