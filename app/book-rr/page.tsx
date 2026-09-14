import type { Metadata } from 'next';
import BookPage from './BookPage';

/*
 * /book-rr — migrated off public/legacy/book-rr.html.
 */
export const metadata: Metadata = {
  title: 'Book a Call with a KIBA Advisor — Kingdom Impact Business Advisors',
  description: "Pick a time that works for you and you'll be matched with one of our advisors — no pressure, no obligation.",
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://go.kibadvisors.com/book-rr' },
  openGraph: {
    type: 'website',
    url: 'https://go.kibadvisors.com/book-rr',
    title: 'Book a Call with a KIBA Advisor — Kingdom Impact Business Advisors',
    description: "Pick a time that works for you and you'll be matched with one of our advisors — no pressure, no obligation.",
    images: [{ url: 'https://go.kibadvisors.com/img/v2-preview.png', width: 1200, height: 630 }]
  }
};

export default function Page() {
  return <BookPage />;
}
