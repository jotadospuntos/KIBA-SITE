'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Reveal from '@/components/Reveal/Reveal';
import { prefersReducedMotion } from '@/lib/useMotionPreference';

/*
 * Testimonial carousel, replacing the '#testimonialTrack' block in
 * the since-removed app/v3/legacy-behaviors.js with real React state.
 *
 * Ported from the vanilla version, then three of its bugs fixed - see FIXED
 * RELATIVE TO THE VANILLA VERSION below.
 *
 * Slide width is measured from the live DOM rather than computed from
 * percentages, exactly as the vanilla version did: the slides are
 * flex:0 0 100% (mobile) / calc(100%/3) (>=860px), so their pixel width depends
 * on the viewport and has to be re-measured on resize.
 */

/* FIXED RELATIVE TO THE VANILLA VERSION (approved by the human, so /v3 now
 * deliberately behaves better than /v2 here - /v2 is a static reference and is
 * not being updated to match):
 *
 * 1. goTo now clamps to maxIndex, not slides.length - 1. The vanilla version
 *    let the arrows and autoplay translate the track past the last full view,
 *    so on desktop - where all three slides are already visible (perView 3,
 *    maxIndex 0) - it scrolled into empty space every 6 seconds.
 *
 * 2. The controls hide themselves when there is nothing to scroll to. With
 *    three slides and perView 3, desktop has a single reachable position, so
 *    arrows and dots would be inert decoration. Handled in CSS via
 *    .testimonial-controls.fits-desktop rather than a client-side viewport
 *    read, so there is no hydration flash - and `fitsDesktop` is derived from
 *    the slide count, so adding a fourth testimonial brings the controls back
 *    automatically.
 *
 * 3. Autoplay now resumes on mouseleave instead of stopping permanently on
 *    first hover.
 */
type Testimonial = {
  quote: string;
  /* Rendered as <strong>{name}</strong> — {role} */
  name: string;
  role: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Michael worked tirelessly with us to obtain our SBA loan and helped us understand the process throughout. He made an otherwise stressful process easy and successful! Highly recommend his services!',
    name: 'Business Owner',
    role: 'SBA Loan Client'
  },
  {
    quote:
      'Michael & Barbara helped us navigate the complexities of an SBA loan. They were patient and proficient with their work, and made the process extremely easy. I would work with them again.',
    name: 'Business Owner',
    role: 'SBA Loan Client'
  },
  {
    quote:
      'We continue to work with Michael because of his deep experience in the lending space and his genuine commitment to doing what’s right for each client. That level of integrity is why we confidently refer our clients to him.',
    name: 'Paul Childers',
    role: 'RivenWay Business Solutions'
  }
];

const AUTOPLAY_MS = 6000;
const DESKTOP_MIN_WIDTH = 860;

export default function TestimonialCarousel() {
  const count = TESTIMONIALS.length;
  /* 3 = perView above 860px. If every slide fits there, the controls have
     nothing to do on desktop and CSS hides them - see v3.css. */
  const fitsDesktop = count <= 3;
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [index, setIndex] = useState(0);
  /* null until measured, so the server-rendered track carries no inline
     transform - same markup the static page shipped. */
  const [offsetPx, setOffsetPx] = useState<number | null>(null);
  const [resizeTick, setResizeTick] = useState(0);
  const [paused, setPaused] = useState(false);

  /* Matches the vanilla `perView = window.innerWidth >= 860 ? 3 : 1`. Read at
     click time rather than held in state, so there's no SSR guess to mismatch. */
  const maxIndex = useCallback(
    () => Math.max(0, count - (window.innerWidth >= DESKTOP_MIN_WIDTH ? 3 : 1)),
    [count]
  );

  /* Clamped to maxIndex, so the track never scrolls past the last full view. */
  const goTo = useCallback((i: number) => setIndex(Math.max(0, Math.min(i, maxIndex()))), [maxIndex]);

  /* Re-measure and reposition whenever the index changes or the window resizes.
     The vanilla version read slides[0].getBoundingClientRect().width on every
     update() call for the same reason. */
  useEffect(() => {
    /* A resize can shrink maxIndex (mobile -> desktop) and leave the index out
       past it; pull it back before measuring. */
    const max = maxIndex();
    if (index > max) {
      setIndex(max);
      return;
    }
    const first = trackRef.current?.firstElementChild;
    setOffsetPx(index * (first ? first.getBoundingClientRect().width : 0));
  }, [index, resizeTick, maxIndex]);

  useEffect(() => {
    const onResize = () => setResizeTick((t) => t + 1);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (paused || prefersReducedMotion()) return;
    /* No-op while maxIndex is 0 (desktop): i + 1 > 0 wraps straight back to 0. */
    const id = setInterval(
      () => setIndex((i) => (i + 1 > maxIndex() ? 0 : i + 1)),
      AUTOPLAY_MS
    );
    /* The vanilla version never cleared this on teardown - fine for a script
       that ran once, a leak across client-side navigations. */
    return () => clearInterval(id);
  }, [paused, maxIndex]);

  return (
    <Reveal
      className="testimonial-carousel reveal"
      id="testimonialCarousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="testimonial-viewport">
        <div
          className="testimonial-track"
          id="testimonialTrack"
          ref={trackRef}
          style={offsetPx === null ? undefined : { transform: `translateX(-${offsetPx}px)` }}
        >
          {TESTIMONIALS.map((t, i) => (
            <div className="testimonial-slide" key={i}>
              <div className="testimonial-card border-glow-card"><span className="edge-light"></span>
                <div className="quote-mark">&ldquo;</div>
                <p className="quote">{t.quote}</p>
                <div className="testimonial-attrib"><strong>{t.name}</strong>{` — ${t.role}`}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={fitsDesktop ? 'testimonial-controls fits-desktop' : 'testimonial-controls'}>
        <button
          className="testimonial-arrow"
          id="testimonialPrev"
          aria-label="Previous testimonial"
          onClick={() => goTo(index - 1 < 0 ? maxIndex() : index - 1)}
        ><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg></button>
        <div className="testimonial-dots" id="testimonialDots">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              className={i === index ? 'testimonial-dot is-active' : 'testimonial-dot'}
              aria-label={`Go to testimonial ${i + 1}`}
              onClick={() => goTo(i)}
            ></button>
          ))}
        </div>
        <button
          className="testimonial-arrow"
          id="testimonialNext"
          aria-label="Next testimonial"
          onClick={() => goTo(index + 1 > maxIndex() ? 0 : index + 1)}
        ><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg></button>
      </div>
    </Reveal>
  );
}
