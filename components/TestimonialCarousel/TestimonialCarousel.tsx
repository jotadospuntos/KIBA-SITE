'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Reveal from '@/components/Reveal/Reveal';
import { prefersReducedMotion } from '@/lib/useMotionPreference';

/*
 * Testimonial carousel, replacing the '#testimonialTrack' block in
 * app/v3/legacy-behaviors.js with real React state.
 *
 * Behavior is a faithful port of the vanilla version, quirks included - see the
 * PARITY NOTES below, because two of them look like bugs and are deliberate
 * holds rather than oversights.
 *
 * Slide width is measured from the live DOM rather than computed from
 * percentages, exactly as the vanilla version did: the slides are
 * flex:0 0 100% (mobile) / calc(100%/3) (>=860px), so their pixel width depends
 * on the viewport and has to be re-measured on resize.
 */

/* PARITY NOTES - intentional carry-overs from the vanilla implementation:
 *
 * 1. goTo clamps to slides.length - 1, NOT to maxIndex. On desktop all three
 *    slides are visible at once (perView 3, so maxIndex 0), which means the
 *    arrows and autoplay still translate the track into empty space. This is
 *    how /v2 and /v3 behave today; kept so the two stay comparable. Fixing it
 *    is a one-line change (clamp to maxIndex()) and is flagged for the human.
 *
 * 2. Autoplay stops permanently on mouseenter and never resumes on mouseleave.
 *    Reads as intentional in the original - once a visitor engages, stop moving
 *    text out from under them - so it's preserved rather than "fixed" into a
 *    pause/resume.
 *
 * 3. Dot clicks clamp to maxIndex, so on desktop every dot goes to index 0
 *    while the active dot still tracks the autoplay index. A consequence of
 *    (1); resolving (1) resolves this too.
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

  const goTo = useCallback(
    (i: number) => setIndex(Math.max(0, Math.min(i, count - 1))), // see PARITY NOTE 1
    [count]
  );

  /* Re-measure and reposition whenever the index changes or the window resizes.
     The vanilla version read slides[0].getBoundingClientRect().width on every
     update() call for the same reason. */
  useEffect(() => {
    const first = trackRef.current?.firstElementChild;
    setOffsetPx(index * (first ? first.getBoundingClientRect().width : 0));
  }, [index, resizeTick]);

  useEffect(() => {
    const onResize = () => setResizeTick((t) => t + 1);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (paused || prefersReducedMotion()) return;
    const id = setInterval(() => setIndex((i) => (i + 1 >= count ? 0 : i + 1)), AUTOPLAY_MS);
    /* The vanilla version never cleared this on teardown - fine for a script
       that ran once, a leak across client-side navigations. */
    return () => clearInterval(id);
  }, [paused, count]);

  return (
    <Reveal
      className="testimonial-carousel reveal"
      id="testimonialCarousel"
      onMouseEnter={() => setPaused(true)} // PARITY NOTE 2: no resume on leave
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
      <div className="testimonial-controls">
        <button
          className="testimonial-arrow"
          id="testimonialPrev"
          aria-label="Previous testimonial"
          onClick={() => goTo(index - 1 < 0 ? count - 1 : index - 1)}
        ><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg></button>
        <div className="testimonial-dots" id="testimonialDots">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              className={i === index ? 'testimonial-dot is-active' : 'testimonial-dot'}
              aria-label={`Go to testimonial ${i + 1}`}
              onClick={() => goTo(Math.min(i, maxIndex()))} // PARITY NOTE 3
            ></button>
          ))}
        </div>
        <button
          className="testimonial-arrow"
          id="testimonialNext"
          aria-label="Next testimonial"
          onClick={() => goTo(index + 1 >= count ? 0 : index + 1)}
        ><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg></button>
      </div>
    </Reveal>
  );
}
