'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/*
 * Shared site nav: sticky bar, desktop "Solutions" dropdown, mobile sheet with
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
  { href: '/meet-our-team', label: 'Team' },
  { href: '/referral-partners', label: 'Partners' },
  { href: '#talk', label: 'Contact' }
];

const PHONE_HREF = 'tel:2512108445';
const PHONE_LABEL = '251-210-8445';

const SCROLLED_AT = 24;        // px of scroll before the bar shrinks
const DESKTOP_NAV_WIDTH = 960; // viewport width at which the sheet is force-closed

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

  /* ---------- desktop Solutions dropdown ---------- */
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
         Escape handler would yank focus to the Solutions trigger from anywhere
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
        >Solutions<Caret /></button>
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
      <a className="nav-phone" href={PHONE_HREF}>{PHONE_LABEL}</a>
      <a className="btn btn-primary" href="#talk" style={{ padding: '11px 22px', fontSize: '14.5px' }}>Let&rsquo;s Talk</a>
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
        >Solutions<Caret /></button>
        <div className="mobile-accordion-panel" id="mobileSolutionsPanel" hidden={!mobileSolutionsOpen}>
          {SOLUTIONS.map((item) => (
            <a href={item.href} key={item.href} onClick={onSheetLinkClick}><span className="nav-dropdown-title">{item.title}</span><span className="nav-dropdown-desc">{item.desc}</span></a>
          ))}
        </div>
        {NAV_LINKS.map((link) => (
          <a className="mobile-menu-link" href={link.href} key={link.href} onClick={onSheetLinkClick}>{link.label}</a>
        ))}
        <div className="mobile-menu-ctas">
          <a className="btn btn-ghost" href={PHONE_HREF} onClick={onSheetLinkClick}>{PHONE_LABEL}</a>
          <a className="btn btn-primary" href="#talk" onClick={onSheetLinkClick}>Let&rsquo;s Talk</a>
        </div>
      </div>
    </div>
    </nav>
  );
}
