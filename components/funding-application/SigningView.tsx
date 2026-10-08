'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, FileSignature, Mail } from 'lucide-react';

/*
 * After submit: the pre-filled application opens in SignWell's signing modal
 * (embedded.js, https://developers.signwell.com/reference/embedded-iframe).
 * It opens once on its own; if the applicant closes it, the button reopens
 * it. SignWell also emails them the link if they haven't signed within a few
 * minutes (SIGNING_EMAIL_DELAY_MIN), so leaving the page loses nothing.
 */

type SignWellEmbedCtor = new (opts: {
  url: string;
  allowDecline?: boolean;
  events?: Partial<Record<'completed' | 'closed' | 'declined' | 'error', (e: unknown) => void>>;
}) => { open: () => void; close?: () => void };

declare global {
  interface Window {
    SignWellEmbed?: SignWellEmbedCtor;
  }
}

const SCRIPT_SRC = 'https://static.signwell.com/assets/embedded.js';
let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.SignWellEmbed) return Promise.resolve();
  scriptPromise ??= new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = SCRIPT_SRC;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => {
      scriptPromise = null;
      reject(new Error('SignWell failed to load'));
    };
    document.head.appendChild(el);
  });
  return scriptPromise;
}

type State = 'loading' | 'ready' | 'signed' | 'declined' | 'failed';

export default function SigningView({ signingUrl, email }: { signingUrl: string; email: string }) {
  const [state, setState] = useState<State>('loading');
  const opened = useRef(false);

  const open = useCallback(() => {
    if (!window.SignWellEmbed) return;
    new window.SignWellEmbed({
      url: signingUrl,
      allowDecline: false,
      events: {
        completed: () => setState('signed'),
        declined: () => setState('declined'),
        error: () => setState('failed')
      }
    }).open();
  }, [signingUrl]);

  useEffect(() => {
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled) return;
        setState('ready');
        if (!opened.current) {
          opened.current = true;
          open();
        }
      })
      .catch(() => !cancelled && setState('failed'));
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (state === 'signed') {
    return (
      <div className="py-10 text-center" role="status">
        <div className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-blue text-white shadow-soft">
          <Check className="size-8" strokeWidth={2.4} />
        </div>
        <h2 className="font-heading text-[clamp(26px,3.2vw,34px)] text-ink">Application signed</h2>
        <p className="mx-auto mt-3 max-w-[500px] text-[16px] text-slate">
          Thank you. Your KIBA advisor has your signed application and will be in touch about next steps.
        </p>
      </div>
    );
  }

  return (
    <div className="py-10 text-center" role="status">
      <div className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-blue text-white shadow-soft">
        <FileSignature className="size-8" strokeWidth={2} />
      </div>
      <h2 className="font-heading text-[clamp(26px,3.2vw,34px)] text-ink">
        {state === 'declined' ? 'Application not signed' : 'Your application is ready to sign'}
      </h2>
      <p className="mx-auto mt-3 max-w-[520px] text-[16px] text-slate">
        {state === 'declined'
          ? 'No problem — nothing has been submitted for funding. If something on the application was wrong, call us at 251-210-8445 and we’ll sort it out.'
          : 'We’ve filled in the application with your answers. Check each box, correct anything that’s wrong, then sign.'}
      </p>
      {state !== 'declined' && (
        <>
          <button
            type="button"
            className="btn btn-primary mt-8!"
            onClick={open}
            disabled={state !== 'ready'}
            aria-busy={state === 'loading'}
          >
            {state === 'loading' ? 'Opening…' : 'Review & sign'}
          </button>
          <p className="mx-auto mt-5 flex max-w-[480px] items-start justify-center gap-2 text-[13.5px] text-slate">
            <Mail className="mt-0.5 size-4 shrink-0" />
            <span>
              {state === 'failed'
                ? `The signing window couldn’t open here. We’ll email the signing link to ${email} within a few minutes.`
                : `Prefer to sign later? If it isn’t signed within a few minutes, we’ll email the link to ${email}.`}
            </span>
          </p>
        </>
      )}
    </div>
  );
}
