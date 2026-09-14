import type { Metadata } from 'next';
import ThankYouPage from './ThankYouPage';

/*
 * /thank-you — migrated off public/legacy/thank-you.html.
 */
export const metadata: Metadata = {
  title: 'Thank You — Kingdom Impact Business Advisors',
  description: "We've got your details. A member of our team will reach out within 24–72 hours.",
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://go.kibadvisors.com/thank-you' },
  openGraph: {
    type: 'website',
    url: 'https://go.kibadvisors.com/thank-you',
    title: 'Thank You — Kingdom Impact Business Advisors',
    description: "We've got your details. A member of our team will reach out within 24–72 hours.",
    images: [{ url: 'https://go.kibadvisors.com/img/v2-preview.png', width: 1200, height: 630 }]
  }
};

export default function Page() {
  return <ThankYouPage />;
}
