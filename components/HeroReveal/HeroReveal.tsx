'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

/*
 * The angled clip-path reveal lifted out of the 21st.dev HeroSection block.
 * Only the animated image panel is used here - that block also ships its own
 * logo/title/subtitle/contact column, which would duplicate the hero's existing
 * left column and is styled with shadcn semantic tokens (bg-background,
 * text-muted-foreground) that don't match this page's navy palette.
 *
 * Starts as a zero-width sliver pinned to the right edge and wipes left into a
 * slanted parallelogram, so the panel's left edge ends up diagonal.
 */

const CLIPPED = 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)';
const REVEALED = 'polygon(25% 0, 100% 0, 100% 100%, 0% 100%)';

interface HeroRevealProps {
  image: string;
  /* Describes the photo: the panel is a background image, so there's no <img>
     alt to carry it. Exposed via role="img" + aria-label instead. */
  alt: string;
  className?: string;
}

export default function HeroReveal({ image, alt, className }: HeroRevealProps) {
  const prefersReduced = useReducedMotion();

  /* Mount gate. Two reasons: the search param can't be read during render
     without breaking SSR, and framer-motion's useReducedMotion only looks at
     the media query - it doesn't know about this page's ?motion=1 override, so
     without this the reveal would be silently skipped on a machine that reports
     reduce (e.g. KDE's "Instant" animation speed) even with the override on. */
  const [mounted, setMounted] = useState(false);
  const [forceMotion, setForceMotion] = useState(false);

  useEffect(() => {
    try {
      setForceMotion(new URLSearchParams(window.location.search).get('motion') === '1');
    } catch {
      /* no-op: leaves forceMotion false, so the media query decides */
    }
    setMounted(true);
  }, []);

  const shouldAnimate = !prefersReduced || forceMotion;

  return (
    <motion.div
      className={className}
      style={{ backgroundImage: `url(${image})` }}
      role="img"
      aria-label={alt}
      initial={{ clipPath: CLIPPED }}
      animate={{ clipPath: mounted ? REVEALED : CLIPPED }}
      transition={{ duration: mounted && shouldAnimate ? 1.2 : 0, ease: 'circOut' }}
    />
  );
}
