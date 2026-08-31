'use client';

/*
 * Team section block (shadcn + framer-motion), integrated from a 21st.dev-style
 * block into this repo. Two deliberate changes from the block as shipped:
 *
 * 1. It is props-driven. The original hard-coded four fictional people, their
 *    avatars and their Twitter/GitHub links inside the component. Content lives
 *    in app/meet-our-team/team-data.ts instead, so this file stays a reusable UI
 *    primitive in components/ui and the page owns the copy.
 * 2. It is styled off the semantic tokens only (bg-card, text-muted-foreground,
 *    border-border, bg-primary), never literal colors. The page renders it
 *    inside a `.dark` wrapper, so those tokens resolve to KIBA's navy palette
 *    from app/globals.css and the section matches the navy bands on the
 *    homepage. The block's hard-coded `text-white`, `bg-emerald-400/20` glow and
 *    white gradient overlays were replaced for the same reason.
 *
 * Also changed: the bio is an expandable block rather than a one-line string
 * (KIBA's bios are several paragraphs and all of the copy has to survive), and
 * every animation is gated on useReducedMotion() + the repo's ?motion=1
 * override, matching every other animated component here.
 *
 * WHY THE `!` MODIFIERS AND `ring-1` INSTEAD OF `border`: the page importing
 * this also imports app/home.css (the shared nav and footer are styled by it).
 * home.css is a plain unlayered stylesheet, while every Tailwind utility lives
 * in `@layer utilities` — and unlayered CSS beats layered CSS no matter what
 * the specificity is. So home.css's bare element rules
 *
 *   section{ padding:96px 0; background-color:#ffffff; }
 *   button,.btn{ padding:14px 28px; border:none; font-size:15.5px; }
 *   a{ color:inherit; }
 *
 * silently win over `py-24`, `bg-background`, `p-0`, `text-xs` and
 * `text-muted-foreground` here. The three spots that collide are marked with
 * `!` (or use `ring` instead of `border`, which home.css never touches).
 * Everything home.css does not select is plain Tailwind. Don't remove the `!`s
 * without checking the section still renders navy — the first pass shipped
 * white text on a white band because of exactly this.
 */

import { useState } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants
} from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Briefcase, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMotionPreference } from '@/lib/useMotionPreference';

export type TeamMemberLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type TeamMember = {
  name: string;
  role: string;
  /* Square, face-centered — it renders in a small circle. */
  image: string;
  /* One line under the role, e.g. years of experience. */
  meta?: string;
  /* The single-sentence summary shown before the bio is expanded. */
  tagline: string;
  focus: string[];
  /* Full bio, one string per paragraph, revealed by "Read full bio". */
  bio: string[];
  links: TeamMemberLink[];
};

export type TeamSectionBlockProps = {
  eyebrow: string;
  heading: string;
  /* Rendered on its own line in the accent color. */
  headingAccent?: string;
  intro?: string;
  members: TeamMember[];
  cta?: {
    title: string;
    body: string;
    label: string;
    href: string;
  };
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.15 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.6, 0.05, 0.01, 0.9] as const }
  }
};

const staticVariants: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 }
};

function TeamMemberCard({ member, animate }: { member: TeamMember; animate: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const [bioOpen, setBioOpen] = useState(false);
  const bioId = `bio-${member.name.toLowerCase().replace(/[^a-z]+/g, '-')}`;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  /* The 3D tilt. Kept subtle (5deg) — these are photographs of real people, not
     product shots, and a strong tilt reads as gimmicky next to the rest of the site. */
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), {
    stiffness: 300,
    damping: 30
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), {
    stiffness: 300,
    damping: 30
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!animate) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left - rect.width / 2) / (rect.width / 2));
    mouseY.set((e.clientY - rect.top - rect.height / 2) / (rect.height / 2));
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div variants={animate ? itemVariants : staticVariants} className="[perspective:1000px]">
      <motion.div
        style={animate ? { rotateX, rotateY, transformStyle: 'preserve-3d' } : undefined}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="group relative h-full"
      >
        <Card className="relative h-full overflow-hidden rounded-3xl bg-card/70 py-0 ring-1 ring-border backdrop-blur-xl transition-shadow duration-500 group-hover:shadow-[0_30px_70px_-40px_rgba(0,0,0,0.75)]">
          {/* Wash that lifts the card on hover. Token-based so it reads correctly
              on the navy background rather than washing it out white. */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: animate ? 0.5 : 0 }}
          />

          <div className="relative z-10 flex h-full flex-col p-7">
            {/* Photo */}
            <div className="mb-5 flex justify-center">
              <div className="relative">
                <motion.div
                  aria-hidden
                  className="absolute -inset-2 rounded-full bg-primary/40 blur-2xl"
                  animate={{ opacity: isHovered ? 0.9 : 0 }}
                  transition={{ duration: animate ? 0.5 : 0 }}
                />
                <div className="relative h-32 w-32 overflow-hidden rounded-full bg-card p-1 ring-1 ring-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.image}
                    alt={member.name}
                    width={256}
                    height={256}
                    loading="lazy"
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Identity */}
            <div className="text-center">
              <h3 className="mb-2 text-xl font-semibold tracking-tight text-foreground">
                {member.name}
              </h3>
              <Badge
                variant="secondary"
                className="h-auto whitespace-normal bg-primary/15 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary"
              >
                {member.role}
              </Badge>

              {member.meta ? (
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Briefcase className="h-3.5 w-3.5" aria-hidden />
                  <span>{member.meta}</span>
                </div>
              ) : null}

              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                {member.tagline}
              </p>

              {/* Focus areas */}
              <div className="mt-5 flex flex-wrap justify-center gap-1.5">
                {member.focus.map((item) => (
                  <Badge
                    key={item}
                    variant="outline"
                    className="h-auto border-border bg-foreground/5 px-2.5 py-1 text-xs font-normal text-muted-foreground"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Full bio. Collapsed by default: every bio is several paragraphs, and
                three of them side by side would bury the rest of the page. */}
            <div className="mt-5">
              <Button
                variant="ghost"
                onClick={() => setBioOpen((open) => !open)}
                aria-expanded={bioOpen}
                aria-controls={bioId}
                className="h-auto w-full justify-center gap-1.5 rounded-full bg-foreground/5 px-4! py-2! text-xs! font-medium uppercase tracking-[0.14em] text-muted-foreground ring-1 ring-border hover:bg-foreground/10 hover:text-foreground"
              >
                {bioOpen ? 'Hide bio' : 'Read full bio'}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${bioOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </Button>
              {bioOpen ? (
                <div id={bioId} className="mt-4 space-y-3 text-left text-sm leading-relaxed text-muted-foreground">
                  {member.bio.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Contact / booking. mt-auto keeps these on the same baseline across
                the row even though the taglines are different lengths. */}
            <div className="mt-auto flex justify-center gap-2 pt-6">
              {member.links.map((link) => (
                <Button
                  key={link.label}
                  variant="ghost"
                  aria-label={`${link.label} — ${member.name}`}
                  title={`${link.label} — ${member.name}`}
                  render={<a href={link.href} />}
                  className="h-9 w-9 rounded-full bg-foreground/5 p-0! text-muted-foreground! ring-1 ring-border hover:bg-primary hover:text-primary-foreground!"
                >
                  <link.icon className="h-4 w-4" aria-hidden />
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export function TeamSectionBlock({
  eyebrow,
  heading,
  headingAccent,
  intro,
  members,
  cta
}: TeamSectionBlockProps) {
  const shouldReduceMotion = useReducedMotion();
  /* framer-motion's hook only reads the media query; the repo's ?motion=1
     preview override has to be consulted separately (see HeroReveal). */
  const { forceMotion } = useMotionPreference();
  const animate = !shouldReduceMotion || forceMotion;

  return (
    <section
      aria-labelledby="team-section-heading"
      className="relative w-full overflow-hidden bg-background! px-4! py-24! sm:px-6! lg:px-10!"
    >
      {/* Ambient blobs, same navy/blue pairing as the homepage's hero and CTA band. */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <motion.div
          animate={
            animate
              ? { scale: [1, 1.18, 1], opacity: [0.14, 0.3, 0.14] }
              : { scale: 1, opacity: 0.14 }
          }
          transition={animate ? { duration: 18, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
          className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/30 blur-[180px]"
        />
        <motion.div
          animate={
            animate
              ? { scale: [1.1, 1, 1.1], opacity: [0.12, 0.28, 0.12] }
              : { scale: 1, opacity: 0.12 }
          }
          transition={animate ? { duration: 16, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
          className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-[180px]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1180px]">
        {/* Header */}
        <motion.div
          initial={animate ? { opacity: 0, y: -24 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.6, 0.05, 0.01, 0.9] as const }}
          className="mb-14 text-center"
        >
          <div className="eyebrow mb-4 text-primary">{eyebrow}</div>
          <h2
            id="team-section-heading"
            className="mx-auto max-w-3xl text-[clamp(28px,3.6vw,42px)] font-semibold leading-tight tracking-tight text-foreground"
          >
            {heading}
            {headingAccent ? (
              <>
                <br />
                <span className="text-primary">{headingAccent}</span>
              </>
            ) : null}
          </h2>
          {intro ? (
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {intro}
            </p>
          ) : null}
        </motion.div>

        {/* Team grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid items-stretch gap-7 sm:grid-cols-2 lg:grid-cols-3"
        >
          {members.map((member) => (
            <TeamMemberCard key={member.name} member={member} animate={animate} />
          ))}
        </motion.div>

        {/* CTA */}
        {cta ? (
          <motion.div
            initial={animate ? { opacity: 0, y: 24 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="mt-16 text-center"
          >
            <Card className="mx-auto inline-flex w-full max-w-2xl flex-col items-center gap-4 rounded-3xl bg-card/70 px-10 py-9 ring-1 ring-border backdrop-blur-xl">
              <h3 className="text-2xl font-semibold text-foreground">{cta.title}</h3>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{cta.body}</p>
              {/* .btn/.btn-primary from home.css rather than the shadcn variant, so
                  this pill matches every other CTA on the site exactly. */}
              <a href={cta.href} className="btn btn-primary">
                {cta.label}
              </a>
            </Card>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}

export default TeamSectionBlock;
