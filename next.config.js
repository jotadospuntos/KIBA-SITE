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
    ];
  },
};

module.exports = nextConfig;
