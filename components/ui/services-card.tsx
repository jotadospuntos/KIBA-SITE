'use client';

/*
 * Embla-backed card carousel, integrated from the "animated service card"
 * block. Used by the program pages for the "This may make sense if…" section
 * (app/capital-solutions/ProgramPage.tsx).
 *
 * embla-carousel-react is the one dependency this block actually needed; it's
 * installed. The rest of its shopping list (lucide-react, framer-motion,
 * class-variance-authority) was already here, and @radix-ui/react-slot was only
 * needed for the Radix Button it bundled — this uses the repo's existing
 * base-nova Button instead. See CLAUDE.md "Adapting third-party blocks".
 *
 * CHANGES FROM THE BLOCK AS SHIPPED:
 *
 * 1. Reduced motion is honoured. The block animates unconditionally; here the
 *    entrance stagger is skipped and Embla's own drag/scroll animation is
 *    turned off (`duration: 0`) when the visitor asked for less motion. The
 *    carousel still works, it just doesn't glide.
 *
 * 2. A Previous button. The block only shipped Next, which with `loop: true`
 *    means the only way back is eleven clicks forward. Arrow-key support was
 *    already in the block and is kept.
 *
 * 3. The nav buttons are native <button>s rather than the repo's Button - see
 *    the comment above CarouselPrevious. They also don't forward refs, since
 *    nothing needs them.
 *
 * 4. KIBA palette, and the card is light-on-light rather than the block's
 *    dark-mode gradients.
 *
 * The `!` modifiers are the usual home.css-is-unlayered workaround: that
 * stylesheet's bare `button{ padding:14px 28px; border:none; font-size:15.5px }`
 * and `h1,h2,h3{ margin:0 }` beat Tailwind's layered utilities on every route
 * that imports it. Full explanation in
 * components/ui/team-section-block-shadcnui.tsx.
 */

import * as React from 'react';
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import useEmblaCarousel, {
  type UseEmblaCarouselType
} from 'embla-carousel-react';

import { cn } from '@/lib/utils';
import { useMotionPreference } from '@/lib/useMotionPreference';

type CarouselApi = UseEmblaCarouselType[1];
type CarouselOptions = Parameters<typeof useEmblaCarousel>[0];

type CarouselContextProps = {
  carouselRef: UseEmblaCarouselType[0];
  api: CarouselApi;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
};

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error('useCarousel must be used within a <Carousel />');
  return context;
}

function Carousel({
  opts,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { opts?: CarouselOptions }) {
  const [carouselRef, api] = useEmblaCarousel({ ...opts, axis: 'x' });
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((emblaApi: CarouselApi) => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on('reInit', onSelect);
    api.on('select', onSelect);
    return () => {
      api.off('reInit', onSelect);
      api.off('select', onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{ carouselRef, api, scrollPrev, scrollNext, canScrollPrev, canScrollNext }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn('relative', className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { carouselRef } = useCarousel();
  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div className={cn('flex -ml-4', className)} {...props} />
    </div>
  );
}

function CarouselItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      className={cn('min-w-0 shrink-0 grow-0 basis-full pl-4', className)}
      {...props}
    />
  );
}

/* Shared styling for both nav buttons. The size utilities carry `!` because
   home.css's `button{ padding:14px 28px; border:none; font-size:15.5px }` would
   otherwise win and blow the circle out into a pill. */
const NAV_BUTTON =
  'absolute top-1/2 z-20 inline-flex h-11! w-11! -translate-y-1/2 items-center justify-center ' +
  'rounded-full! bg-white/90 p-0! text-navy-deep ring-1 ring-line backdrop-blur ' +
  'transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-40';

/* PLAIN <button>, NOT components/ui/button.tsx, and that is deliberate.
 *
 * The block shipped these as shadcn Buttons and the repo has one, so that was
 * the first attempt - but the click did nothing. Embla was fine (ArrowRight and
 * dragging both moved the track); the Base UI Button simply never ran the
 * onClick. Rather than fight a component whose event plumbing is doing
 * something unexpected, these are native buttons: they are 40px circles with an
 * icon, none of the Button variants are being used, and a control that has to
 * work is the wrong place to depend on a wrapper's semantics.
 *
 * If you swap these back, click them in a browser - the failure is silent. */
function CarouselPrevious({ className }: { className?: string }) {
  const { scrollPrev, canScrollPrev } = useCarousel();
  return (
    <button
      type="button"
      onClick={scrollPrev}
      disabled={!canScrollPrev}
      className={cn(NAV_BUTTON, '-left-2 md:-left-5', className)}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">Previous slide</span>
    </button>
  );
}

function CarouselNext({ className }: { className?: string }) {
  const { scrollNext, canScrollNext } = useCarousel();
  return (
    <button
      type="button"
      onClick={scrollNext}
      disabled={!canScrollNext}
      className={cn(NAV_BUTTON, '-right-2 md:-right-5', className)}
    >
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">Next slide</span>
    </button>
  );
}

export interface Service {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
  /* Tailwind gradient stops, e.g. 'from-[#eef2f8] to-white'. */
  gradient: string;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: index * 0.1 }
  })
};

const staticVariants: Variants = { hidden: { opacity: 1 }, visible: { opacity: 1 } };

function ServiceCard({
  service,
  index,
  animate
}: {
  service: Service;
  index: number;
  animate: boolean;
}) {
  const Icon = service.icon;
  return (
    <motion.div
      variants={animate ? cardVariants : staticVariants}
      custom={index}
      className={cn(
        /* 300px, not the block's 450: these cards carry a three-word title and
           one sentence, and at that height most of the card was empty. */
        'relative flex h-[300px] w-full flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br p-7 ring-1 ring-line',
        '[box-shadow:0_30px_60px_-40px_rgba(2,0,98,0.24)]',
        service.gradient
      )}
    >
      <div className="z-10 flex h-full flex-col items-start text-left">
        <span className="mb-5 font-mono text-[12px] tracking-[0.14em] text-slate/70">
          ( {service.number} )
        </span>
        <Icon className="mb-auto h-10 w-10 text-blue" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <div className="z-10">
        <h3 className="mb-2! font-heading text-[14.5px] font-semibold uppercase tracking-[0.1em] text-navy-deep">
          {service.title}
        </h3>
        <p className="m-0! text-[14.5px] leading-relaxed text-slate">{service.description}</p>
      </div>
    </motion.div>
  );
}

export function ServiceCarousel({ services }: { services: Service[] }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const prefersReduced = useReducedMotion();
  /* framer-motion's hook only reads the media query; the repo's ?motion=1
     override has to be consulted separately. See CLAUDE.md "Motion". */
  const { forceMotion } = useMotionPreference();
  const animate = !prefersReduced || forceMotion;

  return (
    <div ref={ref} className="mx-auto w-full max-w-6xl px-4">
      <Carousel
        /* duration:0 makes Embla jump rather than glide, which is the right
           reduced-motion behaviour for a control the visitor drives. */
        opts={{ align: 'start', loop: true, duration: animate ? 25 : 0 }}
        className="relative"
      >
        <motion.div
          initial="hidden"
          animate={!animate || isInView ? 'visible' : 'hidden'}
          transition={{ staggerChildren: animate ? 0.1 : 0 }}
        >
          <CarouselContent>
            {services.map((service, index) => (
              <CarouselItem key={service.title} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <ServiceCard service={service} index={index} animate={animate} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </motion.div>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}

export default ServiceCarousel;
