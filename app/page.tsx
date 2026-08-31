import type { Metadata } from 'next';
import HomePage from './HomePage';

/*
 * Root route of go.kibadvisors.com - the promoted homepage redesign (was /v3).
 *
 * This file is a server component purely so it can export metadata; the page
 * itself is app/HomePage.tsx, which must be a client component for the
 * animation hooks. (The old /v3 route did the same thing with a layout.tsx.)
 *
 * NOINDEX IS DELIBERATE - DO NOT "FIX" IT.
 * This subdomain is a landing/booking host: every page on it is campaign- or
 * partner-targeted and reached by direct link, not search. The main
 * kibadvisors.com WordPress site (a separate property this repo never touches)
 * stays the only indexable KIBA homepage, so this one is kept out of the index
 * rather than competing with it for the same terms.
 *
 * Flipping it later is a one-line change - `robots: { index: true, follow: true }`
 * - and is the human's call, not an agent's. The canonical is already the real
 * URL, so nothing else needs to change if that decision is made.
 */
export const metadata: Metadata = {
  title: 'Kingdom Impact Business Advisors — Funding & Growth Capital',
  description:
    'Kingdom Impact Business Advisors helps business owners access bank-ready funding and growth capital — with clarity, integrity, and decades of lending experience.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://go.kibadvisors.com/' },
  openGraph: {
    type: 'website',
    url: 'https://go.kibadvisors.com/',
    title: 'Kingdom Impact Business Advisors — Funding & Growth Capital',
    description:
      'Kingdom Impact Business Advisors helps business owners access bank-ready funding and growth capital.',
    /* Filename is historical (it was the /v2 draft preview); the image is the
       current hero and is referenced absolutely by other pages' og tags too. */
    images: [{ url: 'https://go.kibadvisors.com/img/v2-preview.png', width: 1200, height: 630 }]
  }
};

export default function Page() {
  return <HomePage />;
}
