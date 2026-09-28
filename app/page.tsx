import type { Metadata } from 'next';
import HomePage from './HomePage';

/*
 * Root route of kibadvisors.com - the promoted homepage redesign (was /v3).
 * Indexed: since the main-domain launch this is KIBA's one public homepage.
 *
 * This file is a server component purely so it can export metadata; the page
 * itself is app/HomePage.tsx, which must be a client component for the
 * animation hooks. (The old /v3 route did the same thing with a layout.tsx.)
 */
export const metadata: Metadata = {
  title: 'Kingdom Impact Business Advisors — Funding & Growth Capital',
  description:
    'Kingdom Impact Business Advisors helps business owners access bank-ready funding and growth capital — with clarity, integrity, and decades of lending experience.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Kingdom Impact Business Advisors — Funding & Growth Capital',
    description:
      'Kingdom Impact Business Advisors helps business owners access bank-ready funding and growth capital.',
    /* Filename is historical (it was the /v2 draft preview); the image is the
       current hero and is referenced absolutely by other pages' og tags too. */
    images: [{ url: '/img/v2-preview.png', width: 1200, height: 630 }]
  }
};

export default function Page() {
  return <HomePage />;
}
