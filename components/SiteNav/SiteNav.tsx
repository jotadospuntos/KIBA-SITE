'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { PROGRAMS } from '@/app/capital-solutions/solutions-data';
import { TOOLS } from '@/lib/tools';

/*
 * Shared site nav: sticky bar, desktop "Capital Solutions" and "Tools & Solutions"
 * dropdowns (lib/tools.ts holds the tools list), mobile sheet with
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

/* Top-level links, likewise rendered in both the desktop bar and the sheet. */
const NAV_LINKS = [
  { href: '/about-us', label: 'About' },
  { href: '/meet-our-team', label: 'Team' },
  { href: '/referral-partners', label: 'Partners' },
  { href: '/blog', label: 'Blog' },
  /* Was '#talk'. There's a real Contact page now (app/contact-us); the
     on-page #talk anchor is still what the "Let's Talk" button targets. */
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

type MenuEntry = { href: string; title: string; desc: string };

/* One desktop dropdown: "Capital Solutions" and "Tools & Solutions" are both
   this, so the keyboard behavior described above exists once. Each instance
   owns its open state, so opening one never involves the other except through
   click-outside / blur, which close it. `idPrefix` keeps the original ids
   (solutionsItem, solutionsTrigger, solutionsPanel) for the /v2 diff. */
function NavDropdown({ idPrefix, label, items }: { idPrefix: string; label: string; items: MenuEntry[] }) {
  const [open, setOpen] = useState(false);

  const itemRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  /* Focus the nth dropdown link, wrapping (so -1 is the last one). Read from the
     DOM rather than a ref array: it's transient focus movement, not state. */
  const focusLink = useCallback((index: number) => {
    const links = Array.from(
      panelRef.current?.querySelectorAll<HTMLAnchorElement>('a[href]') ?? []
    );
    if (!links.length) return;
    links[(index + links.length) % links.length].focus();
  }, []);

  useEffect(() => {
    /* Click-outside and Escape are document-level: they have to fire for clicks
       that never reach this component. The trigger's own click is excluded by
       the contains() check, so no stopPropagation is needed. */
    const onDocClick = (e: MouseEvent) => {
      if (!itemRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onDocKeyDown = (e: KeyboardEvent) => {
      /* Guarded on `open`, as the vanilla version was: an unguarded Escape
         handler would yank focus to this trigger from anywhere on the page -
         including while the mobile sheet is closing, which has its own focus
         restore. */
      if (e.key === 'Escape' && open) close(true);
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onDocKeyDown);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onDocKeyDown);
    };
  }, [close, open]);

  return (
    <div
      className={open ? 'nav-menu-item is-open' : 'nav-menu-item'}
      id={`${idPrefix}Item`}
      ref={itemRef}
      onBlur={(e) => {
        /* Tabbing or clicking out closes it. No focus restore - focus has
           already moved somewhere deliberate. */
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        className="nav-menu-trigger"
        id={`${idPrefix}Trigger`}
        type="button"
        aria-expanded={open}
        aria-controls={`${idPrefix}Panel`}
        ref={triggerRef}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
          e.preventDefault();
          setOpen(true);
          focusLink(e.key === 'ArrowDown' ? 0 : -1);
        }}
      >{label}<Caret /></button>
      <div
        className="nav-dropdown"
        id={`${idPrefix}Panel`}
        ref={panelRef}
        onKeyDown={(e) => {
          const links = Array.from(
            panelRef.current?.querySelectorAll<HTMLAnchorElement>('a[href]') ?? []
          );
          const i = links.indexOf(document.activeElement as HTMLAnchorElement);
          if (e.key === 'ArrowDown') { e.preventDefault(); focusLink(i + 1); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); focusLink(i - 1); }
          else if (e.key === 'Home') { e.preventDefault(); focusLink(0); }
          else if (e.key === 'End') { e.preventDefault(); focusLink(-1); }
        }}
      >
        {items.map((item) => (
          <a className="nav-dropdown-item" href={item.href} key={item.href}><span className="nav-dropdown-title">{item.title}</span><span className="nav-dropdown-desc">{item.desc}</span></a>
        ))}
      </div>
    </div>
  );
}

/* The mobile sheet's counterpart: one accordion per dropdown. */
function MobileAccordion({ idPrefix, label, items, onLinkClick }: { idPrefix: string; label: string; items: MenuEntry[]; onLinkClick: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className={open ? 'mobile-accordion-trigger is-open' : 'mobile-accordion-trigger'}
        id={`${idPrefix}Trigger`}
        type="button"
        aria-expanded={open}
        aria-controls={`${idPrefix}Panel`}
        onClick={() => setOpen((o) => !o)}
      >{label}<Caret /></button>
      <div className="mobile-accordion-panel" id={`${idPrefix}Panel`} hidden={!open}>
        {items.map((item) => (
          <a href={item.href} key={item.href} onClick={onLinkClick}><span className="nav-dropdown-title">{item.title}</span><span className="nav-dropdown-desc">{item.desc}</span></a>
        ))}
      </div>
    </>
  );
}

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navToggleRef = useRef<HTMLButtonElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  /* ---------- sticky nav shrink-on-scroll ---------- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLLED_AT);
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // in case the page loads already scrolled (reload, or a #anchor)
    return () => document.removeEventListener('scroll', onScroll);
  }, []);

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
    <nav id="siteNav" className={scrolled ? 'nav-scrolled' : undefined}><div className="nav-inner"><a className="logo-mark" href="/" aria-label="Kingdom Impact Business Advisors home"><img src="/img/kiba-logo.png" alt="Kingdom Impact Business Advisors" width="263" height="120" /></a><div className="nav-menu" id="navMenu">
      <NavDropdown idPrefix="solutions" label="Capital Solutions" items={SOLUTIONS} />
      <NavDropdown idPrefix="tools" label="Tools & Solutions" items={TOOLS} />
      {NAV_LINKS.map((link) => (
        <a className="nav-menu-link" href={link.href} key={link.href}>{link.label}</a>
      ))}
    </div>
    <div className="nav-right">
      {/* The phone number is hidden across the WHOLE desktop bar (>=1000px)
          so everything else fits on one row. It's still in the bar at
          640-999px, in the mobile sheet, in every CTA band and the footer.

          It used to come back at 1280px. Adding the "Tools & Solutions"
          dropdown (~154px) ended that: .nav-inner is capped at 1180px, so
          wider screens never gain room, and with the phone the row needed
          ~1280px of content in a 1116px box - two rows (101px) at every
          width from 1280 up.

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
        className="nav-phone min-[1000px]:hidden!"
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
        <MobileAccordion idPrefix="mobileSolutions" label="Capital Solutions" items={SOLUTIONS} onLinkClick={onSheetLinkClick} />
        <MobileAccordion idPrefix="mobileTools" label="Tools & Solutions" items={TOOLS} onLinkClick={onSheetLinkClick} />
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
