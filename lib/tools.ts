/*
 * The "Tools & Solutions" nav dropdown (desktop + mobile sheet). Adding a tool
 * is one entry here; the footer's column reads it too. A listed tool should
 * normally be indexable (drop `robots` noindex, add to app/sitemap.ts). The
 * debt schedule and funding application are the exception: linked by request,
 * still noindex.
 */
export type SiteTool = { href: string; title: string; desc: string };

export const TOOLS: SiteTool[] = [
  {
    href: '/dscr-calculator',
    title: 'DSCR Calculator',
    desc: 'See your debt service coverage ratio in two minutes.'
  },
  {
    href: '/debt-schedule',
    title: 'Business Debt Schedule',
    desc: 'List your business debts and get a completed schedule.'
  },
  {
    href: '/funding-application',
    title: 'Funding Application',
    desc: 'Apply online and sign in one sitting.'
  }
];
