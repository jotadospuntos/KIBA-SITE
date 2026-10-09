import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { listPublishedPosts } from '@/lib/blog/queries';
import { PROGRAMS } from './capital-solutions/solutions-data';

/*
 * /sitemap.xml — the indexable pages only. Keep this in step with `robots` in
 * each page.tsx: the booking-flow, campaign and partner/advisor pages
 * (/thank-you, /ty-cal, /book-rr, /business-acquisitions, /debt-schedule,
 * /partners/*, /advisors/*) are noindex and deliberately absent, and a
 * sitemap listing a noindex page is a contradiction Search Console flags.
 *
 * The old WordPress sitemap URLs redirect here (next.config.js).
 *
 * Blog posts come from the database, so this refreshes hourly (and the
 * dashboard refreshes it on every save).
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const page = (path: string, lastModified?: string) => ({
    url: `${SITE_URL}${path}`,
    ...(lastModified ? { lastModified } : {})
  });

  return [
    page('/'),
    page('/about-us'),
    page('/meet-our-team'),
    page('/capital-solutions'),
    ...PROGRAMS.map((p) => page(`/capital-solutions/${p.slug}`)),
    page('/blog'),
    ...(await listPublishedPosts()).map((p) => page(`/blog/${p.slug}`, p.publishedAt)),
    page('/contact-us'),
    page('/referral-partners'),
    page('/privacy-policy'),
    page('/terms-and-conditions')
  ];
}
