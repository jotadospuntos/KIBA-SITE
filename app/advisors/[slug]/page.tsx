import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AdvisorPage from '../AdvisorPage';
import { ADVISORS, getAdvisor } from '../advisors-data';

/*
 * /advisors/<slug> — replaces public/legacy/advisors/*.html and their
 * rewrites() entries. One dynamic route, three static pages.
 *
 * Passes the slug, not the Advisor object, matching the other dynamic routes
 * here (see the note in app/capital-solutions/ProgramPage.tsx for why).
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return ADVISORS.map((advisor) => ({ slug: advisor.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const advisor = getAdvisor(params.slug);
  if (!advisor) return {};

  const url = `https://go.kibadvisors.com/advisors/${advisor.slug}`;
  const title = `Book with ${advisor.name} — Kingdom Impact Business Advisors`;
  return {
    title,
    description: advisor.tagline,
    robots: { index: false, follow: false },
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      description: advisor.tagline,
      images: [{ url: `https://go.kibadvisors.com${advisor.photo}`, width: 800, height: 800 }]
    }
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  if (!getAdvisor(params.slug)) notFound();
  return <AdvisorPage slug={params.slug} />;
}
