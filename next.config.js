/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

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
      { source: '/referral-partners', destination: '/legacy/referral-partners.html' },
      { source: '/business-acquisitions', destination: '/legacy/business-acquisitions.html' },
      { source: '/book-rr', destination: '/legacy/book-rr.html' },
      { source: '/thank-you', destination: '/legacy/thank-you.html' },
      { source: '/ty-cal', destination: '/legacy/ty-cal.html' },
      { source: '/partners/rivenway', destination: '/legacy/partners/rivenway.html' },
      { source: '/partners/integ-funding', destination: '/legacy/partners/integ-funding.html' },
      { source: '/advisors/ariel-austria', destination: '/legacy/advisors/ariel-austria.html' },
      { source: '/advisors/barbara-sylkatis', destination: '/legacy/advisors/barbara-sylkatis.html' },
      { source: '/advisors/michael-sylkatis', destination: '/legacy/advisors/michael-sylkatis.html' },
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
    ];
  },
};

module.exports = nextConfig;
