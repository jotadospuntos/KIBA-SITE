'use client';

import { useEffect, useRef, useState } from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extensions';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Redo2,
  Undo2
} from 'lucide-react';
import { isSafeHref, sanitizeDoc, type Doc, type ImageAlign, type ImageSize } from '@/lib/blog/doc';
import { uploadBlogImage } from './upload';

/*
 * The post body editor (Tiptap). It offers ONLY what the article template can
 * render — see lib/blog/doc.ts — so nothing typed here can break the page:
 * text, an intro line, two heading sizes, bullet and numbered lists, bold,
 * italic, links and images. Anything else that gets pasted in (Word, Google
 * Docs) is reduced to those on the way in, and the server sanitizes again.
 */

/* The larger serif opening line the WordPress posts use. */
const Lead = Node.create({
  name: 'lead',
  group: 'block',
  content: 'inline*',
  defining: true,
  parseHTML: () => [{ tag: 'p[data-lead]' }],
  renderHTML: ({ HTMLAttributes }) => ['p', mergeAttributes(HTMLAttributes, { 'data-lead': '' }), 0]
});

/* The stock image node plus our two layout attributes (see IMAGE_SIZES in
   lib/blog/doc.ts). Shown in the editor through data-size / data-align, which
   .kiba-prose styles in globals.css to match the published layout. */
const BlogImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      size: {
        default: 'full',
        parseHTML: (el) => el.getAttribute('data-size') ?? 'full',
        renderHTML: (a) => ({ 'data-size': a.size })
      },
      align: {
        default: 'center',
        parseHTML: (el) => el.getAttribute('data-align') ?? 'center',
        renderHTML: (a) => ({ 'data-align': a.align })
      }
    };
  }
});

const extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    blockquote: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    strike: false,
    underline: false,
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https',
      HTMLAttributes: { rel: null, target: null },
      isAllowedUri: (url) => isSafeHref(url)
    }
  }),
  Lead,
  BlogImage.configure({ inline: false, allowBase64: false }),
  Placeholder.configure({ placeholder: 'Start writing the post…' })
];

const btn =
  'inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-md px-2 text-sm text-ink hover:bg-ivory disabled:opacity-40 aria-pressed:bg-navy-deep aria-pressed:text-white';

const IDLE = {
  block: 'p',
  bold: false,
  italic: false,
  link: false,
  bullet: false,
  ordered: false,
  image: false,
  imageAlt: '',
  imageSize: 'full',
  imageAlign: 'center',
  canUndo: false,
  canRedo: false
};

/* Tiptap's useEditorState only reports after the editor's first transaction,
   so it starts out null even once the editor exists. Fall back to IDLE rather
   than waiting on it — waiting meant the editor was never shown at all. */
function useToolbarState(editor: Editor | null) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            block: e.isActive('heading', { level: 2 })
              ? 'h2'
              : e.isActive('heading', { level: 3 })
                ? 'h3'
                : e.isActive('lead')
                  ? 'lead'
                  : 'p',
            bold: e.isActive('bold'),
            italic: e.isActive('italic'),
            link: e.isActive('link'),
            bullet: e.isActive('bulletList'),
            ordered: e.isActive('orderedList'),
            image: e.isActive('image'),
            imageAlt: (e.getAttributes('image').alt as string | undefined) ?? '',
            imageSize: (e.getAttributes('image').size as string | undefined) ?? 'full',
            imageAlign: (e.getAttributes('image').align as string | undefined) ?? 'center',
            canUndo: e.can().undo(),
            canRedo: e.can().redo()
          }
        : null
  });
  return state ?? IDLE;
}

export default function RichTextEditor({
  value,
  resetKey,
  onChange
}: {
  value: Doc;
  /* Change this to replace the content (e.g. restoring an older version). */
  resetKey: number;
  onChange: (doc: Doc) => void;
}) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    extensions,
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'kiba-prose min-h-[420px] px-6 py-5 focus:outline-none',
        'aria-label': 'Post body',
        role: 'textbox',
        'aria-multiline': 'true'
      }
    },
    onUpdate: ({ editor: e }) => onChangeRef.current(sanitizeDoc(e.getJSON()))
  });

  const lastReset = useRef(resetKey);
  useEffect(() => {
    if (!editor || lastReset.current === resetKey) return;
    lastReset.current = resetKey;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, resetKey, value]);

  const state = useToolbarState(editor);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState('');
  const [linkError, setLinkError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  if (!editor) {
    return <div className="min-h-[480px] rounded-xl bg-white ring-1 ring-line" />;
  }

  /* Back to the text after a panel closes, once React has removed it (the
     focused button disappearing would otherwise leave focus on <body>). */
  const refocus = () => requestAnimationFrame(() => editor.commands.focus());
  const keepFocus = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) e.preventDefault();
  };

  const setImage = (attrs: { size?: ImageSize; align?: ImageAlign }) =>
    editor.chain().focus().updateAttributes('image', attrs).run();
  const sizes: { id: ImageSize; label: string }[] = [
    { id: 'small', label: 'Small' },
    { id: 'medium', label: 'Medium' },
    { id: 'large', label: 'Large' },
    { id: 'full', label: 'Full width' }
  ];
  const aligns: { id: ImageAlign; label: string; Icon: typeof AlignLeft }[] = [
    { id: 'left', label: 'Left, text wraps on the right', Icon: AlignLeft },
    { id: 'center', label: 'Centered', Icon: AlignCenter },
    { id: 'right', label: 'Right, text wraps on the left', Icon: AlignRight }
  ];

  const setBlock = (block: string) => {
    const c = editor.chain().focus();
    if (block === 'h2') c.setNode('heading', { level: 2 }).run();
    else if (block === 'h3') c.setNode('heading', { level: 3 }).run();
    else if (block === 'lead') c.setNode('lead').run();
    else c.setParagraph().run();
  };

  const openLink = () => {
    setLinkValue((editor.getAttributes('link').href as string | undefined) ?? '');
    setLinkError('');
    setLinkOpen(true);
  };

  const applyLink = () => {
    let href = linkValue.trim();
    if (!href) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setLinkOpen(false);
      refocus();
      return;
    }
    if (!/^(https?:|mailto:|tel:|\/)/i.test(href)) href = `https://${href}`;
    if (!isSafeHref(href)) {
      setLinkError('That doesn’t look like a web address.');
      return;
    }
    const chain = editor.chain().focus().extendMarkRange('link');
    if (editor.state.selection.empty && !editor.isActive('link')) {
      chain.insertContent({ type: 'text', text: linkValue.trim(), marks: [{ type: 'link', attrs: { href } }] }).run();
    } else {
      chain.setLink({ href }).run();
    }
    setLinkOpen(false);
    refocus();
  };

  const onPickImage = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const src = await uploadBlogImage(file);
      editor.chain().focus().setImage({ src, alt: '' }).run();
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'The upload failed.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const blocks = [
    { id: 'p', label: 'Text' },
    { id: 'lead', label: 'Intro' },
    { id: 'h2', label: 'Heading' },
    { id: 'h3', label: 'Subheading' }
  ];

  return (
    <div className="rounded-xl bg-white ring-1 ring-line">
      <div
        role="toolbar"
        aria-label="Formatting"
        /* Clicking a button must not take focus (or the selection) away from
           the text: keystrokes typed right after a click would otherwise land
           on the button — a space even "presses" it again. Keyboard users
           still Tab to the buttons as normal. */
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).closest('button')) e.preventDefault();
        }}
        className="sticky top-0 z-10 flex flex-wrap items-center gap-1 rounded-t-xl border-b border-line bg-white/95 px-2 py-1.5 backdrop-blur"
      >
        {/* Text styles and lists are off while an image is selected: applied to
            an image node they replaced it. */}
        <div className="flex rounded-md ring-1 ring-line" role="group" aria-label="Paragraph style">
          {blocks.map((b) => (
            <button
              key={b.id}
              type="button"
              aria-pressed={!state.image && state.block === b.id}
              disabled={state.image}
              onClick={() => setBlock(b.id)}
              className={`${btn} rounded-none px-3 first:rounded-l-md last:rounded-r-md`}
            >
              {b.label}
            </button>
          ))}
        </div>
        <span className="mx-1 h-6 w-px bg-line" aria-hidden="true" />
        <button type="button" className={btn} aria-label="Bold" title="Bold (Ctrl+B)" aria-pressed={state.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="size-4" />
        </button>
        <button type="button" className={btn} aria-label="Italic" title="Italic (Ctrl+I)" aria-pressed={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="size-4" />
        </button>
        <button type="button" className={btn} aria-label="Link" title="Link" aria-pressed={state.link} onClick={openLink}>
          <Link2 className="size-4" />
        </button>
        <span className="mx-1 h-6 w-px bg-line" aria-hidden="true" />
        <button type="button" className={btn} aria-label="Bulleted list" title="Bulleted list" disabled={state.image} aria-pressed={state.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="size-4" />
        </button>
        <button type="button" className={btn} aria-label="Numbered list" title="Numbered list" disabled={state.image} aria-pressed={state.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="size-4" />
        </button>
        <span className="mx-1 h-6 w-px bg-line" aria-hidden="true" />
        <button type="button" className={btn} title="Add an image" disabled={uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          <span>{uploading ? 'Uploading…' : 'Image'}</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/avif"
          className="hidden"
          onChange={(e) => onPickImage(e.target.files?.[0])}
        />
        <span className="ml-auto flex">
          <button type="button" className={btn} aria-label="Undo" title="Undo (Ctrl+Z)" disabled={!state.canUndo} onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 className="size-4" />
          </button>
          <button type="button" className={btn} aria-label="Redo" title="Redo (Ctrl+Shift+Z)" disabled={!state.canRedo} onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 className="size-4" />
          </button>
        </span>
      </div>

      {linkOpen && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-ivory/60 px-3 py-2" onMouseDown={keepFocus}>
          <label className="text-sm text-slate" htmlFor="link-url">Link to</label>
          <input
            id="link-url"
            autoFocus
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); applyLink(); }
              if (e.key === 'Escape') { setLinkOpen(false); refocus(); }
            }}
            placeholder="https://… or /capital-solutions"
            className="min-w-64 grow rounded-md bg-white px-3 py-1.5 text-sm ring-1 ring-line focus:outline-2 focus:outline-blue"
          />
          <button type="button" onClick={applyLink} className="rounded-md bg-navy-deep px-3 py-1.5 text-sm font-medium text-white">Apply</button>
          {state.link && (
            <button type="button" onClick={() => { setLinkValue(''); editor.chain().focus().extendMarkRange('link').unsetLink().run(); setLinkOpen(false); refocus(); }} className="rounded-md px-3 py-1.5 text-sm ring-1 ring-line hover:bg-white">
              Remove link
            </button>
          )}
          <button type="button" onClick={() => { setLinkOpen(false); refocus(); }} className="rounded-md px-3 py-1.5 text-sm text-slate hover:text-ink">Cancel</button>
          {linkError && <p className="w-full text-sm text-red-700">{linkError}</p>}
        </div>
      )}

      {state.image && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-ivory/60 px-3 py-2" onMouseDown={keepFocus}>
          <div className="flex rounded-md bg-white ring-1 ring-line" role="group" aria-label="Image size">
            {sizes.map((o) => (
              <button
                key={o.id}
                type="button"
                aria-pressed={state.imageSize === o.id}
                onClick={() => setImage({ size: o.id })}
                className={`${btn} rounded-none px-3 first:rounded-l-md last:rounded-r-md`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="flex rounded-md bg-white ring-1 ring-line" role="group" aria-label="Image position">
            {aligns.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                aria-label={label}
                title={state.imageSize === 'full' ? 'Pick a smaller size to place the image left or right' : label}
                aria-pressed={state.imageSize !== 'full' && state.imageAlign === id}
                disabled={state.imageSize === 'full'}
                onClick={() => setImage({ align: id })}
                className={`${btn} rounded-none first:rounded-l-md last:rounded-r-md`}
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>
          <span className="basis-full" aria-hidden="true" />
          <label className="text-sm text-slate" htmlFor="image-alt">Image description</label>
          <input
            id="image-alt"
            value={state.imageAlt}
            onChange={(e) => editor.chain().updateAttributes('image', { alt: e.target.value }).run()}
            placeholder="What the image shows, for people who can't see it"
            className="min-w-72 grow rounded-md bg-white px-3 py-1.5 text-sm ring-1 ring-line focus:outline-2 focus:outline-blue"
          />
          <button type="button" onClick={() => editor.chain().focus().deleteSelection().run()} className="rounded-md px-3 py-1.5 text-sm text-red-700 ring-1 ring-line hover:bg-white">
            Remove image
          </button>
        </div>
      )}

      {uploadError && <p role="alert" className="border-b border-line bg-red-50 px-4 py-2 text-sm text-red-800">{uploadError}</p>}

      <EditorContent editor={editor} />
    </div>
  );
}
