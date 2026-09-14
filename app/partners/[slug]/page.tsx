import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PartnerPage from '../PartnerPage';
import { PARTNERS, getPartner } from '../partners-data';

/*
 * /partners/<slug> — replaces public/legacy/partners/*.html.
 *
 * The /partners/ace-tools → /partners/integ-funding redirect in
 * next.config.js is unaffected: redirects run before filesystem routing.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return PARTNERS.map((partner) => ({ slug: partner.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const partner = getPartner(params.slug);
  if (!partner) return {};

  const url = `https://go.kibadvisors.com/partners/${partner.slug}`;
  const title = `KIBA × ${partner.shortName} — Kingdom Impact Business Advisors`;
  const description = `Recommended by ${partner.name}. Navigate financing with clarity and confidence — no pressure, no obligation.`;
  return {
    title,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      images: [{ url: `https://go.kibadvisors.com${partner.ogImage}`, width: 1200, height: 630 }]
    }
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  if (!getPartner(params.slug)) notFound();
  return <PartnerPage slug={params.slug} />;
}
