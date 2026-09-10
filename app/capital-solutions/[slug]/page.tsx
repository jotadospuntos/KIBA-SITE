import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProgramPage from '../ProgramPage';
import { PROGRAMS, getProgram } from '../solutions-data';

/*
 * /capital-solutions/<program> — one dynamic route serving all six program
 * pages, rather than six route folders with the same layout copy-pasted into
 * each. generateStaticParams means they still build as six static pages, so
 * there's no runtime cost to sharing the route.
 *
 * Adding a program: add an entry to PROGRAMS in ../solutions-data.ts and a line
 * to SOLUTIONS in components/SiteNav. Nothing here changes.
 *
 * dynamicParams=false so an unknown slug 404s at build/serve time instead of
 * trying to render a page with no content.
 *
 * NOINDEX matches the rest of the subdomain, and is the same call as the other
 * routes: kibadvisors.com/capital-solutions/ is the indexable copy of this
 * material. See CLAUDE.md "Scope boundary" — flipping it is the human's.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return PROGRAMS.map((program) => ({ slug: program.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const program = getProgram(params.slug);
  if (!program) return {};

  const url = `https://go.kibadvisors.com/capital-solutions/${program.slug}`;
  const title = `${program.name} — Kingdom Impact Business Advisors`;

  return {
    title,
    description: program.metaDescription,
    robots: { index: false, follow: false },
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      description: program.metaDescription,
      images: [{ url: 'https://go.kibadvisors.com/img/v2-preview.png', width: 1200, height: 630 }]
    }
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  const program = getProgram(params.slug);
  if (!program) notFound();

  return <ProgramPage program={program} />;
}
