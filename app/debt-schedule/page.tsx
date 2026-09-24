import type { Metadata } from 'next';
import DebtSchedulePage from './DebtSchedulePage';

/*
 * /debt-schedule — the online version of KIBA's Business Debt Schedule, the
 * form clients fill in before funding is structured. One public page (no
 * per-client links). See docs/debt-schedule-build-spec.md.
 *
 * NOINDEX matches the rest of the subdomain, and is doubly right here: it's an
 * intake form reached by a direct link from an advisor, not a landing page.
 */
export const metadata: Metadata = {
  title: 'Business Debt Schedule — Kingdom Impact Business Advisors',
  description:
    'List the loans, lines of credit and cards held in your business’s name, so your KIBA advisor has an accurate picture before structuring your funding.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://go.kibadvisors.com/debt-schedule' }
};

export default function Page() {
  return <DebtSchedulePage />;
}
