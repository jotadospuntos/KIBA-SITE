/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // The debt-schedule API reads its PDF template off disk. Files in public/
  // are served by the CDN and are NOT bundled into serverless functions by
  // default, so without this the route would 500 on Vercel with ENOENT
  // while working fine locally.
  experimental: {
    outputFileTracingIncludes: {
      '/api/debt-schedule': ['./public/templates/business-debt-schedule.pdf'],
    },
  },

  // --- Phase 1 of the Next.js migration ---
  // Every page below is still the original static HTML file, now living under
  // public/legacy/. These rewrites make it so the *browser URL* stays exactly
  // the same as before, while Next quietly serves the untouched legacy file
  // underneath. As each page gets rebuilt as a real app/ route, delete its
  // entry here and its file under public/legacy/.
  async rewrites() {
    return [
      // The original static redesign draft. The React port of this page is now
      // the real homepage (app/page.tsx), and /v2 is kept ONLY as the visual
      // reference to diff the homepage against - it is noindex'd and not linked
      // from anywhere. Deleting it is a deliberate, separate decision; until
      // then it must not be "cleaned up".
      { source: '/v2', destination: '/legacy/v2.html' },
    ];
  },

  async redirects() {
    return [
      // '/' used to redirect to https://kibadvisors.com because this repo had no
      // homepage of its own. It has one now - the promoted redesign at
      // app/page.tsx - so the redirect is gone. kibadvisors.com is untouched by
      // that change; it remains a separate WordPress property (see CLAUDE.md
      // "Scope boundary").

      // /v3 was where the React port was built and reviewed. It's the root route
      // now, so the old path forwards rather than 404ing any bookmark or link
      // shared during the review. Temporary (307) on purpose: nothing external
      // depends on /v3, and a cached 308 would be awkward to undo.
      { source: '/v3', destination: '/', permanent: false },

      // Ported 1:1 from the old vercel.json.
      { source: '/partners/ace-tools', destination: '/partners/integ-funding', permanent: true },

      // --- The WordPress URL map, for the move onto kibadvisors.com ---
      // Every URL in the WordPress sitemap either exists here at the same path
      // (/, /about-us, /meet-our-team, /capital-solutions, /blog, /contact-us,
      // /privacy-policy, /terms-and-conditions) or is redirected below, so no
      // indexed or shared link 404s after the domain switch. Harmless before it:
      // nothing links to these paths on go.kibadvisors.com.

      // WordPress served posts at the root; here they live under /blog.
      ...[
        'how-to-improve-cash-flow-before-taking-on-debt',
        'how-to-know-if-your-business-is-ready-for-financing',
        'why-you-need-business-credit-and-how-to-build-it',
      ].map((slug) => ({ source: `/${slug}`, destination: `/blog/${slug}`, permanent: true })),
      { source: '/category/:slug*', destination: '/blog', permanent: true },

      // The WordPress scheduling and referral-partner pages go to /book-rr, the
      // round-robin booking page (the business's decision). Not /thank-you: that
      // page says "we've got your details" to someone who hasn't submitted anything.
      ...[
        'schedule-a-conversation',
        'schedule-a-conversation-for-referral-partners',
        'referral-partner',
        'link-for-referral-partner',
      ].map((slug) => ({ source: `/${slug}`, destination: '/book-rr', permanent: true })),
    ];
  },
};

module.exports = nextConfig;
