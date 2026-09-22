'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { PROGRAMS } from '@/app/capital-solutions/solutions-data';

/*
 * Shared site nav: sticky bar, desktop "Capital Solutions" dropdown, mobile sheet with
 * accordion. Reused by every migrated route, so the markup lives here once
 * rather than being copy-pasted the way the legacy public/legacy/*.html pages
 * copy their headers (see CLAUDE.md "Golden rules").
 *
 * All of the interactive behavior is React state now - the sticky-scroll class,
 * both open/closed flags, and the accordion. It used to live in
 * the since-removed app/v3/legacy-behaviors.js driving these nodes by getElementById.
 *
 * The ids (siteNav, navMenu, solutionsItem, ...) are kept even though nothing
 * looks them up anymore: they're in the rendered HTML of the static /v2
 * reference too, so keeping them makes /v3 diffable against it.
 *
 * KEYBOARD BEHAVIOR IS LOAD-BEARING - ported deliberately, not incidentally:
 *  - Dropdown: ArrowDown/ArrowUp from the trigger open the panel and move into
 *    it, ArrowDown/ArrowUp/Home/End cycle within it, Escape closes and puts
 *    focus back on the trigger, and tabbing or clicking out closes it.
 *  - Mobile sheet: a focus trap while open. Tab cycles the toggle plus the
 *    sheet's own controls instead of escaping into the page behind it, which is
 *    visible but unreachable. Escape closes and restores focus to the toggle.
 *  - Focus is only restored when the thing losing focus is about to disappear;
 *    otherwise focus has already moved somewhere deliberate and yanking it back
 *    would be wrong.
 * Re-verify all of the above by keyboard if you touch this component.
 */

/* Capital Solutions entries, rendered twice: the desktop dropdown and the
   mobile accordion. One list so the two can't drift apart.

   These are derived from PROGRAMS in app/capital-solutions/solutions-data.ts,
   so adding a seventh program adds a nav entry automatically and the two can't
   disagree about what exists. The hub link is prepended by hand because it
   isn't a program.

   NOTE: the dropdown used to hold '/business-acquisitions' (a legacy campaign
   landing page with its own GHL form, still live and untouched) and '/book-rr'.
   Business acquisition financing is now a program page under here; the legacy
   page is still reachable at its own URL and is still where its ad traffic
   lands. Retiring or merging it is a separate, deliberate decision. */
const SOLUTIONS = [
  {
    href: '/capital-solutions',
    title: 'All Capital Solutions',
    desc: 'Start here if you’re not sure which one fits.'
  },
  ...PROGRAMS.map((program) => ({
    href: `/capital-solutions/${program.slug}`,
    title: program.navTitle,
    desc: program.navDesc
  }))
];

/* Top-level links, likewise rendered in both the desktop bar and the sheet.
   "About" used to point at the separate kibadvisors.com WordPress site, because
   this repo had no about page. It has one now (app/about-us), so the link stays
   on this subdomain. kibadvisors.com/about-us/ is untouched and still the
   indexable copy - see CLAUDE.md "Scope boundary". */
const NAV_LINKS = [
  { href: '/about-us', label: 'About' },
  { href: '/meet-our-team', label: 'Team' },
  { href: '/referral-partners', label: 'Partners' },
  { href: '/blog', label: 'Blog' },
  /* Was '#talk'. There's a real Contact page now (app/contact-us), which is
     what kibadvisors.com links to as well; the on-page #talk anchor is still
     what the "Let's Talk" button targets. */
  { href: '/contact-us', label: 'Contact' }
];

const PHONE_HREF = 'tel:2512108445';
const PHONE_LABEL = '251-210-8445';

/* Existing-client login. A separate application on its own subdomain, so it
   opens in a new tab and is styled as a secondary (ghost) button — it's a
   different job from "Let's Talk", which is the prospect CTA. The live
   WordPress nav has the same item. */
const PORTAL_HREF = 'https://portal.kibadvisors.com/client';
const PORTAL_LABEL = 'Client Portal';

const SCROLLED_AT = 24;        // px of scroll before the bar shrinks
const DESKTOP_NAV_WIDTH = 1000; // viewport width at which the sheet is force-closed

function Caret() {
  return (
    <svg className="nav-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
  );
}

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);

  const solutionsItemRef = useRef<HTMLDivElement | null>(null);
  const solutionsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const solutionsPanelRef = useRef<HTMLDivElement | null>(null);
  const navToggleRef = useRef<HTMLButtonElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  /* ---------- sticky nav shrink-on-scroll ---------- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLLED_AT);
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // in case the page loads already scrolled (reload, or a #anchor)
    return () => document.removeEventListener('scroll', onScroll);
  }, []);

  /* ---------- desktop Capital Solutions dropdown ---------- */
  const closeSolutions = useCallback((restoreFocus: boolean) => {
    setSolutionsOpen(false);
    if (restoreFocus) solutionsTriggerRef.current?.focus();
  }, []);

  /* Focus the nth dropdown link, wrapping (so -1 is the last one). Read from the
     DOM rather than a ref array: it's transient focus movement, not state. */
  const focusSolutionsLink = useCallback((index: number) => {
    const links = Array.from(
      solutionsPanelRef.current?.querySelectorAll<HTMLAnchorElement>('a[href]') ?? []
    );
    if (!links.length) return;
    links[(index + links.length) % links.length].focus();
  }, []);

  useEffect(() => {
    /* Click-outside and Escape are document-level: they have to fire for clicks
       that never reach this component. The trigger's own click is excluded by
       the contains() check, so no stopPropagation is needed. */
    const onDocClick = (e: MouseEvent) => {
      if (!solutionsItemRef.current?.contains(e.target as Node)) setSolutionsOpen(false);
    };
    const onDocKeyDown = (e: KeyboardEvent) => {
      /* Guarded on solutionsOpen, as the vanilla version was: an unguarded
         Escape handler would yank focus to the Capital Solutions trigger from anywhere
         on the page - including while the mobile sheet is closing, which has
         its own focus restore. */
      if (e.key === 'Escape' && solutionsOpen) closeSolutions(true);
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onDocKeyDown);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onDocKeyDown);
    };
  }, [closeSolutions, solutionsOpen]);

  /* ---------- mobile sheet ---------- */

  /* The toggle plus every *visible* focusable inside the sheet, in tab order.
     offsetParent filters out anything in a collapsed accordion panel
     (display:none), which must not be a tab stop. */
  const mobileFocusables = useCallback((): HTMLElement[] => {
    const inSheet = Array.from(
      sheetRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []
    ).filter((el) => el.offsetParent !== null);
    return navToggleRef.current ? [navToggleRef.current, ...inSheet] : inSheet;
  }, []);

  const closeMobile = useCallback((restoreFocus: boolean) => {
    setMobileOpen(false);
    if (restoreFocus) navToggleRef.current?.focus();
  }, []);

  /* On open, move focus into the sheet (items[0] is the toggle itself). Runs
     after paint so the sheet is no longer hidden and is focusable. */
  useEffect(() => {
    if (!mobileOpen) return;
    const items = mobileFocusables();
    if (items.length > 1) items[1].focus();
  }, [mobileOpen, mobileFocusables]);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobile(true);
        return;
      }
      if (e.key !== 'Tab') return;
      /* Focus trap: wrap at both ends of [toggle, ...sheet controls]. */
      const items = mobileFocusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    /* Past the desktop breakpoint the sheet becomes display:none, so close it.
       Restore focus only if focus was inside it - otherwise focus would be
       dropped to the body. */
    const onResize = () => {
      if (window.innerWidth >= DESKTOP_NAV_WIDTH) {
        closeMobile(!!sheetRef.current?.contains(document.activeElement));
      }
    };

    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [mobileOpen, mobileFocusables, closeMobile]);

  /* Links close the sheet on the way out; no focus restore, since the page is
     navigating (or jumping to an anchor). */
  const onSheetLinkClick = () => closeMobile(false);

  return (
    <nav id="siteNav" className={scrolled ? 'nav-scrolled' : undefined}><div className="nav-inner"><a className="logo-mark" href="https://kibadvisors.com" aria-label="Kingdom Impact Business Advisors home"><img src="/img/kiba-logo.png" alt="Kingdom Impact Business Advisors" width="263" height="120" /></a><div className="nav-menu" id="navMenu">
      <div
        className={solutionsOpen ? 'nav-menu-item is-open' : 'nav-menu-item'}
        id="solutionsItem"
        ref={solutionsItemRef}
        onBlur={(e) => {
          /* Tabbing or clicking out closes it. No focus restore - focus has
             already moved somewhere deliberate. */
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setSolutionsOpen(false);
        }}
      >
        <button
          className="nav-menu-trigger"
          id="solutionsTrigger"
          type="button"
          aria-expanded={solutionsOpen}
          aria-controls="solutionsPanel"
          ref={solutionsTriggerRef}
          onClick={() => setSolutionsOpen((open) => !open)}
          onKeyDown={(e) => {
            if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
            e.preventDefault();
            setSolutionsOpen(true);
            focusSolutionsLink(e.key === 'ArrowDown' ? 0 : -1);
          }}
        >Capital Solutions<Caret /></button>
        <div
          className="nav-dropdown"
          id="solutionsPanel"
          ref={solutionsPanelRef}
          onKeyDown={(e) => {
            const links = Array.from(
              solutionsPanelRef.current?.querySelectorAll<HTMLAnchorElement>('a[href]') ?? []
            );
            const i = links.indexOf(document.activeElement as HTMLAnchorElement);
            if (e.key === 'ArrowDown') { e.preventDefault(); focusSolutionsLink(i + 1); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); focusSolutionsLink(i - 1); }
            else if (e.key === 'Home') { e.preventDefault(); focusSolutionsLink(0); }
            else if (e.key === 'End') { e.preventDefault(); focusSolutionsLink(-1); }
          }}
        >
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
      {/* The phone number steps aside across the whole desktop bar until
          1280px so everything else fits on one row. It's still in every CTA
          band and the footer.

          THIS GREW ONCE, and so did the desktop breakpoint. Both were 960px
          when the CTA read "Let's Talk" (~110px wide). "Start the
          Conversation" is 208px, which pushed the bar to two rows everywhere
          below 1280px. Hiding the number reclaimed 1100-1279, tightening the
          menu reclaimed 1000-1099, and below 1000px the hamburger now takes
          over - at 960-999 there was no combination of paddings that fitted
          the full menu, the portal button and a 208px pill without cramming.
          The mobile sheet carries every link and the portal, so nothing is
          lost there. If the CTA text changes again, re-measure at
          960/1000/1024/1060/1100/1180/1280 - .nav-inner must stay 78px. */}
      <a
        className="nav-phone min-[1000px]:max-[1279px]:hidden!"
        href={PHONE_HREF}
      >{PHONE_LABEL}</a>
      {/* Desktop only: below 1000px the mobile sheet carries this, and keeping
          it in the top bar wrapped the nav on phones. */}
      <a
        className="btn btn-ghost nav-portal hidden! min-[1000px]:inline-flex! whitespace-nowrap"
        href={PORTAL_HREF}
        target="_blank"
        rel="noopener noreferrer"
        style={{ padding: '10px 18px', fontSize: '14.5px' }}
      >
        {PORTAL_LABEL}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
      {/* nowrap: at ~1100px the label broke onto two lines inside the pill,
          which is what actually made the bar 100px tall rather than the row
          wrapping. */}
      <a className="btn btn-primary whitespace-nowrap" href="#talk" style={{ padding: '11px 22px', fontSize: '14.5px' }}>Start the Conversation</a>
      <button
        className={mobileOpen ? 'nav-toggle is-open' : 'nav-toggle'}
        id="navToggle"
        type="button"
        aria-expanded={mobileOpen}
        aria-controls="mobileMenu"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        ref={navToggleRef}
        onClick={() => setMobileOpen((open) => !open)}
      >
        <svg className="nav-toggle-icon nav-toggle-icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        <svg className="nav-toggle-icon nav-toggle-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>
    </div>
    <div className="mobile-menu" id="mobileMenu" hidden={!mobileOpen} ref={sheetRef}>
      <div className="mobile-menu-inner">
        <button
          className={mobileSolutionsOpen ? 'mobile-accordion-trigger is-open' : 'mobile-accordion-trigger'}
          id="mobileSolutionsTrigger"
          type="button"
          aria-expanded={mobileSolutionsOpen}
          aria-controls="mobileSolutionsPanel"
          onClick={() => setMobileSolutionsOpen((open) => !open)}
        >Capital Solutions<Caret /></button>
        <div className="mobile-accordion-panel" id="mobileSolutionsPanel" hidden={!mobileSolutionsOpen}>
          {SOLUTIONS.map((item) => (
            <a href={item.href} key={item.href} onClick={onSheetLinkClick}><span className="nav-dropdown-title">{item.title}</span><span className="nav-dropdown-desc">{item.desc}</span></a>
          ))}
        </div>
        {NAV_LINKS.map((link) => (
          <a className="mobile-menu-link" href={link.href} key={link.href} onClick={onSheetLinkClick}>{link.label}</a>
        ))}
        <div className="mobile-menu-ctas">
          <a
            className="btn btn-ghost"
            href={PORTAL_HREF}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onSheetLinkClick}
          >
            {PORTAL_LABEL}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a className="btn btn-ghost" href={PHONE_HREF} onClick={onSheetLinkClick}>{PHONE_LABEL}</a>
          <a className="btn btn-primary" href="#talk" onClick={onSheetLinkClick}>Start the Conversation</a>
        </div>
      </div>
    </div>
    </nav>
  );
}
