'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';
import { ARTICLE_WIDTH, PX_PER_CM, clampImageWidth, type ImageAlign } from '@/lib/blog/doc';

/*
 * How an image looks inside the editor: the picture, plus — when it's
 * selected — a drag handle on each side and a live size readout.
 *
 * The stored width is in PUBLISHED pixels (lib/blog/doc.ts). The editor's text
 * column is at most 760px but often narrower, so a drag is converted:
 * published px = editor px x (760 / editor column width). Dragging a centered
 * image moves both edges, so it counts double, keeping the edge under the mouse.
 *
 * The box itself (width, float) is the node view's OUTER element, set by
 * imageBoxAttrs() — that is the element ProseMirror lays out, so floats work.
 * During a drag it's updated directly for smoothness, and the width is written
 * to the document once, on release (one undo step per resize).
 */

export function imageBoxAttrs(attrs: { width?: number | null; align?: string | null }): Record<string, string> {
  const width = clampImageWidth(Number(attrs.width) || ARTICLE_WIDTH);
  const full = width >= ARTICLE_WIDTH;
  return {
    'data-align': full ? 'center' : (attrs.align as ImageAlign) ?? 'center',
    'data-full': String(full),
    style: `width:${((width / ARTICLE_WIDTH) * 100).toFixed(3)}%`
  };
}

export const formatCm = (px: number) => (px / PX_PER_CM).toFixed(1);

export default function ImageView({ node, updateAttributes, selected }: ReactNodeViewProps) {
  const width = clampImageWidth(Number(node.attrs.width) || ARTICLE_WIDTH);
  const align: ImageAlign = width >= ARTICLE_WIDTH ? 'center' : node.attrs.align ?? 'center';
  const [live, setLive] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const startDrag = (side: 'left' | 'right') => (e: ReactPointerEvent<HTMLSpanElement>) => {
    /* Cancelling pointerdown also stops the mouse events ProseMirror listens
       to, so it doesn't start a text selection or drag the node. */
    e.preventDefault();
    e.stopPropagation();
    const box = imgRef.current?.closest('.kiba-img') as HTMLElement | null;
    const column = box?.closest('.ProseMirror') as HTMLElement | null;
    if (!box || !column) return;
    const cs = getComputedStyle(column);
    const columnWidth = column.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const perPx = (ARTICLE_WIDTH / columnWidth) * (align === 'center' ? 2 : 1) * (side === 'left' ? -1 : 1);

    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);
    const startX = e.clientX;
    let next = width;

    const move = (ev: PointerEvent) => {
      next = clampImageWidth(width + (ev.clientX - startX) * perPx);
      const attrs = imageBoxAttrs({ width: next, align });
      box.style.cssText = attrs.style;
      box.dataset.full = attrs['data-full'];
      box.dataset.align = attrs['data-align'];
      setLive(next);
    };
    const end = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', end);
      handle.removeEventListener('pointercancel', end);
      setLive(null);
      if (next !== width) updateAttributes({ width: next });
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
  };

  const shown = live ?? width;

  return (
    <NodeViewWrapper className="kiba-img-inner" data-selected={selected || undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={imgRef} src={node.attrs.src} alt={node.attrs.alt ?? ''} draggable={false} />
      {selected && (
        <>
          <span className="kiba-img-handle" data-side="left" onPointerDown={startDrag('left')} contentEditable={false} aria-hidden="true" />
          <span className="kiba-img-handle" data-side="right" onPointerDown={startDrag('right')} contentEditable={false} aria-hidden="true" />
          <span className="kiba-img-size" contentEditable={false} aria-hidden="true">
            {shown} px · ≈{formatCm(shown)} cm
          </span>
        </>
      )}
    </NodeViewWrapper>
  );
}
