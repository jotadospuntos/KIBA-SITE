'use client';

import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/lib/useMotionPreference';

/*
 * Animated stat counter, replacing the '[data-count-to]' block in
 * app/v3/legacy-behaviors.js. Counts 0 -> `to` over 1400ms on an easeOutCubic
 * curve once the element is 60% visible, then pins the exact target value.
 * Same numbers, same easing, same threshold as the vanilla version.
 *
 * Renders the final value during SSR ("25+", "$100M+"), exactly as the static
 * page's markup did, so the real numbers are in the HTML for a visitor with no
 * JS - the count-up is decoration layered on top, not the source of the text.
 *
 * The data-count-to / data-prefix / data-suffix attributes are gone: they only
 * existed so the vanilla querySelectorAll could find these nodes and read their
 * config. That config is now props. No CSS selector referenced them.
 */

type CounterProps = {
  /* Value to count up to. Rendered verbatim at rest, so 100 shows as "100". */
  to: number;
  prefix?: string;
  suffix?: string;
  className?: string;
};

const DURATION_MS = 1400;

export default function Counter({ to, prefix = '', suffix = '', className }: CounterProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [value, setValue] = useState<number | null>(null); // null = show the exact target

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* Reduced motion, or no IntersectionObserver: leave the final value in
       place and never animate. Same fallback as the vanilla version. */
    if (!('IntersectionObserver' in window) || prefersReducedMotion()) return;

    let frame = 0;
    let start: number | null = null;

    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      if (progress < 1) {
        setValue(Math.floor(eased * to));
        frame = requestAnimationFrame(step);
      } else {
        setValue(null); // back to the exact target, avoiding any float rounding
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            io.unobserve(entry.target);
            frame = requestAnimationFrame(step);
          }
        });
      },
      { threshold: 0.6 }
    );

    io.observe(el);

    /* The vanilla version leaked both of these; harmless for a script that ran
       once per page load, not harmless across client-side navigations. */
    return () => {
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [to]);

  /* One interpolated string, not three JSX children: separate children would
     make React emit <!-- --> text separators between them, so the rendered
     HTML would stop matching the static page byte-for-byte. */
  return (
    <div className={className} ref={ref}>
      {`${prefix}${value === null ? to : value}${suffix}`}
    </div>
  );
}
