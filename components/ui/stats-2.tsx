'use client';

/*
 * Three-box stat grid with a CTA block under it, integrated from the "stats-2"
 * block. Used by the program pages for the "how we decide" section
 * (app/capital-solutions/ProgramPage.tsx).
 *
 * NOTHING NEW INSTALLED. The block asked for @aliimam/icons (one arrow →
 * lucide-react, already here), plus @radix-ui/react-slot and
 * class-variance-authority for the Radix Button it bundled — the CTA here is
 * the site's own `.btn btn-primary` anchor, which is what every other CTA on
 * the site uses. See CLAUDE.md "Adapting third-party blocks".
 *
 * CHANGES FROM THE BLOCK AS SHIPPED:
 *
 * 1. Props-driven, and the big display slot takes a STRING rather than a
 *    statistic. The block's boxes are "82%" / "99.9%" / "520K+". KIBA has no
 *    measured figures for what this section describes, and inventing
 *    percentages for a lending advisory firm is not a design decision — so the
 *    slot holds a sequence numeral (01/02/03), which keeps the block's visual
 *    weight without asserting anything untrue. Pass real numbers here the day
 *    there are real numbers.
 *
 * 2. The block's footer had a five-star rating linking to Google reviews. Cut,
 *    for the same reason: we have no review data to point at.
 *
 * 3. KIBA palette, and entrance animation gated on reduced motion.
 *
 * Layout note: this renders a bare <section>, so it inherits home.css's
 * `section{ padding:96px 0 }` like every other section on these pages, and uses
 * `.wrap` for the container.
 */

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useMotionPreference } from '@/lib/useMotionPreference';

export type StatBox = {
  /* Small line at the top of the box. */
  label: string;
  /* The big display slot. A numeral here, a real statistic if one exists. */
  value: string;
  /* Supporting sentence under the display slot. */
  body: string;
};

const boxVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as const }
  })
};

const staticVariants: Variants = { hidden: { opacity: 1 }, visible: { opacity: 1 } };

export function Stats2({
  boxes,
  heading,
  body,
  ctaLabel,
  ctaHref,
  ctaNote
}: {
  boxes: StatBox[];
  heading: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaNote?: string;
}) {
  const prefersReduced = useReducedMotion();
  /* framer-motion's hook only reads the media query; the repo's ?motion=1
     override has to be consulted separately. See CLAUDE.md "Motion". */
  const { forceMotion } = useMotionPreference();
  const animate = !prefersReduced || forceMotion;

  return (
    <section className="bg-white!">
      <div className="wrap">
        <div className="grid gap-4 lg:grid-cols-3">
          {boxes.map((box, i) => (
            <motion.div
              key={box.label}
              variants={animate ? boxVariants : staticVariants}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="flex h-60 flex-col justify-between rounded-[16px] bg-[#f2f4f7] p-7 ring-1 ring-line"
            >
              <p className="m-0! text-[14px] leading-snug text-slate">{box.label}</p>
              <div>
                <h3 className="m-0! font-heading text-[56px] font-semibold leading-none tracking-tight text-navy-deep">
                  {box.value}
                </h3>
                <p className="m-0! mt-3! text-[15px] leading-relaxed text-ink/80">{box.body}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          /* See the note in ProgramPage: `initial={false}` plus whileInView
             leaves this at opacity 0 until scrolled to, which hides it outright
             for a reduced-motion visitor. */
          initial={animate ? { opacity: 0, y: 24 } : { opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={
            animate ? { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } : { duration: 0 }
          }
          className="flex flex-col items-center justify-center px-6 pt-20 text-center"
        >
          <h2 className="mx-auto! max-w-[820px] text-[clamp(24px,3.2vw,38px)] font-medium leading-tight tracking-tight text-ink">
            {heading}
          </h2>
          {body ? (
            <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-slate">{body}</p>
          ) : null}
          {ctaLabel && ctaHref ? (
            <>
              <a href={ctaHref} className="btn btn-primary mt-9">
                {ctaLabel}
              </a>
              {ctaNote ? <p className="mt-4 text-[13px] text-slate">{ctaNote}</p> : null}
            </>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}

export default Stats2;
