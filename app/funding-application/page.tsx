import type { Metadata } from 'next';
import FundingApplicationPage from './FundingApplicationPage';

/*
 * /funding-application — the online version of "KIBA Lending Application v6".
 * The answers pre-fill a SignWell template, and the applicant signs it right
 * here. Field list: lib/funding-application/fields.ts.
 *
 * UNLINKED AND NOINDEX: reached only by a direct link from an advisor. Not in
 * the nav, the footer or app/sitemap.ts.
 */
export const metadata: Metadata = {
  title: 'Business Lending Application — Kingdom Impact Business Advisors',
  description:
    'Complete your KIBA business lending application online, then review and e-sign it in one sitting.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/funding-application' }
};

export default function Page() {
  return <FundingApplicationPage />;
}
