import type { Metadata } from 'next';

/*
 * page.tsx is a client component (it drives the ported DOM behaviors from a
 * useEffect), and client components can't export metadata - hence this layout.
 *
 * noindex matches /v2: this is an unapproved redesign preview and must not be
 * crawled or compete with the real kibadvisors.com in search results.
 */
export const metadata: Metadata = {
  title: '[PREVIEW] Kingdom Impact Business Advisors — Funding & Growth Capital',
  description:
    'Kingdom Impact Business Advisors helps business owners access bank-ready funding and growth capital — with clarity, integrity, and decades of lending experience.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://go.kibadvisors.com/v3' },
  openGraph: {
    type: 'website',
    url: 'https://go.kibadvisors.com/v3',
    title: 'Kingdom Impact Business Advisors — Funding & Growth Capital',
    description:
      'Kingdom Impact Business Advisors helps business owners access bank-ready funding and growth capital.',
    images: [{ url: 'https://go.kibadvisors.com/img/v2-preview.png', width: 1200, height: 630 }]
  }
};

export default function V3Layout({ children }: { children: React.ReactNode }) {
  return children;
}
