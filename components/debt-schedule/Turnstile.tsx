'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { TURNSTILE_SITE_KEY } from '@/lib/debt-schedule/constants';

/*
 * Cloudflare Turnstile, explicit render. Managed mode: most visitors see a
 * brief check that passes on its own; only suspicious traffic gets an
 * interaction. The token goes up with the submission and is verified server-
 * side (lib/debt-schedule/turnstile.ts).
 *
 * Tokens are single-use, so the parent calls reset() after every submit
 * attempt, successful or not.
 *
 * The widget only renders on hostnames added to it in the Cloudflare
 * dashboard - kibadvisors.com, go.kibadvisors.com and the Vercel preview domain.
 */

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  scriptPromise ??= new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = SCRIPT_SRC;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => {
      el.remove();
      scriptPromise = null;
      reject(new Error('Turnstile failed to load'));
    };
    document.head.appendChild(el);
  });
  return scriptPromise;
}

export type TurnstileHandle = { reset: () => void };

type Props = {
  onToken: (token: string | null) => void;
};

const Turnstile = forwardRef<TurnstileHandle, Props>(function Turnstile({ onToken }, ref) {
  const box = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<string | null>(null);
  /* The latest callback, so re-renders of the parent don't re-create the widget. */
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;
  /* Script blocked or widget errored: say so, or Submit just keeps asking them to wait. */
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useImperativeHandle(ref, () => ({
    reset() {
      onTokenRef.current(null);
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    }
  }));

  useEffect(() => {
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !box.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(box.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: 'light',
          callback: (token: string) => {
            setFailed(false);
            onTokenRef.current(token);
          },
          'expired-callback': () => onTokenRef.current(null),
          'error-callback': () => {
            setFailed(true);
            onTokenRef.current(null);
          }
        });
      })
      .catch(() => {
        if (cancelled) return;
        setFailed(true);
        onTokenRef.current(null);
      });
    return () => {
      cancelled = true;
      /* A token left with the parent would expire unseen while the widget is gone. */
      onTokenRef.current(null);
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [attempt]);

  function retry() {
    setFailed(false);
    if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    else setAttempt((n) => n + 1);
  }

  return (
    <div>
      <div ref={box} className="flex min-h-[65px] justify-center" />
      {failed && (
        <p role="alert" className="mt-2 text-center text-sm text-slate">
          The security check couldn&rsquo;t load.{' '}
          <button type="button" onClick={retry} className="p-0! border-0! bg-transparent! text-sm! font-semibold text-blue underline">
            Try again
          </button>{' '}
          or call <a href="tel:2512108445" className="text-blue! underline">251-210-8445</a>.
        </p>
      )}
    </div>
  );
});

export default Turnstile;
