'use client';

import { useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { upload } from '@vercel/blob/client';
import { Check, FileText, Upload, X } from 'lucide-react';
import Reveal from '@/components/Reveal/Reveal';
import Turnstile from '@/components/debt-schedule/Turnstile';
import type { TurnstileHandle } from '@/components/debt-schedule/Turnstile';
import { Field, describedBy, inputClass } from '@/components/debt-schedule/fields';
import { MAX_FILE_BYTES, MAX_FILE_MB, MAX_FILES, filePath, safeFileName } from '@/lib/tax-returns/constants';
import { taxContactSchema } from '@/lib/tax-returns/schema';

/*
 * The /tax-returns form: contact details, PDFs, Turnstile, submit. Submit is
 * three calls (see app/api/tax-returns/route.ts): get an upload ticket, upload
 * each file straight to private Blob, then finalize.
 *
 * No autosave: files can't be kept in localStorage, and four text fields
 * aren't worth a restore banner.
 *
 * Buttons that aren't .btn override home.css's bare `button` rule with `!`
 * (see components/debt-schedule/fields.tsx for the trap).
 */

type ContactField = 'contactName' | 'businessName' | 'email';
type Errors = Partial<Record<ContactField | 'files', string>>;

const isPdfFile = (f: File) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export default function TaxReturnsForm() {
  const [contactName, setContactName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string>();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [received, setReceived] = useState<number | null>(null);
  const submitting = progress !== null;

  function addFiles(list: FileList | null) {
    if (!list) return;
    const picked = Array.from(list);
    const rejected = picked.filter((f) => !isPdfFile(f) || f.size > MAX_FILE_BYTES || f.size === 0);
    const next = [...files, ...picked.filter((f) => !rejected.includes(f))].slice(0, MAX_FILES);
    setFiles(next);
    const tooMany = files.length + picked.length - rejected.length > MAX_FILES;
    setErrors((e) => ({
      ...e,
      files: rejected.length
        ? `${rejected.map((f) => f.name).join(', ')} ${rejected.length === 1 ? 'isn’t' : 'aren’t'} a PDF under ${MAX_FILE_MB} MB, so ${rejected.length === 1 ? 'it was' : 'they were'} skipped.`
        : tooMany
          ? `You can upload up to ${MAX_FILES} files.`
          : undefined
    }));
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (!submitting) addFiles(e.dataTransfer.files);
  }

  async function submit() {
    const contact = { contactName, businessName, email, phone: phone.trim() || undefined };
    const parsed = taxContactSchema.safeParse(contact);
    const next: Errors = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as ContactField;
        next[key] ??= issue.message;
      }
    }
    if (!files.length) next.files = 'Please add at least one tax return (PDF).';
    setErrors(next);
    if (!parsed.success || !files.length) return;
    if (!turnstileToken) {
      setSubmitError('Please wait for the security check above to finish, then submit again.');
      return;
    }

    setSubmitError(undefined);
    setProgress(0);
    try {
      const res = await fetch('/api/tax-returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: parsed.data, turnstileToken })
      });
      const start = (await res.json().catch(() => ({}))) as { id?: string; ticket?: string; message?: string };
      if (!res.ok || !start.id || !start.ticket) throw new Error(start.message ?? 'Something went wrong on our end.');

      const total = files.reduce((sum, f) => sum + f.size, 0);
      const loaded = files.map(() => 0);
      // One at a time: parallel uploads on a phone connection just all go slowly.
      for (const [i, file] of files.entries()) {
        await upload(filePath(start.id, safeFileName(file.name, i)), file, {
          access: 'private',
          contentType: 'application/pdf',
          handleUploadUrl: '/api/tax-returns/upload',
          clientPayload: start.ticket,
          multipart: file.size > 5 * 1024 * 1024,
          onUploadProgress: ({ loaded: l }) => {
            loaded[i] = l;
            setProgress(Math.min(99, Math.round((loaded.reduce((a, b) => a + b, 0) / total) * 100)));
          }
        });
      }

      const fin = await fetch('/api/tax-returns/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket: start.ticket })
      });
      const done = (await fin.json().catch(() => ({}))) as { received?: number; message?: string };
      if (!fin.ok) throw new Error(done.message ?? 'Something went wrong on our end.');
      setReceived(done.received ?? files.length);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      const message = e instanceof Error && e.message ? e.message : 'We couldn’t upload your files.';
      setSubmitError(`${message} Check your connection and try again, or call us at 251-210-8445.`);
    } finally {
      /* Turnstile tokens are single-use, whatever happened. */
      turnstileRef.current?.reset();
      setProgress(null);
    }
  }

  if (received !== null) {
    return (
      <div className="py-10 text-center" role="status">
        <div className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-blue text-white shadow-soft">
          <Check className="size-8" strokeWidth={2.4} />
        </div>
        <h2 className="font-heading text-[clamp(26px,3.2vw,34px)] text-ink">Tax returns received</h2>
        <p className="mx-auto mt-3 max-w-[480px] text-[16px] text-slate">
          Thank you — we received {received} file{received === 1 ? '' : 's'}. Your KIBA advisor will review them before
          your call.
        </p>
      </div>
    );
  }

  const textField = (id: ContactField, label: string, value: string, set: (v: string) => void, type: string, autoComplete: string) => (
    <Field id={id} label={label} error={errors[id]}>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        className={inputClass}
        value={value}
        disabled={submitting}
        aria-invalid={errors[id] ? true : undefined}
        aria-describedby={describedBy(id, errors[id])}
        onChange={(e) => {
          set(e.target.value);
          setErrors((er) => ({ ...er, [id]: undefined }));
        }}
      />
    </Field>
  );

  return (
    <div>
      <Reveal className="reveal mb-10 rounded-[16px] bg-cream p-6 ring-1 ring-line sm:p-7">
        <div className="mb-3 font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-blue">What to include</div>
        <ul className="m-0! list-disc space-y-1.5 pl-5! text-[15px] leading-[1.6] text-ink marker:text-blue">
          <li>Your business&rsquo;s federal tax returns for the two most recent years, with all schedules.</li>
          <li>Personal federal tax returns for the two most recent years, for each owner.</li>
          <li>PDFs only, up to {MAX_FILE_MB} MB each and {MAX_FILES} files in total.</li>
        </ul>
      </Reveal>

      <Reveal className="reveal mb-10" style={{ transitionDelay: '0.06s' }}>
        <h2 className="mb-4! font-heading text-[clamp(22px,2.6vw,27px)] text-ink">Your details</h2>
        <div className="rounded-[16px] bg-white p-6 shadow-soft ring-1 ring-line sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            {textField('contactName', 'Your name', contactName, setContactName, 'text', 'name')}
            {textField('businessName', 'Business name', businessName, setBusinessName, 'text', 'organization')}
            {textField('email', 'Email (the one on your application)', email, setEmail, 'email', 'email')}
            <Field id="phone" label="Phone (optional)">
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                maxLength={30}
                className={inputClass}
                value={phone}
                disabled={submitting}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>
          </div>
        </div>
      </Reveal>

      <Reveal className="reveal mb-10" style={{ transitionDelay: '0.1s' }}>
        <h2 id="files-heading" className="mb-4! font-heading text-[clamp(22px,2.6vw,27px)] text-ink">Your tax returns</h2>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`rounded-[16px] bg-white p-6 text-center shadow-soft ring-1 sm:p-8 ${
            dragging ? 'ring-2 ring-blue' : errors.files ? 'ring-2 ring-destructive' : 'ring-line'
          }`}
        >
          <div className="mx-auto mb-3 grid size-12 place-items-center rounded-[12px] bg-ivory text-blue">
            <Upload className="size-6" aria-hidden="true" />
          </div>
          <p className="text-[15.5px] text-ink">Drag your PDFs here, or</p>
          <input
            ref={inputRef}
            id="tax-files"
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="sr-only"
            disabled={submitting || files.length >= MAX_FILES}
            aria-labelledby="files-heading"
            aria-describedby={errors.files ? 'tax-files-error' : undefined}
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            className="btn btn-dark-ghost mt-3!"
            disabled={submitting || files.length >= MAX_FILES}
            onClick={() => inputRef.current?.click()}
          >
            Choose files
          </button>
          {errors.files && (
            <p id="tax-files-error" role="alert" className="mt-3 text-[13px] leading-snug text-destructive">
              {errors.files}
            </p>
          )}
        </div>

        {files.length > 0 && (
          <ul className="m-0! mt-4! grid list-none gap-2 p-0!" aria-label="Files to upload">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center gap-3 rounded-[12px] bg-white px-4 py-3 ring-1 ring-line">
                <FileText className="size-5 shrink-0 text-blue" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-left text-[15px] text-ink">{f.name}</span>
                <span className="shrink-0 text-[13px] text-slate">{mb(f.size)}</span>
                <button
                  type="button"
                  className="grid size-8! shrink-0 place-items-center rounded-full! bg-transparent! p-0! text-slate hover:bg-paper! hover:text-ink"
                  disabled={submitting}
                  aria-label={`Remove ${f.name}`}
                  onClick={() => setFiles(files.filter((_, j) => j !== i))}
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Reveal>

      <div className="flex flex-col items-center gap-4">
        <Turnstile ref={turnstileRef} onToken={setTurnstileToken} />
        {submitError && (
          <p role="alert" className="max-w-[480px] text-center text-[14px] text-destructive">
            {submitError}
          </p>
        )}
        <button
          type="button"
          className="btn btn-primary w-full max-w-[420px] justify-center py-4! text-[16.5px]!"
          onClick={submit}
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? `Uploading… ${progress}%` : 'Upload tax returns'}
        </button>
        <p className="max-w-[480px] text-center text-[13px] leading-relaxed text-slate">
          Your files are stored privately, shared only with your KIBA advisor, and deleted after 45 days. See our{' '}
          <a href="/privacy-policy" className="text-blue underline underline-offset-2">
            privacy policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
