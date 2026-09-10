'use client';

/*
 * Bento grid, integrated from the magicui-style "bento-grid" block. Used by the
 * program pages' "Not sure this is the one?" section
 * (app/capital-solutions/ProgramPage.tsx).
 *
 * THREE SUBSTITUTIONS, so this doesn't drag in a parallel UI stack:
 *
 * 1. Icons are lucide, not @radix-ui/react-icons. components.json sets
 *    `iconLibrary: lucide` and the rest of the repo uses it; adding Radix's
 *    icon package for one arrow would mean two icon sets in one bundle.
 *
 * 2. It uses the Button already in components/ui/button.tsx (shadcn style
 *    `base-nova`, built on @base-ui/react) rather than the Radix-Slot Button
 *    that shipped with the block. Base UI's equivalent of `asChild` is the
 *    `render` prop, so `<Button asChild><a/></Button>` becomes
 *    `<Button render={<a/>} />`. Installing the Radix button alongside would
 *    have given the repo two incompatible Buttons with the same name.
 *
 * 3. KIBA palette instead of the block's neutral-700/dark: pairing, and the
 *    whole card is a link. The block put a small "Learn more" button in the
 *    corner and left the other 90% of the card dead; here the card itself is
 *    the anchor and the button is a visual affordance inside it. The `!`
 *    modifiers are the usual home.css-is-unlayered workaround - see
 *    components/ui/team-section-block-shadcnui.tsx.
 */

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';

function BentoGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('grid w-full auto-rows-[16rem] grid-cols-1 gap-4 md:grid-cols-3', className)}>
      {children}
    </div>
  );
}

function BentoCard({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta
}: {
  name: string;
  className?: string;
  /* Decorative layer behind the text - a gradient, a watermark, an image. */
  background?: ReactNode;
  Icon?: LucideIcon;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-[20px] no-underline',
        'bg-white text-ink ring-1 ring-line',
        '[box-shadow:0_0_0_1px_rgba(2,0,98,.02),0_2px_4px_rgba(2,0,98,.04),0_12px_24px_-12px_rgba(2,0,98,.10)]',
        'transform-gpu transition-shadow duration-300',
        'hover:[box-shadow:0_0_0_1px_rgba(2,0,98,.04),0_8px_18px_-8px_rgba(2,0,98,.16),0_28px_50px_-24px_rgba(2,0,98,.26)]',
        className
      )}
    >
      {background ? <div aria-hidden="true">{background}</div> : null}

      {/* Lifts on hover to make room for the CTA sliding in underneath. */}
      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-9">
        {Icon ? (
          <Icon
            className="mb-2 h-9 w-9 origin-left transform-gpu text-blue transition-all duration-300 ease-in-out group-hover:scale-75"
            strokeWidth={1.6}
            aria-hidden="true"
          />
        ) : null}
        <h3 className="m-0! font-heading text-[17px] font-semibold text-ink">{name}</h3>
        <p className="m-0! max-w-lg text-[14.5px] leading-relaxed text-slate">{description}</p>
      </div>

      <div className="pointer-events-none absolute bottom-0 flex w-full translate-y-9 transform-gpu flex-row items-center p-6 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <span className="inline-flex items-center gap-1.5 font-heading text-[14px] font-semibold text-blue">
          {cta}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>

      {/* Whole-card tint on hover. */}
      <div className="pointer-events-none absolute inset-0 transform-gpu bg-blue/0 transition-all duration-300 group-hover:bg-blue/[0.04]" />
    </a>
  );
}

export { BentoCard, BentoGrid };
