import type { Metadata } from 'next';
import ContactUsPage from './ContactUsPage';

/*
 * /contact-us — closes the gap against kibadvisors.com/contact-us/, which this
 * repo had no equivalent of (only a `#talk` anchor).
 */
export const metadata: Metadata = {
  title: 'Contact Us — Kingdom Impact Business Advisors',
  description:
    'Call 251-210-8445, email info@kibadvisors.com, or book a time directly. Office hours Monday to Friday, 8:30 AM to 5:00 PM.',
  alternates: { canonical: '/contact-us' },
  openGraph: {
    type: 'website',
    url: '/contact-us',
    title: 'Contact Us — Kingdom Impact Business Advisors',
    description: 'Have questions or need assistance? Our team is ready to support you.',
    images: [{ url: '/img/v2-preview.png', width: 1200, height: 630 }]
  }
};

export default function Page() {
  return <ContactUsPage />;
}
