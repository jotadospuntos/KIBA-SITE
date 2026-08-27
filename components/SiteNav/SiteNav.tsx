/*
 * Shared site nav (sticky bar + Solutions dropdown + mobile sheet).
 *
 * Extracted verbatim out of app/v3/page.tsx so the next migrated route reuses
 * this instead of copy-pasting the markup - the same drift trap the legacy
 * public/legacy/*.html pages fell into (see CLAUDE.md "Golden rules").
 *
 * IMPORTANT: the interactive behavior still lives in app/v3/legacy-behaviors.js,
 * which finds these nodes by id (siteNav, navMenu, solutionsItem,
 * solutionsTrigger, solutionsPanel, navToggle, mobileMenu,
 * mobileSolutionsTrigger, mobileSolutionsPanel). Don't rename or drop those ids
 * until that behavior is moved into React state (planned as a later step) -
 * the nav would silently stop opening.
 *
 * Rendered output is byte-for-byte the same as the inline version it replaced,
 * so /v3 still pixel-diffs clean against /v2.
 */

/* Solutions entries, rendered twice: the desktop dropdown and the mobile
   accordion. One list so the two can't drift apart. */
const SOLUTIONS = [
  {
    href: '/business-acquisitions',
    title: 'Business Acquisitions',
    desc: 'Financing to acquire an existing business.'
  },
  {
    href: '/book-rr',
    title: 'Book a Consultation',
    desc: 'Schedule time with an advisor to map out your options.'
  }
];

/* Top-level links, likewise rendered in both the desktop bar and the sheet.
   "About" points at the separate kibadvisors.com WordPress site on purpose. */
const NAV_LINKS = [
  { href: 'https://kibadvisors.com', label: 'About' },
  { href: '/referral-partners', label: 'Partners' },
  { href: '#talk', label: 'Contact' }
];

const PHONE_HREF = 'tel:2512108445';
const PHONE_LABEL = '251-210-8445';

function Caret() {
  return (
    <svg className="nav-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
  );
}

export default function SiteNav() {
  return (
    <nav id="siteNav"><div className="nav-inner"><a className="logo-mark" href="https://kibadvisors.com" aria-label="Kingdom Impact Business Advisors home"><img src="/img/kiba-logo.png" alt="Kingdom Impact Business Advisors" width="263" height="120" /></a><div className="nav-menu" id="navMenu">
      <div className="nav-menu-item" id="solutionsItem">
        <button className="nav-menu-trigger" id="solutionsTrigger" type="button" aria-expanded="false" aria-controls="solutionsPanel">Solutions<Caret /></button>
        <div className="nav-dropdown" id="solutionsPanel">
          {SOLUTIONS.map((item) => (
            <a className="nav-dropdown-item" href={item.href} key={item.href}><span className="nav-dropdown-title">{item.title}</span><span className="nav-dropdown-desc">{item.desc}</span></a>
          ))}
        </div>
      </div>
      {NAV_LINKS.map((link) => (
        <a className="nav-menu-link" href={link.href} key={link.href}>{link.label}</a>
      ))}
    </div>
    <div className="nav-right">
      <a className="nav-phone" href={PHONE_HREF}>{PHONE_LABEL}</a>
      <a className="btn btn-primary" href="#talk" style={{ padding: '11px 22px', fontSize: '14.5px' }}>Let&rsquo;s Talk</a>
      <button className="nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="mobileMenu" aria-label="Open menu">
        <svg className="nav-toggle-icon nav-toggle-icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        <svg className="nav-toggle-icon nav-toggle-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>
    </div>
    <div className="mobile-menu" id="mobileMenu" hidden>
      <div className="mobile-menu-inner">
        <button className="mobile-accordion-trigger" id="mobileSolutionsTrigger" type="button" aria-expanded="false" aria-controls="mobileSolutionsPanel">Solutions<Caret /></button>
        <div className="mobile-accordion-panel" id="mobileSolutionsPanel" hidden>
          {SOLUTIONS.map((item) => (
            <a href={item.href} key={item.href}><span className="nav-dropdown-title">{item.title}</span><span className="nav-dropdown-desc">{item.desc}</span></a>
          ))}
        </div>
        {NAV_LINKS.map((link) => (
          <a className="mobile-menu-link" href={link.href} key={link.href}>{link.label}</a>
        ))}
        <div className="mobile-menu-ctas">
          <a className="btn btn-ghost" href={PHONE_HREF}>{PHONE_LABEL}</a>
          <a className="btn btn-primary" href="#talk">Let&rsquo;s Talk</a>
        </div>
      </div>
    </div>
    </nav>
  );
}
