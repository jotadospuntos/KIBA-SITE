'use client';

/*
 * FAQ accordion. The live WordPress homepage has this section and this repo did
 * not, which is why it exists — content is lib/faq.ts, verbatim from there.
 *
 * PLAIN <button>, not components/ui/button.tsx: the repo's Base UI Button
 * silently swallows onClick (see the note in components/ui/services-card.tsx),
 * and a disclosure that doesn't open is worse than one that isn't a shadcn
 * component. The `!` modifiers are the usual home.css-is-unlayered workaround —
 * that stylesheet's bare `button{ padding:14px 28px; border:none;
 * font-size:15.5px }` and `h1,h2,h3{ margin:0 }` beat Tailwind's layered
 * utilities on every route that imports it.
 *
 * Accessibility: each row is a real button with aria-expanded/aria-controls
 * pointing at its panel, so it announces as a disclosure and works from the
 * keyboard. Answers are in the DOM whether open or not.
 */

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Reveal from '@/components/Reveal/Reveal';
import { useMotionPreference } from '@/lib/useMotionPreference';
import { FAQ, type FaqItem } from '@/lib/faq';

export function FaqAccordion({
  eyebrow = 'FAQ',
  heading = 'Frequently asked questions',
  intro = 'The things business owners ask us before the first conversation.',
  items = FAQ,
  className = 'bg-white!'
}: {
  eyebrow?: string;
  heading?: string;
  intro?: string;
  items?: FaqItem[];
  className?: string;
}) {
  /* Open the first answer by default: an all-collapsed FAQ reads as an empty
     list of links, and the first question is the one most people have. */
  const [open, setOpen] = useState<number | null>(0);

  const prefersReduced = useReducedMotion();
  const { forceMotion } = useMotionPreference();
  const animate = !prefersReduced || forceMotion;

  return (
    <section className={className}>
      <div className="wrap">
        <Reveal className="section-head reveal">
          <div className="eyebrow">{eyebrow}</div>
          <h2>{heading}</h2>
          {intro ? <p>{intro}</p> : null}
        </Reveal>

        <div className="mx-auto max-w-[820px]">
          {items.map((item, i) => {
            const isOpen = open === i;
            const panelId = `faq-panel-${i}`;
            const buttonId = `faq-button-${i}`;
            return (
              <Reveal
                key={item.question}
                className="reveal mb-3 overflow-hidden rounded-[14px] bg-white ring-1 ring-line"
                style={{ transitionDelay: `${i * 0.06}s` }}
              >
                <h3 className="m-0!">
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 bg-transparent px-6! py-5! text-left font-heading text-[16.5px]! font-semibold text-ink transition-colors hover:bg-[#f2f4f7]"
                  >
                    {item.question}
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-blue transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={false}
                  animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                  transition={animate ? { duration: 0.3, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }}
                  className="overflow-hidden"
                >
                  <p className="m-0! px-6 pb-6 text-[15.5px] leading-relaxed text-slate">
                    {item.answer}
                  </p>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FaqAccordion;
