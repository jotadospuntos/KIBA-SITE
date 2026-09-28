import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage/LegalPage';
import { PRIVACY_POLICY } from './privacy-content';

/*
 * /privacy-policy — the authoritative text, supplied by KIBA, in
 * ./privacy-content.ts. See the warning at the top of that file before editing.
 */
export const metadata: Metadata = {
  title: 'Privacy Policy — Kingdom Impact Business Advisors',
  description:
    'How Kingdom Impact Business Advisors collects, uses, discloses and protects your personal information.',
  alternates: { canonical: '/privacy-policy' }
};

export default function Page() {
  return <LegalPage doc={PRIVACY_POLICY} />;
}
