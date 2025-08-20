'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import Youtube from '@tiptap/extension-youtube';

interface RichTextRendererProps {
  html: string;
  className?: string;
}

export default function RichTextRenderer({ html, className }: RichTextRendererProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [
      StarterKit,
      Image.configure({ allowBase64: true, inline: false, HTMLAttributes: { class: 'tiptap-image' } }),
      Link.configure({ openOnClick: true, HTMLAttributes: { class: 'tiptap-link' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Underline,
      Youtube.configure({ controls: false, nocookie: true }),
    ],
    content: html || '',
    editorProps: {
      attributes: { class: `tiptap-editor ${className || ''}`.trim() },
    },
  });

  if (!editor) return null;

  return (
    <div className="border-0">
      <EditorContent editor={editor} />
      <style jsx global>{`
        .tiptap-editor {
          outline: none;
          min-height: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
        }
        .tiptap-editor p { margin: 0.5em 0; }
        .tiptap-editor h1, .tiptap-editor h2, .tiptap-editor h3, .tiptap-editor h4, .tiptap-editor h5, .tiptap-editor h6 {
          margin: 1em 0 0.5em 0; font-weight: 600; line-height: 1.3;
        }
        .tiptap-editor h1 { font-size: 2em; }
        .tiptap-editor h2 { font-size: 1.5em; }
        .tiptap-editor h3 { font-size: 1.25em; }
        .tiptap-editor ul, .tiptap-editor ol { margin: 0.5em 0; padding-left: 1.5em; }
        .tiptap-editor li { margin: 0.25em 0; }
        .tiptap-editor blockquote { border-left: 4px solid #3b82f6; padding-left: 1rem; margin: 1rem 0; font-style: italic; color: #6b7280; }
        .tiptap-editor pre { background: #f3f4f6; border-radius: 6px; padding: 1rem; margin: 1rem 0; font-family: 'Monaco','Menlo','Ubuntu Mono',monospace; font-size: 0.875rem; line-height: 1.5; overflow-x: auto; }
        .tiptap-editor code { background: #f3f4f6; padding: 0.2em 0.4em; border-radius: 3px; font-family: 'Monaco','Menlo','Ubuntu Mono',monospace; font-size: 0.875em; }
        .tiptap-image { max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0; display: block; }
        .tiptap-link { color: #3b82f6; text-decoration: underline; }
        .tiptap-link:hover { color: #1d4ed8; }
        .tiptap-editor hr { border: none; border-top: 2px solid #e5e7eb; margin: 2rem 0; }
        .tiptap-editor mark { background: #fef08a; padding: 0.1em 0.2em; border-radius: 2px; }
      `}</style>
    </div>
  );
}


