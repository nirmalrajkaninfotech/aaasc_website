'use client';

import { useState, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  return (
    <div className="border border-gray-300 rounded-md">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
          title="Underline"
        >
          <u>U</u>
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => execCommand('justifyLeft')}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
          title="Align Left"
        >
          ⬅
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyCenter')}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
          title="Align Center"
        >
          ↔
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyRight')}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
          title="Align Right"
        >
          ➡
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
          title="Bullet List"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
          title="Numbered List"
        >
          1.
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={insertImage}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
          title="Insert Image"
        >
          🖼
        </button>
        
        <select
          onChange={(e) => execCommand('fontSize', e.target.value)}
          className="px-2 py-1 text-sm border border-gray-300 rounded"
          defaultValue="3"
        >
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
          <option value="7">Extra Large</option>
        </select>
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        className="min-h-32 p-3 focus:outline-none"
        style={{ minHeight: '120px' }}
        data-placeholder={placeholder}
      />
      
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}