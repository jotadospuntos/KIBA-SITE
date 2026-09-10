'use client';

/*
 * Testimonials — the one treatment for every page on this site.
 *
 * This is the v2 block, and it REPLACES components/ui/testimonials-columns-1.tsx
 * (deleted). What v2 adds over v1: semantic list/blockquote/cite markup, cards
 * that lift on hover *and* on keyboard focus, a pill badge above the heading,
 * a section entrance animation, and a softer mask.
 *
 * CHANGES FROM THE BLOCK AS SHIPPED — the same substitutions as every other
 * block integrated here (see CLAUDE.md "Adapting third-party blocks"):
 *
 * 1. No dark-mode toggle and no `App` wrapper. The block ships a full demo page
 *    with a fixed-position Sun/Moon button; this site has no dark mode. Every
 *    `dark:` pair collapsed to the KIBA light palette.
 *
 * 2. Props-driven off lib/testimonials.ts rather than nine hard-coded fake
 *    quotes and stock avatars.
 *
 * 3. Column count adapts to how many testimonials exist, and phones get one
 *    column containing all of them. The block hard-codes three columns of three
 *    and hides two of them below `md` — with our four real testimonials that
 *    would loop one card per column and hide half of them on a phone.
 *
 * 4. Avatars are initials monograms unless a real `image` is supplied. We have
 *    no client photos and a stock face beside a real named quote is a
 *    fabrication.
 *
 * 5. Reduced motion is honoured: no scroll, no entrance animation, no hover
 *    lift, and the mask and height cap come off so nothing is stuck behind a
 *    frozen fade.
 *
 * KNOWN GAP, deliberate: the scroll does not pause on hover, matching the
 * block. WCAG 2.2.2 wants a pause mechanism for content that auto-moves for
 * more than five seconds, so this is worth revisiting — flagged rather than
 * silently "fixed", because it changes the feel of the section.
 *
 * The `!` modifiers are the usual home.css-is-unlayered workaround; full
 * explanation in components/ui/team-section-block-shadcnui.tsx.
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useMotionPreference } from '@/lib/useMotionPreference';
import { TESTIMONIALS, initialsOf, type Testimonial } from '@/lib/testimonials';

/* At least this many cards per column, so a column never loops one card. */
const MIN_PER_COLUMN = 2;
const MAX_COLUMNS = 3;

export function splitIntoColumns(items: Testimonial[], maxColumns = MAX_COLUMNS): Testimonial[][] {
  const columnCount = Math.max(1, Math.min(maxColumns, Math.floor(items.length / MIN_PER_COLUMN)));
  const columns: Testimonial[][] = Array.from({ length: columnCount }, () => []);
  items.forEach((item, i) => columns[i % columnCount].push(item));
  return columns;
}

function Avatar({ testimonial }: { testimonial: Testimonial }) {
  if (testimonial.image) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        width={40}
        height={40}
        src={testimonial.image}
        alt={`Avatar of ${testimonial.name}`}
        loading="lazy"
        className="h-10 w-10 rounded-full object-cover ring-2 ring-ivory transition-all duration-300 ease-in-out group-hover:ring-blue/30"
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ivory font-heading text-[13px] font-semibold tracking-wide text-navy-soft ring-2 ring-ivory transition-all duration-300 ease-in-out group-hover:ring-blue/30"
    >
      {initialsOf(testimonial.name)}
    </div>
  );
}

const HOVER_LIFT = {
  scale: 1.03,
  y: -8,
  boxShadow:
    '0 25px 50px -12px rgba(2,0,98,0.14), 0 10px 10px -5px rgba(2,0,98,0.05), 0 0 0 1px rgba(2,0,98,0.05)',
  transition: { type: 'spring' as const, stiffness: 400, damping: 17 }
};

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
  /* false = render the stack still, for reduced motion. */
  animate?: boolean;
}) => {
  const animate = props.animate ?? true;

  return (
    <div className={props.className}>
      <motion.ul
        animate={animate ? { translateY: '-50%' } : undefined}
        transition={
          animate
            ? {
                duration: props.duration || 10,
                repeat: Infinity,
                ease: 'linear',
                repeatType: 'loop'
              }
            : undefined
        }
        className="m-0! flex list-none flex-col gap-6 p-0! pb-6"
      >
        {/* Rendered twice: the loop translates the stack by -50%, so it is only
            seamless with exactly two copies. The second copy is aria-hidden and
            removed from the tab order, so each quote is announced and reachable
            once. */}
        {new Array(2).fill(0).map((_, copy) => (
          <React.Fragment key={copy}>
            {props.testimonials.map((testimonial) => (
              <motion.li
                key={`${copy}-${testimonial.name}`}
                aria-hidden={copy === 1 ? 'true' : undefined}
                tabIndex={copy === 1 ? -1 : 0}
                whileHover={animate ? HOVER_LIFT : undefined}
                whileFocus={animate ? HOVER_LIFT : undefined}
                className="group w-full max-w-xs cursor-default select-none rounded-3xl bg-white p-8 ring-1 ring-line transition-colors duration-300 [box-shadow:0_30px_60px_-40px_rgba(2,0,98,0.28)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue/40"
              >
                <blockquote className="m-0! p-0!">
                  <div className="mb-4 font-serif text-[42px] leading-[0.5] text-blue opacity-30" aria-hidden="true">&ldquo;</div>
                  <p className="m-0! font-serif text-[17px] font-normal leading-[1.5] text-ink">
                    {testimonial.quote}
                  </p>
                  {/* bg/padding carry `!` because home.css styles the SITE footer with
                      a bare element selector - `footer{ background:var(--navy-soft);
                      padding:64px 0 40px }` - and unlayered CSS beats Tailwind's
                      layered utilities. Without these the card footer renders as a
                      navy block. Longhand padding, not `p-0! pt-5!`, so the result
                      doesn't depend on Tailwind's shorthand-vs-longhand emit order. */}
                  <footer className="mt-6 flex items-center gap-3 border-t border-line bg-transparent! px-0! pb-0! pt-5!">
                    <Avatar testimonial={testimonial} />
                    <div className="flex flex-col">
                      <cite className="font-heading text-[14.5px] font-semibold not-italic leading-5 tracking-tight text-ink">
                        {testimonial.name}
                      </cite>
                      <span className="mt-0.5 text-[13px] leading-5 tracking-tight text-slate">
                        {testimonial.role}
                      </span>
                    </div>
                  </footer>
                </blockquote>
              </motion.li>
            ))}
          </React.Fragment>
        ))}
      </motion.ul>
    </div>
  );
};

/* Per-column durations, so the columns drift out of sync instead of scrolling
   as one block. Indexed by column. */
const DURATIONS = [15, 19, 17];

export function TestimonialsSection({
  badge = 'Testimonials',
  heading = 'Trusted through every step',
  intro = 'Business owners and referral partners on what it’s actually like to work with KIBA.',
  testimonials = TESTIMONIALS,
  className = 'bg-ivory!'
}: {
  badge?: string;
  heading?: string;
  intro?: string;
  testimonials?: Testimonial[];
  /* Section background. Defaults to the ivory band the homepage used. */
  className?: string;
}) {
  const prefersReduced = useReducedMotion();
  /* framer-motion's hook only reads the media query; the repo's ?motion=1
     override has to be consulted separately. See CLAUDE.md "Motion". */
  const { forceMotion } = useMotionPreference();
  const animate = !prefersReduced || forceMotion;

  const columns = splitIntoColumns(testimonials);

  const trackClass =
    'mx-auto justify-center gap-6 ' +
    (animate
      ? 'max-h-[680px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]'
      : 'flex-wrap');

  return (
    <section
      aria-labelledby="testimonials-heading"
      className={`relative overflow-hidden py-24! ${className}`}
    >
      <motion.div
        initial={animate ? { opacity: 0, y: 50, rotate: -2 } : false}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1] as const,
          opacity: { duration: 0.8 }
        }}
        className="wrap relative z-10"
      >
        <div className="mx-auto mb-14 flex max-w-[560px] flex-col items-center justify-center">
          <div className="rounded-full border border-line bg-white/60 px-4 py-1 font-mono text-[11.5px] font-medium uppercase tracking-[0.14em] text-slate">
            {badge}
          </div>

          <h2
            id="testimonials-heading"
            className="mt-6! text-center text-[clamp(26px,3.2vw,36px)] font-semibold tracking-tight text-ink"
          >
            {heading}
          </h2>
          {intro ? (
            <p className="mt-5 text-center text-[16.5px] leading-relaxed text-slate">{intro}</p>
          ) : null}
        </div>

        {/* TWO RENDERS, NOT ONE. Hiding the 2nd/3rd column below md (what the
            block does) would hide half the testimonials on a phone, because the
            split is round-robin. Phones get a single column containing ALL of
            them, and the split columns start at md. Only one is ever displayed,
            so nothing is announced twice. */}
        <div className={trackClass + ' flex md:hidden'} role="region" aria-label="Scrolling testimonials">
          <TestimonialsColumn
            testimonials={testimonials}
            duration={DURATIONS[0] + testimonials.length * 2}
            animate={animate}
          />
        </div>

        <div className={trackClass + ' hidden md:flex'} role="region" aria-label="Scrolling testimonials">
          {columns.map((column, i) => (
            <TestimonialsColumn
              key={i}
              testimonials={column}
              duration={DURATIONS[i % DURATIONS.length]}
              animate={animate}
              /* A third column only appears where there is room for it. */
              className={i === 2 ? 'hidden lg:block' : undefined}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default TestimonialsSection;
