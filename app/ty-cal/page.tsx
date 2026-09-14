import type { Metadata } from 'next';
import TyCalPage from './TyCalPage';

/*
 * /ty-cal — migrated off public/legacy/ty-cal.html.
 */
export const metadata: Metadata = {
  title: 'Appointment Confirmed — Kingdom Impact Business Advisors',
  description: "You're booked. Here's how to make the most of our time together.",
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://go.kibadvisors.com/ty-cal' },
  openGraph: {
    type: 'website',
    url: 'https://go.kibadvisors.com/ty-cal',
    title: 'Appointment Confirmed — Kingdom Impact Business Advisors',
    description: "You're booked. Here's how to make the most of our time together.",
    images: [{ url: 'https://go.kibadvisors.com/img/v2-preview.png', width: 1200, height: 630 }]
  }
};

export default function Page() {
  return <TyCalPage />;
}
