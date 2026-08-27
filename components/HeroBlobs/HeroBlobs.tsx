'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { prefersReducedMotion } from '@/lib/useMotionPreference';

/*
 * The hero's cursor-reactive parallax blobs, replacing the '#heroVisual' block
 * in the since-removed app/v3/legacy-behaviors.js.
 *
 * This renders the .hero-visual container itself and takes the rest of the hero
 * visual (the HeroReveal image panel) as children, because the blobs are
 * absolutely positioned against that container and the mousemove is measured
 * relative to it.
 *
 * Transforms are written straight to the nodes via refs rather than held in
 * state: this fires on every mousemove, and routing that through React state
 * would re-render the hero on each event for a purely visual offset. The 0.6s
 * CSS transition on .cursor-blob does the smoothing, so no rAF throttle is
 * needed - matching the vanilla version.
 *
 * Gated on a fine pointer and on prefers-reduced-motion, as before: no parallax
 * for touch (where there's no hover) or for visitors who asked for less motion.
 */

type Blob = { style: CSSProperties; depth: number };

/* `depth` is the parallax travel in px - the further back the blob reads, the
   more it moves. Was a data-depth attribute the vanilla code read off the DOM;
   it's data now, so the attribute is gone. */
const BLOBS: Blob[] = [
  {
    depth: 18,
    style: {
      width: '180px',
      height: '180px',
      top: '-40px',
      left: '-50px',
      background: 'radial-gradient(circle,rgba(37,99,235,0.55),transparent 70%)'
    }
  },
  {
    depth: 28,
    style: {
      width: '140px',
      height: '140px',
      bottom: '-30px',
      right: '-30px',
      background: 'radial-gradient(circle,rgba(109,148,245,0.5),transparent 70%)'
    }
  }
];

export default function HeroBlobs({ children }: { children?: ReactNode }) {
  const blobRefs = useRef<(HTMLDivElement | null)[]>([]);
  /* Read once after mount: matchMedia and the motion preference aren't
     available during SSR, and the handlers must no-op until they're known. */
  const enabledRef = useRef(false);

  useEffect(() => {
    enabledRef.current =
      !prefersReducedMotion() && window.matchMedia('(pointer:fine)').matches;
  }, []);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabledRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;
    BLOBS.forEach((blob, i) => {
      const el = blobRefs.current[i];
      if (el) el.style.transform = `translate(${cx * blob.depth}px,${cy * blob.depth}px)`;
    });
  };

  const onMouseLeave = () => {
    if (!enabledRef.current) return;
    blobRefs.current.forEach((el) => {
      if (el) el.style.transform = 'translate(0,0)';
    });
  };

  return (
    <div
      className="hero-visual"
      id="heroVisual"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {BLOBS.map((blob, i) => (
        <div
          className="cursor-blob"
          key={i}
          style={blob.style}
          ref={(el) => {
            blobRefs.current[i] = el;
          }}
        ></div>
      ))}
      {children}
    </div>
  );
}
