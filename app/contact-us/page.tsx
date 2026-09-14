import type { Metadata } from 'next';
import ContactUsPage from './ContactUsPage';

/*
 * /contact-us — closes the gap against kibadvisors.com/contact-us/, which this
 * repo had no equivalent of (only a `#talk` anchor).
 *
 * NOINDEX matches the rest of the subdomain; the WordPress contact page stays
 * the indexable copy. See CLAUDE.md "Scope boundary".
 */
export const metadata: Metadata = {
  title: 'Contact Us — Kingdom Impact Business Advisors',
  description:
    'Call 251-210-8445, email info@kibadvisors.com, or book a time directly. Office hours Monday to Friday, 8:30 AM to 5:00 PM.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://go.kibadvisors.com/contact-us' },
  openGraph: {
    type: 'website',
    url: 'https://go.kibadvisors.com/contact-us',
    title: 'Contact Us — Kingdom Impact Business Advisors',
    description: 'Have questions or need assistance? Our team is ready to support you.',
    images: [{ url: 'https://go.kibadvisors.com/img/v2-preview.png', width: 1200, height: 630 }]
  }
};

export default function Page() {
  return <ContactUsPage />;
}
