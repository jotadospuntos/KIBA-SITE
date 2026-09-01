'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    /* Read by nothing in React anymore - kept because the static /v2 reference
       page and the legacy pages set and read it, and the two stay diffable. */
    __forceMotion?: boolean;
  }
}

/*
 * Shared home for the site's ?motion=1 override.
 *
 * Why it exists: the machine used for previewing reports
 * prefers-reduced-motion: reduce at the OS level (KDE's "Instant" animation
 * speed), which correctly suppresses every animation on the page - making the
 * animations impossible to review. ?motion=1 forces them on for previewing
 * only; the preference is honored by default for real visitors.
 *
 * `mounted` is returned alongside it because the query string can't be read
 * during render without breaking SSR, so entrance animations need to know when
 * it's safe to start.
 *
 * TWO HALVES, AND BOTH ARE REQUIRED. The returned `forceMotion` only covers the
 * JS-driven animations (GSAP, framer-motion, the Reveal observer). Everything
 * CSS-driven - every .reveal fade, every hover transition - is governed instead
 * by this rule in home.css:
 *
 *   @media (prefers-reduced-motion: reduce){
 *     html:not(.force-motion) *{ transition-duration:0.001ms !important; ... }
 *   }
 *
 * so the class on <html> is what actually lets those run. That class used to be
 * added by app/HomePage.tsx's own effect, which meant ?motion=1 silently did
 * half a job on every other route: the JS animations ran and every CSS one was
 * still clamped to 0.001ms. It's set here now, so any page that calls this hook
 * gets both halves. Don't move it back into a page component.
 */
export function useMotionPreference() {
  const [state, setState] = useState({ mounted: false, forceMotion: false });

  useEffect(() => {
    let forceMotion = false;
    try {
      forceMotion = new URLSearchParams(window.location.search).get('motion') === '1';
    } catch {
      /* no-op: leaves forceMotion false, so the media query alone decides */
    }

    /* Idempotent, so several components calling this hook on one page (and
       StrictMode's double-invoke in dev) are harmless. */
    window.__forceMotion = forceMotion;
    document.documentElement.classList.toggle('force-motion', forceMotion);

    setState({ mounted: true, forceMotion });
  }, []);

  return state;
}

/*
 * Imperative version of the same check, for use inside effects (where hooks
 * can't go). Mirrors the `reduceMotion` line at the top of
 * app/v3/legacy-behaviors.js exactly: the visitor's prefers-reduced-motion is
 * honored unless ?motion=1 forces animation on for previewing.
 *
 * Reads the query string directly rather than window.__forceMotion, because
 * child effects run before the parent effect that sets that flag.
 */
export function prefersReducedMotion(): boolean {
  let forceMotion = false;
  try {
    forceMotion = new URLSearchParams(window.location.search).get('motion') === '1';
  } catch {
    /* no-op: leaves forceMotion false, so the media query alone decides */
  }
  if (forceMotion) return false;
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}
