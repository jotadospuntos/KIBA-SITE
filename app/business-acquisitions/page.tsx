import type { Metadata } from 'next';
import BusinessAcquisitionsPage from './BusinessAcquisitionsPage';

/*
 * /business-acquisitions — migrated off public/legacy/business-acquisitions.html.
 * Deliberately separate from /capital-solutions/business-acquisition-loans; see
 * the note in BusinessAcquisitionsPage.tsx.
 */
export const metadata: Metadata = {
  title: 'Business Acquisition Funding — Kingdom Impact Business Advisors',
  description:
    'Acquisition-focused financing so you can secure the right capital, close with confidence, and scale your impact. Acquisition term loans available for Non-US Citizen Green Card holders.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://go.kibadvisors.com/business-acquisitions' },
  openGraph: {
    type: 'website',
    url: 'https://go.kibadvisors.com/business-acquisitions',
    title: 'Business Acquisition Funding — Kingdom Impact Business Advisors',
    description: 'More than funding. Clear guidance.',
    images: [{ url: 'https://go.kibadvisors.com/img/business-acquisitions.png', width: 1200, height: 630 }]
  }
};

export default function Page() {
  return <BusinessAcquisitionsPage />;
}
