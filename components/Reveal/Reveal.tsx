'use client';

import { createElement, useEffect, useRef, useState } from 'react';
import type { ElementType, ReactNode } from 'react';
import { prefersReducedMotion } from '@/lib/useMotionPreference';

/*
 * Scroll-reveal fade/rise, replacing the '.reveal' IntersectionObserver block
 * in app/v3/legacy-behaviors.js. Each instance owns one observer and
 * disconnects it after the element first comes into view (the vanilla version
 * called io.unobserve for the same reason - the animation only ever plays once).
 *
 * The styling still comes from .reveal / .reveal.in-view in v3.css. This only
 * decides *when* 'in-view' gets added, so the animation is unchanged.
 *
 * WHY THIS RENDERS THE ELEMENT ITSELF AND NOT A WRAPPER
 * v3.css staggers siblings with nth-child selectors:
 *
 *   .benefits-grid .reveal:nth-child(2){ transition-delay:0.08s; }
 *
 * A <Reveal> that wrapped its children in an extra <div> would (a) shift every
 * nth-child index, killing the stagger, and (b) insert a non-grid-item between
 * the grid and its cards, breaking the layout. So `as` renders the real
 * element - <div> by default, <a href> for the card links - and all other props
 * pass straight through to it.
 *
 * Callers keep 'reveal' in their own className, exactly as in the static page;
 * this component only appends ' in-view'. That keeps the class list, and the
 * server-rendered HTML, identical to what /v2 ships.
 */

type RevealProps = {
  as?: ElementType;
  className?: string;
  children?: ReactNode;
  /* Anything else (href, id, style, ...) is forwarded to the rendered element. */
  [key: string]: unknown;
};

export default function Reveal({ as = 'div', className = '', children, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* Reduced motion, or a browser without IntersectionObserver: show the
       element straight away rather than animating it in. Same fallback the
       vanilla implementation used. */
    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    io.observe(el);
    /* Teardown matters here in a way it didn't for the vanilla version: on a
       client-side navigation away from the page these components unmount, and a
       live observer would keep the detached nodes reachable. */
    return () => io.disconnect();
  }, []);

  return createElement(
    as,
    { ...rest, ref, className: inView ? `${className} in-view` : className },
    children
  );
}
