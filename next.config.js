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

  // Ported 1:1 from the old vercel.json.
  async redirects() {
    return [
      { source: '/', destination: 'https://kibadvisors.com', permanent: false },
      { source: '/partners/ace-tools', destination: '/partners/integ-funding', permanent: true },
    ];
  },
};

module.exports = nextConfig;
