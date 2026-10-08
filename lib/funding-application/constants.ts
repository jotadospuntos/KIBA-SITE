/*
 * Configuration for /funding-application. Nothing here is secret: the SignWell
 * API key lives only in the SIGNWELL_API_KEY env var.
 */

/* The SignWell template built from "KIBA Lending Application v6.pdf". Its
   field API IDs must match the `key`s in fields.ts exactly (they're case
   sensitive, and a mismatch fails silently: the value just doesn't appear).
   Run `scripts/test-signwell.ts --check` after any template change. */
export const SIGNWELL_TEMPLATE_ID = '4269751e-e8ea-476d-a0a1-9700f1c7c8ec';

/* The template's one signer (the applicant, owner 1). Must match the
   placeholder name in SignWell exactly. */
export const SIGNWELL_PLACEHOLDER = 'Client';

/* TEST MODE: documents are watermarked, not legally binding and not billed.
   Flip to false only once the human has signed off an end-to-end test. */
export const SIGNWELL_TEST_MODE = true;

/* Copied on every application; SignWell emails them the completed document.
   (Decided by the human, "for now".) */
export const SIGNWELL_CC = [{ name: 'KIBA', email: 'jesus@kibadvisors.com' }];

/* The applicant signs in an iframe right after submitting. If they haven't
   finished within this many minutes, SignWell also emails them the signing
   link, so closing the tab doesn't lose the application. (0-60.) */
export const SIGNING_EMAIL_DELAY_MIN = 10;

/* How long the staff link in the GoHighLevel note works. The document itself
   stays in SignWell after that; this only bounds a URL that opens SSNs. */
export const STAFF_LINK_DAYS = 45;

/* Autosave key. SSNs and dates of birth are never written to it - see
   SENSITIVE in fields.ts. */
export const STORAGE_KEY = 'kiba-funding-application';
