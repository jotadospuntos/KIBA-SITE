import type { Metadata } from 'next';
import DscrCalculatorPage from './DscrCalculatorPage';

/*
 * /dscr-calculator — PROTOTYPE, in review. NOINDEX and absent from
 * app/sitemap.ts and the nav until the business signs it off; then flip
 * `robots`, add it to the sitemap, and decide where it's linked from.
 */
export const metadata: Metadata = {
  title: 'DSCR Calculator — Kingdom Impact Business Advisors',
  description:
    'Work out your debt service coverage ratio in two steps: EBITDA from your latest tax return, then your monthly debt payments.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/dscr-calculator' }
};

export default function Page() {
  return <DscrCalculatorPage />;
}
