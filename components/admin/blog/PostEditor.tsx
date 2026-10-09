'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Eye, History, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import {
  deletePost,
  getRevision,
  listRevisions,
  savePost
} from '@/app/admin/(protected)/blog/actions';
import { readingMinutes } from '@/lib/blog/doc';
import { PREVIEW_STORAGE_KEY, type EditorPost, type RevisionSummary, type SaveIntent } from '@/lib/blog/editor-types';
import { slugify } from '@/lib/blog/slug';
import { formatPostDate, fromCentralInput } from '@/lib/blog/time';
import RichTextEditor from './RichTextEditor';
import { uploadBlogImage } from './upload';

/*
 * The post editor: everything about one post on one screen. The body editor on
 * the left; publishing, details, summary, share image and version history on
 * the right.
 *
 * Saving rules live on the server (app/admin/(protected)/blog/actions.ts);
 * this only collects the fields and shows what came back. "Preview" opens the
 * real article template in a new tab, fed live from this form through
 * localStorage, so unsaved edits can be previewed without touching the live post.
 */

type Category = { id: string; name: string };

const FLASH_KEY = 'kiba-blog-editor-flash';

const field =
  'w-full rounded-lg bg-white px-3 py-2 text-sm text-ink ring-1 ring-line placeholder:text-slate-light focus:outline-2 focus:outline-blue';
const label = 'mb-1 block text-sm font-medium text-ink';
const hint = 'mt-1 text-xs text-slate';
const card = 'rounded-xl bg-white p-5 ring-1 ring-line';
const primary =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-navy-deep px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-soft disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue';
const secondary =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-ink ring-1 ring-line hover:bg-ivory disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-blue';

const EDITABLE = [
  'title',
  'slug',
  'excerpt',
  'searchDescription',
  'categoryId',
  'author',
  'coverImageUrl',
  'coverImageAlt',
  'body',
  'publishAt'
] as const satisfies readonly (keyof EditorPost)[];

/* What counts as "unsaved changes": the fields, not the server bookkeeping. */
const fingerprint = (p: EditorPost) =>
  JSON.stringify([p.title, p.slug, p.excerpt, p.searchDescription, p.categoryId, p.author, p.coverImageUrl, p.coverImageAlt, p.body, p.publishAt]);

export default function PostEditor({
  initial,
  categories,
  authors,
  canManageCategories
}: {
  initial: EditorPost;
  categories: Category[];
  authors: string[];
  canManageCategories: boolean;
}) {
  const [post, setPost] = useState(initial);
  const [savedPrint, setSavedPrint] = useState(() => fingerprint(initial));
  /* Until someone edits the address by hand (or the post has been live), it
     follows the title. New drafts start on a placeholder "draft-…" address. */
  const [autoSlug, setAutoSlug] = useState(
    () => !initial.liveSlug && (initial.slug.startsWith('draft-') || initial.slug === slugify(initial.title))
  );
  const [busy, setBusy] = useState<SaveIntent | 'delete' | null>(null);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [history, setHistory] = useState<RevisionSummary[] | null>(null);
  const [coverBusy, setCoverBusy] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);

  const dirty = fingerprint(post) !== savedPrint;
  const publishAt = post.publishAt ? fromCentralInput(post.publishAt) : null;
  const future = !!publishAt && publishAt.getTime() > Date.now();
  const live = post.status === 'published';
  const state = !live ? 'Draft' : future ? 'Scheduled' : 'Published';

  const set = <K extends keyof EditorPost>(key: K, value: EditorPost[K]) =>
    setPost((p) => ({ ...p, [key]: value }));

  const setTitle = (title: string) =>
    setPost((p) => ({ ...p, title, ...(autoSlug ? { slug: slugify(title) } : {}) }));

  /* ---- save ---- */
  const run = useCallback(
    async (intent: SaveIntent) => {
      setBusy(intent);
      setNotice(null);
      const sent = post;
      try {
        const res = await savePost(sent, intent);
        if (!res.ok) {
          setNotice({ kind: 'error', text: res.error });
          return;
        }
        /* Take the server's version, EXCEPT for fields edited while the save
           was in flight — those keep the newer local value (and stay "unsaved"),
           or words typed during a save would silently miss the next one. */
        setPost((current) => {
          const merged = { ...res.post };
          for (const k of EDITABLE) {
            if (current[k] !== sent[k]) (merged as Record<string, unknown>)[k] = current[k];
          }
          return merged;
        });
        setSavedPrint(fingerprint(res.post));
        setNotice({ kind: 'ok', text: res.message });
        /* Publishing refreshes the public blog's cache, and Next then refreshes
           this page too, which can remount the editor and drop the message.
           Leave it where the next mount picks it up (see the effect below). */
        sessionStorage.setItem(FLASH_KEY, JSON.stringify({ id: res.post.id, text: res.message, at: Date.now() }));
        if (res.post.liveSlug) setAutoSlug(false);
        if (history) setHistory(await listRevisions(res.post.id!));
      } catch {
        setNotice({ kind: 'error', text: 'Saving failed — check your connection and try again. Nothing was lost on this screen.' });
      } finally {
        setBusy(null);
      }
    },
    [post, history]
  );

  useEffect(() => {
    try {
      const flash = JSON.parse(sessionStorage.getItem(FLASH_KEY) ?? 'null') as { id: string; text: string; at: number } | null;
      if (flash && flash.id === initial.id && Date.now() - flash.at < 15000) setNotice({ kind: 'ok', text: flash.text });
    } catch {}
    sessionStorage.removeItem(FLASH_KEY);
  }, [initial.id]);

  /* Ctrl/Cmd+S saves; leaving with unsaved changes asks first. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!busy) run('save');
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('beforeunload', onLeave);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('beforeunload', onLeave);
    };
  }, [busy, dirty, run]);

  /* ---- live preview feed ---- */
  const categoryName = useMemo(
    () => categories.find((c) => c.id === post.categoryId)?.name ?? '',
    [categories, post.categoryId]
  );
  useEffect(() => {
    const t = setTimeout(() => {
      const when = publishAt ?? new Date();
      localStorage.setItem(
        PREVIEW_STORAGE_KEY,
        JSON.stringify({
          slug: post.slug || 'preview',
          title: post.title || 'Untitled post',
          category: categoryName,
          author: post.author,
          publishedAt: when.toISOString(),
          dateLabel: formatPostDate(when),
          excerpt: post.excerpt,
          readingMinutes: readingMinutes(post.body),
          searchDescription: post.searchDescription,
          coverImageUrl: post.coverImageUrl,
          coverImageAlt: post.coverImageAlt,
          body: post.body
        })
      );
    }, 300);
    return () => clearTimeout(t);
  }, [post, categoryName, publishAt]);

  /* ---- share image ---- */
  const onCover = async (file: File | undefined) => {
    if (!file) return;
    setCoverBusy(true);
    try {
      set('coverImageUrl', await uploadBlogImage(file));
    } catch (e) {
      setNotice({ kind: 'error', text: e instanceof Error ? e.message : 'The upload failed.' });
    } finally {
      setCoverBusy(false);
      if (coverRef.current) coverRef.current.value = '';
    }
  };

  /* ---- history ---- */
  const toggleHistory = async () => {
    if (history) return setHistory(null);
    if (post.id) setHistory(await listRevisions(post.id));
  };
  const restore = async (rev: RevisionSummary) => {
    if (!post.id) return;
    if (dirty && !confirm('Replace your unsaved changes with this older version?')) return;
    const r = await getRevision(post.id, rev.id);
    if (!r) return setNotice({ kind: 'error', text: 'That version could not be loaded.' });
    setPost((p) => ({ ...p, ...r }));
    setAutoSlug(false);
    setResetKey((k) => k + 1);
    setNotice({ kind: 'ok', text: `Loaded the version from ${rev.savedAt}. Nothing changes on the site until you save.` });
  };

  /* ---- delete ---- */
  const remove = async () => {
    if (!post.id) return (window.location.href = '/admin/blog');
    if (!confirm(`Delete "${post.title || 'Untitled post'}"? This can't be undone.`)) return;
    setBusy('delete');
    const res = await deletePost(post.id, post.title);
    if (res.ok) {
      setSavedPrint(fingerprint(post));
      window.location.href = '/admin/blog';
    } else {
      setNotice({ kind: 'error', text: res.error ?? 'Delete failed.' });
      setBusy(null);
    }
  };

  const pill = {
    Draft: 'bg-ivory text-slate ring-line',
    Scheduled: 'bg-amber-50 text-amber-800 ring-amber-200',
    Published: 'bg-green-50 text-green-800 ring-green-200'
  }[state];

  return (
    <div>
      {/* ---- top bar ---- */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <a href="/admin/blog" className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-ink">
          <ArrowLeft className="size-4" /> All posts
        </a>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${pill}`}>{state}</span>
        <span className="text-sm text-slate" aria-live="polite">
          {busy && busy !== 'delete' ? 'Saving…' : dirty ? 'Unsaved changes' : post.id ? 'All changes saved' : 'Not saved yet'}
        </span>
        <div className="ml-auto flex gap-2">
          <a href="/admin/preview" target="kiba-blog-preview" className={secondary}>
            <Eye className="size-4" /> Preview
          </a>
          {live ? (
            <button type="button" className={primary} disabled={!!busy} onClick={() => run('save')}>
              {busy === 'save' && <Loader2 className="size-4 animate-spin" />} Update
            </button>
          ) : (
            <button type="button" className={secondary} disabled={!!busy} onClick={() => run('save')}>
              {busy === 'save' && <Loader2 className="size-4 animate-spin" />} Save draft
            </button>
          )}
        </div>
      </div>

      {notice && (
        <p
          role={notice.kind === 'error' ? 'alert' : 'status'}
          className={`mb-6 rounded-lg p-3 text-sm ring-1 ${
            notice.kind === 'error' ? 'bg-red-50 text-red-800 ring-red-200' : 'bg-green-50 text-green-800 ring-green-200'
          }`}
        >
          {notice.text}
        </p>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ---- writing ---- */}
        <div className="space-y-4">
          <label className="sr-only" htmlFor="post-title">Title</label>
          <input
            id="post-title"
            value={post.title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="w-full rounded-xl bg-white px-5 py-4 font-heading text-[28px] font-semibold text-navy-deep ring-1 ring-line placeholder:text-slate-light focus:outline-2 focus:outline-blue"
          />
          <RichTextEditor value={post.body} resetKey={resetKey} onChange={(body) => set('body', body)} />
        </div>

        {/* ---- sidebar ---- */}
        <aside className="space-y-4">
          <section className={card} aria-labelledby="publish-h">
            <h2 id="publish-h" className="mb-3 font-heading text-base font-semibold text-ink">Publishing</h2>
            <label className={label} htmlFor="publish-at">Publish date &amp; time (Central)</label>
            <input
              id="publish-at"
              type="datetime-local"
              value={post.publishAt}
              onChange={(e) => set('publishAt', e.target.value)}
              className={field}
            />
            <p className={hint}>
              {live
                ? future
                  ? `Scheduled: goes live ${publishAt ? formatPostDate(publishAt) : ''}. Until then it isn't on the site.`
                  : 'Live now. Setting a future time takes it off the site until then.'
                : 'Leave empty to publish right away, or pick a future time to schedule it.'}
            </p>
            {post.publishAt && !live && (
              <button type="button" className="mt-1 text-xs text-blue underline" onClick={() => set('publishAt', '')}>
                Clear date
              </button>
            )}
            <div className="mt-4 flex flex-col gap-2">
              {!live ? (
                <button type="button" className={primary} disabled={!!busy} onClick={() => run('publish')}>
                  {busy === 'publish' && <Loader2 className="size-4 animate-spin" />}
                  {future ? 'Schedule' : 'Publish now'}
                </button>
              ) : (
                <button type="button" className={secondary} disabled={!!busy} onClick={() => run('unpublish')}>
                  {busy === 'unpublish' && <Loader2 className="size-4 animate-spin" />} Unpublish (back to draft)
                </button>
              )}
              {live && !future && post.liveSlug && (
                <a href={`/blog/${post.liveSlug}`} target="_blank" rel="noopener" className="text-center text-sm text-blue underline">
                  View the live post
                </a>
              )}
            </div>
          </section>

          <section className={card} aria-labelledby="details-h">
            <h2 id="details-h" className="mb-3 font-heading text-base font-semibold text-ink">Details</h2>
            <label className={label} htmlFor="category">Category</label>
            <select id="category" value={post.categoryId ?? ''} onChange={(e) => set('categoryId', e.target.value || null)} className={field}>
              <option value="">Choose a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {canManageCategories && (
              <a href="/admin/blog/categories" className="mt-1 inline-block text-xs text-blue underline">Manage categories</a>
            )}

            <label className={`${label} mt-4`} htmlFor="author">Author</label>
            <select id="author" value={post.author} onChange={(e) => set('author', e.target.value)} className={field}>
              {[...new Set([...authors, post.author])].map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>

            <label className={`${label} mt-4`} htmlFor="slug">Web address</label>
            <div className="flex items-center rounded-lg ring-1 ring-line focus-within:outline-2 focus-within:outline-blue">
              <span className="pl-3 text-sm text-slate">/blog/</span>
              <input
                id="slug"
                value={post.slug}
                onChange={(e) => {
                  setAutoSlug(false);
                  set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                }}
                className="w-full rounded-r-lg bg-white py-2 pr-3 text-sm text-ink focus:outline-none"
              />
            </div>
            {post.liveSlug && post.slug !== post.liveSlug ? (
              <p className="mt-1 text-xs text-amber-800">
                This post is live at /blog/{post.liveSlug}. Changing the address breaks links people already have.
              </p>
            ) : (
              <p className={hint}>Filled in from the title until you edit it.</p>
            )}
          </section>

          <section className={card} aria-labelledby="summary-h">
            <h2 id="summary-h" className="mb-3 font-heading text-base font-semibold text-ink">Summary</h2>
            <label className={label} htmlFor="excerpt">Summary</label>
            <textarea id="excerpt" rows={3} maxLength={400} value={post.excerpt} onChange={(e) => set('excerpt', e.target.value)} className={field} />
            <p className={hint}>One or two sentences. Shown on the blog page under the title.</p>
            <label className={`${label} mt-4`} htmlFor="seo">Search description <span className="font-normal text-slate">(optional)</span></label>
            <textarea id="seo" rows={3} maxLength={300} value={post.searchDescription} onChange={(e) => set('searchDescription', e.target.value)} className={field} />
            <p className={hint}>What Google shows under the link. Uses the summary if left empty. {post.searchDescription.length}/160 recommended.</p>
          </section>

          <section className={card} aria-labelledby="share-h">
            <h2 id="share-h" className="mb-1 font-heading text-base font-semibold text-ink">Share image <span className="text-sm font-normal text-slate">(optional)</span></h2>
            <p className="mb-3 text-xs text-slate">Shown when the post is shared on LinkedIn, Facebook or in a text. Wide images work best.</p>
            {post.coverImageUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.coverImageUrl} alt="" className="mb-3 aspect-[1200/630] w-full rounded-lg object-cover ring-1 ring-line" />
                <label className={label} htmlFor="cover-alt">Image description</label>
                <input id="cover-alt" value={post.coverImageAlt} onChange={(e) => set('coverImageAlt', e.target.value)} className={field} placeholder="What the image shows" />
                <button type="button" className="mt-2 text-xs text-red-700 underline" onClick={() => { set('coverImageUrl', null); set('coverImageAlt', ''); }}>
                  Remove image
                </button>
              </>
            ) : (
              <button type="button" className={`${secondary} w-full`} disabled={coverBusy} onClick={() => coverRef.current?.click()}>
                {coverBusy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                {coverBusy ? 'Uploading…' : 'Upload image'}
              </button>
            )}
            <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/avif" className="hidden" onChange={(e) => onCover(e.target.files?.[0])} />
          </section>

          {post.id && (
            <section className={card} aria-labelledby="history-h">
              <button type="button" onClick={toggleHistory} className="flex w-full items-center gap-2 text-left">
                <History className="size-4 text-slate" />
                <h2 id="history-h" className="font-heading text-base font-semibold text-ink">Version history</h2>
                <span className="ml-auto text-xs text-blue underline">{history ? 'Hide' : 'Show'}</span>
              </button>
              {history && (
                <ul className="mt-3 max-h-72 divide-y divide-line overflow-y-auto text-sm">
                  {history.length === 0 && <li className="py-2 text-slate">No earlier versions yet.</li>}
                  {history.map((r) => (
                    <li key={r.id} className="flex items-center gap-2 py-2">
                      <div className="min-w-0">
                        <div className="text-ink">{r.savedAt}</div>
                        <div className="truncate text-xs text-slate">{r.savedBy}</div>
                      </div>
                      <button type="button" onClick={() => restore(r)} className="ml-auto shrink-0 rounded-md px-2 py-1 text-xs ring-1 ring-line hover:bg-ivory">
                        Restore
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {!live && (
            <button type="button" onClick={remove} disabled={!!busy} className="inline-flex items-center gap-1.5 px-1 text-sm text-red-700 hover:underline disabled:opacity-50">
              <Trash2 className="size-4" /> {post.id ? 'Delete this draft' : 'Discard'}
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}
