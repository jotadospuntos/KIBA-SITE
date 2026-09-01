import type { Metadata } from 'next';
import AboutUsPage from './AboutUsPage';

/*
 * /about-us — a real app/ route (no public/legacy file, no rewrite entry).
 *
 * Server component so it can export metadata; the page itself is
 * AboutUsPage.tsx, a client component for the animation hooks. Same split as
 * app/page.tsx and app/meet-our-team/page.tsx.
 *
 * NOINDEX matches the rest of this subdomain, and the same reasoning as
 * /meet-our-team applies with extra force: kibadvisors.com/about-us/ is the
 * page this content came from, and it should stay the one search finds. See
 * CLAUDE.md "Scope boundary" — flipping this is the human's call.
 */
export const metadata: Metadata = {
  title: 'About Us — Kingdom Impact Business Advisors',
  description:
    'Built for business. Grounded in faith. Focused on impact. Why Kingdom Impact Business Advisors exists, the five values behind every call we make, and how preparation-first advisory changes the answer you get from a lender.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://go.kibadvisors.com/about-us' },
  openGraph: {
    type: 'website',
    url: 'https://go.kibadvisors.com/about-us',
    title: 'About Us — Kingdom Impact Business Advisors',
    description:
      'Built for business. Grounded in faith. Focused on impact. Why KIBA exists and the values behind every call we make.',
    images: [{ url: 'https://go.kibadvisors.com/img/v2-preview.png', width: 1200, height: 630 }]
  }
};

export default function Page() {
  return <AboutUsPage />;
}
