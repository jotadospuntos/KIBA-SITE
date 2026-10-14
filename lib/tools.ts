/*
 * The "Tools & Solutions" nav dropdown (desktop + mobile sheet). Adding a tool
 * is one entry here. A listed tool should also be indexable: drop `robots`
 * noindex from its page.tsx and add it to app/sitemap.ts in the same change.
 */
export type SiteTool = { href: string; title: string; desc: string };

export const TOOLS: SiteTool[] = [
  {
    href: '/dscr-calculator',
    title: 'DSCR Calculator',
    desc: 'See your debt service coverage ratio in two minutes.'
  }
];
