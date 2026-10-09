import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/* /robots.txt. Page-level noindex does the real work of keeping the booking
   flow out of search; this only fences off the API and the staff dashboard,
   and points at the sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/admin'] },
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
