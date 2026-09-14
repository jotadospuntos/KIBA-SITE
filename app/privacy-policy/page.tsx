import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage/LegalPage';
import { PRIVACY_POLICY } from './privacy-content';

/*
 * /privacy-policy — the authoritative text, supplied by KIBA, in
 * ./privacy-content.ts. See the warning at the top of that file before editing.
 *
 * NOINDEX matches the rest of the subdomain, and kibadvisors.com/privacy-policy/
 * remains the indexable copy. NOTE: the two are now separate documents that can
 * drift — if this one is updated, the WordPress page needs the same change.
 */
export const metadata: Metadata = {
  title: 'Privacy Policy — Kingdom Impact Business Advisors',
  description:
    'How Kingdom Impact Business Advisors collects, uses, discloses and protects your personal information.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://go.kibadvisors.com/privacy-policy' }
};

export default function Page() {
  return <LegalPage doc={PRIVACY_POLICY} />;
}
