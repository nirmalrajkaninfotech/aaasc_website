"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
const lowlight = createLowlight();

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "min-h-[300px] p-4 outline-none",
        placeholder: placeholder || "Start writing your content...",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  if (!editor) {
    return (
      <div className="min-h-[300px] p-4 border border-gray-300 rounded-lg bg-white">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      <div className="flex flex-wrap gap-2 p-2 border-b bg-gray-50">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? "font-bold text-blue-600" : ""}>B</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive("italic") ? "italic text-blue-600" : ""}>I</button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive("strike") ? "line-through text-blue-600" : ""}>S</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive("heading", { level: 1 }) ? "font-bold text-lg text-blue-600" : ""}>H1</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive("heading", { level: 2 }) ? "font-bold text-blue-600" : ""}>H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive("bulletList") ? "text-blue-600" : ""}>• List</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive("orderedList") ? "text-blue-600" : ""}>1. List</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive("blockquote") ? "text-blue-600" : ""}>&ldquo;</button>
        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()}>―</button>
        <button type="button" onClick={() => editor.chain().focus().setImage({ src: window.prompt("Image URL") || "" }).run()}>🖼️</button>
        <button type="button" onClick={() => editor.chain().focus().toggleLink({ href: window.prompt("URL") || "" }).run()}>🔗</button>
        <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive("codeBlock") ? "text-blue-600" : ""}>Code</button>
        <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Table</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}