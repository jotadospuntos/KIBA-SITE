'use client';

import { useEffect, useState } from 'react';

/*
 * Shared home for this page's ?motion=1 override.
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
