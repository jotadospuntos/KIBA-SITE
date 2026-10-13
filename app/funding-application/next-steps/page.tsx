import type { Metadata } from 'next';
import NextStepsPage from './NextStepsPage';

/*
 * /funding-application/next-steps — where applicants land after signing the
 * lending application. SignWell sends them here: its redirect_url (set per
 * document in lib/funding-application/signwell.ts) for anyone signing from the
 * emailed link, and SigningView's "completed" handler for the embedded modal.
 *
 * NOINDEX and unlinked, like the application itself.
 */
export const metadata: Metadata = {
  title: 'Application Signed — Kingdom Impact Business Advisors',
  description: 'Your application is signed. Book your call with a KIBA advisor and get your debt schedule ready.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/funding-application/next-steps' }
};

export default function Page() {
  return <NextStepsPage />;
}
