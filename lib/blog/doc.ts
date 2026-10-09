/*
 * The blog body format: a Tiptap / ProseMirror JSON document, restricted to
 * exactly what the article template can render. Shared by the editor, the
 * server (sanitizeDoc on every save) and the renderer (lib/blog/render.tsx).
 *
 * The editor only offers these nodes, but the server never trusts that: a
 * server action is a public endpoint, so sanitizeDoc rebuilds the document from
 * an allowlist and drops anything else. The renderer allowlists again, and no
 * part of a post is ever rendered as raw HTML.
 */

export type Mark =
  | { type: 'bold' }
  | { type: 'italic' }
  | { type: 'link'; attrs: { href: string } };

export type TextNode = { type: 'text'; text: string; marks?: Mark[] };
export type HardBreak = { type: 'hardBreak' };
export type Inline = TextNode | HardBreak;

export type Paragraph = { type: 'paragraph'; content?: Inline[] };
/* The larger serif intro line the WordPress posts open with ("lead"). */
export type Lead = { type: 'lead'; content?: Inline[] };
export type Heading = { type: 'heading'; attrs: { level: 2 | 3 }; content?: Inline[] };
export type ListItem = { type: 'listItem'; content: (Paragraph | BulletList | OrderedList)[] };
export type BulletList = { type: 'bulletList'; content: ListItem[] };
export type OrderedList = { type: 'orderedList'; attrs?: { start?: number }; content: ListItem[] };
/* Image width is stored in PUBLISHED pixels: the article column is 760px wide
   on desktop, so width 380 means exactly 380px there, whatever screen the
   editor was on (the editor converts its own pixels when you drag). Narrower
   screens scale it down; phones always show images full width. Left/right let
   text wrap around the image. */
export const ARTICLE_WIDTH = 760;
export const IMAGE_MIN_WIDTH = 80;
/* CSS's fixed ratio (96px = 1in = 2.54cm). Physical size on a real screen
   varies with its resolution, so cm is always shown as approximate. */
export const PX_PER_CM = 96 / 2.54;
export const IMAGE_ALIGNS = ['left', 'center', 'right'] as const;
export type ImageAlign = (typeof IMAGE_ALIGNS)[number];
export type Image = { type: 'image'; attrs: { src: string; alt: string; width?: number; align?: ImageAlign } };

export const clampImageWidth = (w: number) =>
  Math.min(ARTICLE_WIDTH, Math.max(IMAGE_MIN_WIDTH, Math.round(w)));

/* Posts saved before pixel widths stored a preset name instead. */
const LEGACY_SIZES: Record<string, number> = { small: 253, medium: 380, large: 570, full: ARTICLE_WIDTH };

export type Block = Paragraph | Lead | Heading | BulletList | OrderedList | Image;
export type Doc = { type: 'doc'; content: Block[] };

export const EMPTY_DOC: Doc = { type: 'doc', content: [{ type: 'paragraph' }] };

/* Links: web, mail, phone, or a path on this site. No javascript:, data:, or
   protocol-relative URLs. */
export function isSafeHref(href: string): boolean {
  if (/^https?:\/\/[^\s]+$/i.test(href)) return true;
  if (/^(mailto|tel):[^\s]+$/i.test(href)) return true;
  return href.startsWith('/') && !href.startsWith('//');
}

/* Images: only our own Vercel Blob store (where the editor uploads) or a file
   already in public/. Never an arbitrary third-party URL. */
export function isAllowedImageSrc(src: string): boolean {
  if (src.startsWith('/img/')) return true;
  try {
    const u = new URL(src);
    return u.protocol === 'https:' && u.hostname.endsWith('.public.blob.vercel-storage.com');
  } catch {
    return false;
  }
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

function cleanMarks(v: unknown): Mark[] | undefined {
  const out: Mark[] = [];
  for (const m of arr(v)) {
    if (!isObj(m)) continue;
    if (m.type === 'bold' || m.type === 'italic') out.push({ type: m.type });
    if (m.type === 'link' && isObj(m.attrs) && typeof m.attrs.href === 'string') {
      const href = m.attrs.href.trim();
      if (isSafeHref(href)) out.push({ type: 'link', attrs: { href } });
    }
  }
  return out.length ? out : undefined;
}

function cleanInline(v: unknown): Inline[] | undefined {
  const out: Inline[] = [];
  for (const n of arr(v)) {
    if (!isObj(n)) continue;
    if (n.type === 'hardBreak') out.push({ type: 'hardBreak' });
    if (n.type === 'text' && typeof n.text === 'string' && n.text) {
      const marks = cleanMarks(n.marks);
      out.push(marks ? { type: 'text', text: n.text, marks } : { type: 'text', text: n.text });
    }
  }
  return out.length ? out : undefined;
}

function withContent<T extends { content?: Inline[] }>(node: T, content: Inline[] | undefined): T {
  return content ? { ...node, content } : node;
}

function cleanList(n: Record<string, unknown>): BulletList | OrderedList | null {
  const items: ListItem[] = [];
  for (const li of arr(n.content)) {
    if (!isObj(li) || li.type !== 'listItem') continue;
    const children: ListItem['content'] = [];
    for (const c of arr(li.content)) {
      if (!isObj(c)) continue;
      if (c.type === 'paragraph') children.push(withContent<Paragraph>({ type: 'paragraph' }, cleanInline(c.content)));
      if (c.type === 'bulletList' || c.type === 'orderedList') {
        const nested = cleanList(c);
        if (nested) children.push(nested);
      }
    }
    if (children.length) items.push({ type: 'listItem', content: children });
  }
  if (!items.length) return null;
  if (n.type === 'orderedList') {
    const start = isObj(n.attrs) && typeof n.attrs.start === 'number' ? Math.max(1, Math.floor(n.attrs.start)) : 1;
    return start === 1 ? { type: 'orderedList', content: items } : { type: 'orderedList', attrs: { start }, content: items };
  }
  return { type: 'bulletList', content: items };
}

export function sanitizeDoc(input: unknown): Doc {
  const blocks: Block[] = [];
  const content = isObj(input) && input.type === 'doc' ? arr(input.content) : [];
  for (const n of content) {
    if (!isObj(n)) continue;
    switch (n.type) {
      case 'paragraph':
        blocks.push(withContent<Paragraph>({ type: 'paragraph' }, cleanInline(n.content)));
        break;
      case 'lead':
        blocks.push(withContent<Lead>({ type: 'lead' }, cleanInline(n.content)));
        break;
      case 'heading': {
        const level = isObj(n.attrs) && n.attrs.level === 3 ? 3 : 2;
        blocks.push(withContent<Heading>({ type: 'heading', attrs: { level } }, cleanInline(n.content)));
        break;
      }
      case 'bulletList':
      case 'orderedList': {
        const list = cleanList(n);
        if (list) blocks.push(list);
        break;
      }
      case 'image': {
        const a = isObj(n.attrs) ? n.attrs : {};
        const src = typeof a.src === 'string' ? a.src : '';
        const alt = typeof a.alt === 'string' ? a.alt.trim() : '';
        const raw = Number(a.width);
        const width = Number.isFinite(raw) && raw > 0
          ? clampImageWidth(raw)
          : typeof a.size === 'string' && a.size in LEGACY_SIZES ? LEGACY_SIZES[a.size] : ARTICLE_WIDTH;
        const align: ImageAlign = IMAGE_ALIGNS.includes(a.align as ImageAlign) ? (a.align as ImageAlign) : 'center';
        if (isAllowedImageSrc(src)) blocks.push({ type: 'image', attrs: { src, alt, width, align } });
        break;
      }
    }
  }
  return { type: 'doc', content: blocks.length ? blocks : EMPTY_DOC.content };
}

/* ---- reading the document ---------------------------------------------- */

function inlineText(content: Inline[] | undefined): string {
  return (content ?? []).map((n) => (n.type === 'text' ? n.text : ' ')).join('');
}

function blockText(b: Block | ListItem | Paragraph): string {
  switch (b.type) {
    case 'paragraph':
    case 'lead':
    case 'heading':
      return inlineText(b.content);
    case 'bulletList':
    case 'orderedList':
      return b.content.map(blockText).join(' ');
    case 'listItem':
      return b.content.map(blockText).join(' ');
    default:
      return '';
  }
}

export function docText(doc: Doc): string {
  return doc.content.map(blockText).join('\n');
}

/* Minutes at 200 words per minute; computed, never stored, so it can't drift. */
export function readingMinutes(doc: Doc): number {
  const words = docText(doc).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/* Images in the body that are missing alt text — publishing is refused until
   each has one (it's what a screen reader announces). */
export function imagesMissingAlt(doc: Doc): number {
  return doc.content.filter((b) => b.type === 'image' && !b.attrs.alt).length;
}
