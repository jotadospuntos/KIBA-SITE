import type { Metadata } from 'next';
import ReferralPartnersPage from './ReferralPartnersPage';

/*
 * /referral-partners — migrated off public/legacy/referral-partners.html.
 * The recruitment page for CPAs, bankers and advisors; not to be confused with
 * /partners/<slug>, which are per-partner client landing pages.
 */
export const metadata: Metadata = {
  title: 'Referral Partners — Kingdom Impact Business Advisors',
  description:
    'A trusted capital and advisory partner for CPAs, bankers and advisors. We strengthen your client’s position and keep you at the center of the relationship.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://go.kibadvisors.com/referral-partners' },
  openGraph: {
    type: 'website',
    url: 'https://go.kibadvisors.com/referral-partners',
    title: 'Referral Partners — Kingdom Impact Business Advisors',
    description: 'A disciplined, transparent partner — not another lender in the room.',
    images: [{ url: 'https://go.kibadvisors.com/img/referral-partners.png', width: 1200, height: 630 }]
  }
};

export default function Page() {
  return <ReferralPartnersPage />;
}
