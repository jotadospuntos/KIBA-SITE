import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProgramPage from '../ProgramPage';
import { PROGRAMS, UNLISTED_PROGRAMS, getProgram, isUnlisted } from '../solutions-data';

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
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return [...PROGRAMS, ...UNLISTED_PROGRAMS].map((program) => ({ slug: program.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const program = getProgram(params.slug);
  if (!program) return {};

  const url = `/capital-solutions/${program.slug}`;
  const title = `${program.name} — Kingdom Impact Business Advisors`;

  return {
    title,
    description: program.metaDescription,
    alternates: { canonical: url },
    /* Unlisted programs are review-by-direct-link only. Keep in step with
       app/sitemap.ts, which only lists PROGRAMS. */
    ...(isUnlisted(program.slug) ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: 'website',
      url,
      title,
      description: program.metaDescription,
      images: [{ url: '/img/v2-preview.png', width: 1200, height: 630 }]
    }
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  if (!getProgram(params.slug)) notFound();

  /* Pass the slug, not the Program - `icon` is a Lucide component and a server
     component can only hand serializable props to a client one. See the note in
     ../ProgramPage.tsx. */
  return <ProgramPage slug={params.slug} />;
}
