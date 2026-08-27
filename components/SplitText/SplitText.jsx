'use client';

/*
 * React Bits SplitText. Replaces the hand-written vanilla port that used to live
 * in the since-removed app/v3/legacy-behaviors.js and pulled gsap + SplitText off a CDN at runtime.
 * GSAP is now a versioned npm dependency (SplitText became free in gsap 3.13),
 * so there's no external script to fail, and useGSAP reverts the split on unmount.
 *
 * One deviation from upstream: it accepts `children` as well as `text`. Upstream
 * only takes a string and renders {text}, which cannot carry the hero headline's
 * <br> line breaks. GSAP splits an element's rendered content either way, so
 * passing children through works and keeps the manual line breaks intact.
 */

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

/**
 * Props are declared here rather than left to inference: this is a .jsx file, so
 * TypeScript derives the prop types from the destructuring defaults, which makes
 * any prop without a default *required* and narrows `= undefined` ones to the
 * literal `undefined` type (rejecting real values at the call site).
 *
 * @param {{
 *   text?: string,
 *   children?: import('react').ReactNode,
 *   className?: string,
 *   delay?: number,
 *   duration?: number,
 *   ease?: string,
 *   splitType?: string,
 *   from?: gsap.TweenVars,
 *   to?: gsap.TweenVars,
 *   threshold?: number,
 *   rootMargin?: string,
 *   textAlign?: string,
 *   tag?: keyof JSX.IntrinsicElements,
 *   forceMotion?: boolean,
 *   onLetterAnimationComplete?: () => void,
 *   [key: string]: any
 * }} props
 */
const SplitText = ({
  text = undefined,
  children = undefined,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  /* Accepted but deliberately not applied, so it can't leak onto the DOM node as
     an invalid attribute. Upstream sets inline styles here (textAlign, plus
     overflow:hidden / display:inline-block / wordWrap) which would fight this
     page's own `.hero h1` rules for max-width, size, line-height and colour.
     Alignment stays the stylesheet's job. */
  textAlign = undefined, // eslint-disable-line @typescript-eslint/no-unused-vars
  tag = 'p',
  /* Escape hatch for this page's ?motion=1 override: framer-motion and the
     legacy behaviors both consult it, and without it the reveal is silently
     skipped on a machine reporting prefers-reduced-motion (e.g. KDE "Instant"). */
  forceMotion = false,
  onLetterAnimationComplete = undefined,
  ...rest
}) => {
  const ref = useRef(null);
  const animationCompletedRef = useRef(false);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  /* Split after webfonts land, otherwise character widths shift under the
     already-positioned chars. */
  useEffect(() => {
    if (document.fonts.status === 'loaded') {
      setFontsLoaded(true);
    } else {
      document.fonts.ready.then(() => setFontsLoaded(true));
    }
  }, []);

  useGSAP(
    () => {
      if (!ref.current || !fontsLoaded) return;
      if (animationCompletedRef.current) return;

      const el = ref.current;
      const reduced =
        !forceMotion &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;

      if (el._rbsplitInstance) {
        try {
          el._rbsplitInstance.revert();
        } catch (_) {
          /* noop */
        }
        el._rbsplitInstance = null;
      }

      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
      const sign =
        marginValue === 0
          ? ''
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}`
            : `+=${marginValue}${marginUnit}`;
      const start = `top ${startPct}%${sign}`;

      let targets;
      const assignTargets = self => {
        if (splitType.includes('chars') && self.chars.length) targets = self.chars;
        if (!targets && splitType.includes('words') && self.words.length) targets = self.words;
        if (!targets && splitType.includes('lines') && self.lines.length) targets = self.lines;
        if (!targets) targets = self.chars || self.words || self.lines;
      };

      const splitInstance = new GSAPSplitText(el, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType === 'lines',
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char',
        reduceWhiteSpace: false,
        onSplit: self => {
          assignTargets(self);
          return gsap.fromTo(
            targets,
            { ...from },
            {
              ...to,
              duration,
              ease,
              stagger: delay / 1000,
              scrollTrigger: {
                trigger: el,
                start,
                once: true,
                fastScrollEnd: true,
                anticipatePin: 0.4
              },
              onComplete: () => {
                animationCompletedRef.current = true;
                onCompleteRef.current?.();
              },
              willChange: 'transform, opacity',
              force3D: true
            }
          );
        }
      });

      el._rbsplitInstance = splitInstance;

      return () => {
        ScrollTrigger.getAll().forEach(st => {
          if (st.trigger === el) st.kill();
        });
        try {
          splitInstance.revert();
        } catch (_) {
          /* noop */
        }
        el._rbsplitInstance = null;
      };
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        fontsLoaded,
        forceMotion
      ],
      scope: ref
    }
  );

  const Tag = tag || 'p';
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children ?? text}
    </Tag>
  );
};

export default SplitText;
