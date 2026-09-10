'use client';

/*
 * Scrolling testimonial columns, integrated from the 21st.dev
 * "testimonials-columns-1" block. This is now the single testimonial treatment
 * for the whole site; the hand-rolled TestimonialCarousel it replaced is gone.
 *
 * FOUR CHANGES FROM THE BLOCK AS SHIPPED, all deliberate:
 *
 * 1. Imports `framer-motion`, not `motion/react`. The `motion` package is the
 *    same library under its newer name and installing it alongside the
 *    framer-motion 13 this repo already depends on would ship two copies of it.
 *    The API used here is identical.
 *
 * 2. Column count adapts to how many testimonials exist. The block hard-codes
 *    three columns of three. KIBA has four real testimonials (see
 *    lib/testimonials.ts), and three columns of them would visibly loop the
 *    same card in every column. `splitIntoColumns` keeps at least two cards per
 *    column, so four testimonials render as two columns and it becomes three on
 *    its own once there are six.
 *
 * 3. Avatars are initials monograms, not photos. We have no client photos and
 *    a stock face next to a real named quote would be a fabrication. An entry
 *    with a real `image` renders that instead.
 *
 * 4. KIBA palette (navy/blue/ink/slate/line) rather than the block's semantic
 *    tokens, matching what was done to the team block. Also honours
 *    prefers-reduced-motion + the repo's ?motion=1 override, which the block
 *    did not: the scroll simply stops and the cards sit still, which is the
 *    correct reduced-motion behaviour for an infinite marquee.
 *
 * The `!` modifiers exist because home.css is unlayered and beats Tailwind's
 * layered utilities on any route that imports it - see
 * components/ui/team-section-block-shadcnui.tsx for the full explanation.
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Reveal from '@/components/Reveal/Reveal';
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
        src={testimonial.image}
        alt={testimonial.name}
        width={40}
        height={40}
        loading="lazy"
        className="h-10 w-10 rounded-full object-cover"
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ivory font-heading text-[13px] font-semibold tracking-wide text-navy-soft ring-1 ring-line"
    >
      {initialsOf(testimonial.name)}
    </div>
  );
}

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
      <motion.div
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
        className="flex flex-col gap-6 pb-6"
      >
        {/* Rendered twice: the loop translates the stack by -50%, so it is only
            seamless with exactly two copies. Same requirement as TrustMarquee.
            The duplicate is aria-hidden so screen readers read each quote once. */}
        {new Array(2).fill(0).map((_, copy) => (
          <React.Fragment key={copy}>
            {props.testimonials.map((testimonial) => (
              <figure
                key={`${copy}-${testimonial.name}`}
                aria-hidden={copy === 1 ? 'true' : undefined}
                className="m-0! w-full max-w-xs rounded-3xl bg-white p-8 ring-1 ring-line [box-shadow:0_30px_60px_-40px_rgba(2,0,98,0.28)]"
              >
                <div className="mb-4 font-serif text-[42px] leading-[0.5] text-blue opacity-30" aria-hidden="true">&ldquo;</div>
                <blockquote className="m-0! font-serif text-[17px] leading-[1.5] text-ink">
                  {testimonial.quote}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                  <Avatar testimonial={testimonial} />
                  <div className="flex flex-col">
                    <div className="font-heading text-[14.5px] font-semibold leading-5 tracking-tight text-ink">
                      {testimonial.name}
                    </div>
                    <div className="text-[13px] leading-5 tracking-tight text-slate">
                      {testimonial.role}
                    </div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};

/* Per-column durations, so the columns drift out of sync instead of scrolling
   as one block. Indexed by column. */
const DURATIONS = [15, 19, 17];

export function TestimonialsSection({
  eyebrow = 'What Our Clients & Partners Say',
  heading = 'Trusted through every step',
  intro,
  testimonials = TESTIMONIALS,
  className
}: {
  eyebrow?: string;
  heading?: string;
  intro?: string;
  testimonials?: Testimonial[];
  className?: string;
}) {
  const prefersReduced = useReducedMotion();
  /* framer-motion's hook only reads the media query; the repo's ?motion=1
     override has to be consulted separately. See CLAUDE.md "Motion". */
  const { forceMotion } = useMotionPreference();
  const animate = !prefersReduced || forceMotion;

  const columns = splitIntoColumns(testimonials);

  const maskClass =
    'mx-auto justify-center gap-6 ' +
    (animate
      ? 'max-h-[680px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]'
      : 'flex-wrap');

  return (
    <section className={className}>
      <div className="wrap">
        <Reveal className="section-head reveal">
          <div className="eyebrow">{eyebrow}</div>
          <h2>{heading}</h2>
          {intro ? <p>{intro}</p> : null}
        </Reveal>

        {/* The mask fades the columns out at both ends so the loop point never
            shows, and the height cap keeps the section from growing with the
            card count. With motion off the stack is static and simply wraps -
            every quote stays in the DOM and on screen.

            TWO RENDERS, NOT ONE. Hiding the 2nd/3rd column below md (which is
            what the source block does) would hide half the testimonials on a
            phone, because the split is round-robin. So phones get a single
            column containing ALL of them, and the split columns start at md.
            Only one of the two is ever displayed, so nothing is read twice. */}
        <div className={maskClass + ' flex md:hidden'}>
          <TestimonialsColumn
            testimonials={testimonials}
            duration={DURATIONS[0] + testimonials.length * 2}
            animate={animate}
          />
        </div>

        <div className={maskClass + ' hidden md:flex'}>
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
      </div>
    </section>
  );
}

export default TestimonialsSection;
