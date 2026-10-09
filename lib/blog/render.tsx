import { Fragment, type CSSProperties, type ReactNode } from 'react';
import { ARTICLE_WIDTH, isAllowedImageSrc, isSafeHref, type Block, type Doc, type Inline, type ListItem } from './doc';

/*
 * Renders a post body (lib/blog/doc.ts) as the article markup. The styles are
 * the ones the old hard-coded `Block` union used in PostPage, so the three
 * posts moved from posts.ts look exactly as before.
 *
 * Runs on the public site, which imports home.css: its unlayered bare `a` and
 * list rules beat Tailwind utilities, hence the `!` on colliding classes (see
 * CLAUDE.md, "The trap"). Every node and URL is allowlisted again here.
 */

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  );
}

function renderInline(content: Inline[] | undefined): ReactNode {
  return (content ?? []).map((n, i) => {
    if (n.type === 'hardBreak') return <br key={i} />;
    let node: ReactNode = n.text;
    for (const m of n.marks ?? []) {
      if (m.type === 'bold') node = <strong className="font-semibold text-ink">{node}</strong>;
      else if (m.type === 'italic') node = <em>{node}</em>;
      else if (m.type === 'link' && isSafeHref(m.attrs.href)) {
        const external = /^https?:\/\//i.test(m.attrs.href) && !/^https?:\/\/(www\.)?kibadvisors\.com/i.test(m.attrs.href);
        node = (
          <a
            href={m.attrs.href}
            className="text-blue! underline! underline-offset-2 hover:text-navy-soft!"
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {node}
          </a>
        );
      }
    }
    return <Fragment key={i}>{node}</Fragment>;
  });
}

function isEmpty(content: Inline[] | undefined): boolean {
  return !content?.some((n) => n.type === 'text' && n.text.trim());
}

/* A bullet's own text sits beside the check mark; anything after its first
   paragraph (a second paragraph, a nested list) follows below it. */
function renderListItem(item: ListItem, key: number, bullet: boolean): ReactNode {
  const [first, ...rest] = item.content;
  const lead = first?.type === 'paragraph' ? renderInline(first.content) : null;
  const tail = (first?.type === 'paragraph' ? rest : item.content).map((c, i) =>
    c.type === 'paragraph' ? (
      <span key={i} className="mt-2 block">{renderInline(c.content)}</span>
    ) : (
      <Fragment key={i}>{renderBlock(c, i, true)}</Fragment>
    )
  );
  return (
    <li key={key}>
      {bullet && <Check />}
      {lead}
      {tail}
    </li>
  );
}

function renderBlock(block: Block, key: number, nested = false): ReactNode {
  switch (block.type) {
    case 'lead':
      if (isEmpty(block.content)) return null;
      return (
        <p key={key} className="mb-6! font-serif text-[21px] leading-[1.5] text-navy-deep">
          {renderInline(block.content)}
        </p>
      );
    case 'heading':
      if (isEmpty(block.content)) return null;
      return block.attrs.level === 3 ? (
        <h3 key={key} className="clear-both mb-3! mt-8! font-heading text-[17.5px] font-semibold text-ink">
          {renderInline(block.content)}
        </h3>
      ) : (
        <h2 key={key} className="clear-both mb-4! mt-12! font-heading text-[clamp(21px,2.4vw,27px)] font-semibold tracking-tight text-ink">
          {renderInline(block.content)}
        </h2>
      );
    case 'bulletList':
      return (
        <ul key={key} className={nested ? 'klist mt-2!' : 'klist mb-6! mt-2! flow-root'}>
          {block.content.map((item, i) => renderListItem(item, i, true))}
        </ul>
      );
    case 'orderedList':
      return (
        <ol
          key={key}
          start={block.attrs?.start}
          className={`${nested ? 'mt-2!' : 'mb-6! mt-2! flow-root'} list-decimal! pl-6! text-[16.5px] leading-[1.75] text-slate [&>li]:mb-2 [&>li]:pl-1`}
        >
          {block.content.map((item, i) => renderListItem(item, i, false))}
        </ol>
      );
    case 'image': {
      if (!isAllowedImageSrc(block.attrs.src)) return null;
      const width = block.attrs.width ?? ARTICLE_WIDTH;
      const full = width >= ARTICLE_WIDTH;
      const align = full ? 'center' : block.attrs.align ?? 'center';
      /* Phones: always full width, never wrapped. From `sm` up: the stored
         width in px (capped at the column), centered or floated with the
         text wrapping. */
      const sized = 'sm:w-[min(var(--img-w),100%)]';
      const place = full
        ? 'my-9!'
        : align === 'left'
          ? `my-7! sm:float-left sm:mb-4! sm:mr-7! sm:mt-1! ${sized}`
          : align === 'right'
            ? `my-7! sm:float-right sm:mb-4! sm:ml-7! sm:mt-1! ${sized}`
            : `my-9! sm:mx-auto! ${sized}`;
      return (
        <figure
          key={key}
          className={`w-full ${place}`}
          style={full ? undefined : ({ '--img-w': `${width}px` } as CSSProperties)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.attrs.src}
            alt={block.attrs.alt}
            loading="lazy"
            className="h-auto w-full rounded-[16px] ring-1 ring-line"
          />
        </figure>
      );
    }
    case 'paragraph':
    default:
      if (isEmpty(block.content)) return null;
      return (
        <p key={key} className="mb-5! text-[16.5px] leading-[1.75] text-slate">
          {renderInline(block.content)}
        </p>
      );
  }
}

export function PostBody({ doc }: { doc: Doc }) {
  return <>{doc.content.map((b, i) => renderBlock(b, i))}</>;
}
