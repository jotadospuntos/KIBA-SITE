import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage/LegalPage';
import { TERMS_AND_CONDITIONS } from './terms-content';

/*
 * /terms-and-conditions — the authoritative text, supplied by KIBA, in
 * ./terms-content.ts. See the warning at the top of that file before editing.
 *
 * The path matches the WordPress URL (kibadvisors.com/terms-and-conditions/),
 * so links to it keep working when this site moves onto the main domain.
 */
export const metadata: Metadata = {
  title: 'Terms & Conditions — Kingdom Impact Business Advisors',
  description:
    'The terms that govern your use of the Kingdom Impact Business Advisors website and services, including communications and SMS consent.',
  alternates: { canonical: '/terms-and-conditions' }
};

export default function Page() {
  return <LegalPage doc={TERMS_AND_CONDITIONS} />;
}
