import type { Metadata } from 'next';
import DscrCalculatorPage from './DscrCalculatorPage';

/*
 * /dscr-calculator — listed: indexed, in app/sitemap.ts, linked from the nav's
 * "Tools & Solutions" dropdown (lib/tools.ts) and the homepage's DscrPromo band.
 */
export const metadata: Metadata = {
  title: 'DSCR Calculator — Kingdom Impact Business Advisors',
  description:
    'Work out your debt service coverage ratio in two steps: EBITDA from your latest tax return, then your monthly debt payments.',
  alternates: { canonical: '/dscr-calculator' }
};

export default function Page() {
  return <DscrCalculatorPage />;
}
