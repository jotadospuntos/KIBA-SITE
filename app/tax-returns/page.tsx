import type { Metadata } from 'next';
import TaxReturnsPage from './TaxReturnsPage';

/*
 * /tax-returns — clients upload their most recent business and personal tax
 * returns so the advisor can review them before the call. Linked from
 * /funding-application/next-steps (opens in a new tab); advisors can also send
 * the link directly.
 *
 * NOINDEX and absent from the sitemap, like /debt-schedule.
 */
export const metadata: Metadata = {
  title: 'Share Your Tax Returns — Kingdom Impact Business Advisors',
  description:
    'Upload your most recent business and personal tax returns securely, so your KIBA advisor can review them before your call.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/tax-returns' }
};

export default function Page() {
  return <TaxReturnsPage />;
}
