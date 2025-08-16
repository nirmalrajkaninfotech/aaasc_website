'use client';

import { useEffect, useRef, useState } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
// @ts-ignore
import Header from '@editorjs/header';
// @ts-ignore
import List from '@editorjs/list';
// @ts-ignore
import Paragraph from '@editorjs/paragraph';
// @ts-ignore
import Image from '@editorjs/image';
// @ts-ignore
import Quote from '@editorjs/quote';
// @ts-ignore
import Delimiter from '@editorjs/delimiter';
// @ts-ignore
import Table from '@editorjs/table';
// @ts-ignore
import CodeTool from '@editorjs/code';
// @ts-ignore
import LinkTool from '@editorjs/link';
// @ts-ignore
import Embed from '@editorjs/embed';
// @ts-ignore
import Marker from '@editorjs/marker';
// @ts-ignore
import InlineCode from '@editorjs/inline-code';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<EditorJS | null>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Convert HTML to Editor.js format
  const htmlToEditorJS = (html: string): OutputData => {
    if (!html || html.trim() === '') {
      return {
        time: Date.now(),
        blocks: [],
        version: '2.28.2'
      };
    }

    // Simple HTML to blocks conversion
    const blocks = [];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const elements = tempDiv.children;
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      if (element.tagName === 'H1') {
        blocks.push({
          type: 'header',
          data: { text: element.textContent, level: 1 }
        });
      } else if (element.tagName === 'H2') {
        blocks.push({
          type: 'header',
          data: { text: element.textContent, level: 2 }
        });
      } else if (element.tagName === 'H3') {
        blocks.push({
          type: 'header',
          data: { text: element.textContent, level: 3 }
        });
      } else if (element.tagName === 'UL') {
        const items = Array.from(element.querySelectorAll('li')).map(li => li.textContent);
        blocks.push({
          type: 'list',
          data: { style: 'unordered', items }
        });
      } else if (element.tagName === 'OL') {
        const items = Array.from(element.querySelectorAll('li')).map(li => li.textContent);
        blocks.push({
          type: 'list',
          data: { style: 'ordered', items }
        });
      } else if (element.tagName === 'IMG') {
        blocks.push({
          type: 'image',
          data: {
            file: { url: (element as HTMLImageElement).src },
            caption: (element as HTMLImageElement).alt || '',
            withBorder: false,
            withBackground: false,
            stretched: false
          }
        });
      } else if (element.tagName === 'BLOCKQUOTE') {
        blocks.push({
          type: 'quote',
          data: { text: element.textContent, caption: '' }
        });
      } else {
        // Default to paragraph
        if (element.textContent?.trim()) {
          blocks.push({
            type: 'paragraph',
            data: { text: element.innerHTML }
          });
        }
      }
    }

    // If no blocks were created, create a default paragraph
    if (blocks.length === 0 && html.trim()) {
      blocks.push({
        type: 'paragraph',
        data: { text: html }
      });
    }

    return {
      time: Date.now(),
      blocks,
      version: '2.28.2'
    };
  };

  // Convert Editor.js format to HTML
  const editorJSToHtml = (data: OutputData): string => {
    if (!data.blocks || data.blocks.length === 0) {
      return '';
    }

    return data.blocks.map(block => {
      switch (block.type) {
        case 'header':
          const level = block.data.level || 1;
          return `<h${level}>${block.data.text}</h${level}>`;

        case 'paragraph':
          return `<p>${block.data.text}</p>`;

        case 'list':
          const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
          const items = block.data.items.map((item: string) => `<li>${item}</li>`).join('');
          return `<${tag}>${items}</${tag}>`;

        case 'image':
          const img = block.data.file?.url || block.data.url;
          const caption = block.data.caption ? `<figcaption>${block.data.caption}</figcaption>` : '';
          return `<figure><img src="${img}" alt="${block.data.caption || ''}" />${caption}</figure>`;

        case 'quote':
          const cite = block.data.caption ? `<cite>${block.data.caption}</cite>` : '';
          return `<blockquote>${block.data.text}${cite}</blockquote>`;

        case 'delimiter':
          return '<hr>';

        case 'code':
          return `<pre><code>${block.data.code}</code></pre>`;

        case 'table':
          const rows = block.data.content.map((row: string[]) =>
            `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
          ).join('');
          return `<table><tbody>${rows}</tbody></table>`;

        default:
          return `<p>${block.data.text || ''}</p>`;
      }
    }).join('');
  };

  useEffect(() => {
    if (!holderRef.current || editorRef.current) return;

    const editor = new EditorJS({
      holder: holderRef.current,
      placeholder: placeholder || 'Start writing your content...',
      data: htmlToEditorJS(value),
      tools: {
        header: {
          class: Header,
          config: {
            levels: [1, 2, 3, 4, 5, 6],
            defaultLevel: 2
          }
        },
        paragraph: {
          class: Paragraph,
          inlineToolbar: true
        },
        list: {
          class: List,
          inlineToolbar: true,
          config: {
            defaultStyle: 'unordered'
          }
        },
        image: {
          class: Image,
          config: {
            endpoints: {
              byFile: '/api/upload-image',
              byUrl: '/api/fetch-image'
            },
            field: 'image',
            types: 'image/*',
            captionPlaceholder: 'Enter image caption...',
            buttonContent: 'Select an Image',
            uploader: {
              uploadByUrl: async (url: string) => {
                try {
                  const response = await fetch('/api/fetch-image', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url }),
                  });

                  const result = await response.json();
                  return result;
                } catch (error) {
                  console.error('Error uploading by URL:', error);
                  return {
                    success: 0,
                    message: 'Failed to upload image'
                  };
                }
              },
              uploadByFile: async (file: File) => {
                try {
                  const formData = new FormData();
                  formData.append('image', file);

                  const response = await fetch('/api/upload-image', {
                    method: 'POST',
                    body: formData,
                  });

                  const result = await response.json();
                  return result;
                } catch (error) {
                  console.error('Error uploading file:', error);
                  return {
                    success: 0,
                    message: 'Failed to upload image'
                  };
                }
              }
            },
            actions: [
              {
                name: 'new_button',
                icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-67 49v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>',
                title: 'New Image',
                toggle: true,
                action: (name: string) => {
                  // Custom action for new image
                  console.log('New image action:', name);
                }
              }
            ],
            // Enable image resizing with handles
            withBorder: true,
            withBackground: true,
            stretched: true,
            // Custom CSS classes for styling
            class: {
              wrapper: 'image-tool-wrapper',
              image: 'image-tool-image',
              caption: 'image-tool-caption'
            }
          }
        },
        quote: {
          class: Quote,
          inlineToolbar: true,
          config: {
            quotePlaceholder: 'Enter a quote',
            captionPlaceholder: 'Quote author'
          }
        },
        marker: {
          class: Marker
        },
        inlineCode: {
          class: InlineCode
        },
        delimiter: Delimiter,
        table: {
          class: Table,
          inlineToolbar: true,
          config: {
            rows: 2,
            cols: 3
          }
        },
        code: {
          class: CodeTool,
          config: {
            placeholder: 'Enter code here...'
          }
        },
        linkTool: {
          class: LinkTool,
          config: {
            endpoint: '/api/fetch-url' // You'll need to implement this
          }
        },
        embed: {
          class: Embed,
          config: {
            services: {
              youtube: true,
              coub: true,
              codepen: true,
              imgur: true
            }
          }
        }
      },
      onChange: async () => {
        if (editorRef.current) {
          try {
            const outputData = await editorRef.current.save();
            const html = editorJSToHtml(outputData);
            onChange(html);
          } catch (error) {
            console.error('Error saving editor data:', error);
          }
        }
      },
      onReady: () => {
        setIsReady(true);
      }
    });

    editorRef.current = editor;

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  // Update editor content when value prop changes
  useEffect(() => {
    if (isReady && editorRef.current && value !== undefined) {
      const currentData = htmlToEditorJS(value);
      editorRef.current.render(currentData);
    }
  }, [value, isReady]);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      <div
        ref={holderRef}
        className="min-h-[300px] p-4"
        style={{ minHeight: '300px' }}
      />

      <style jsx global>{`
        .codex-editor {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }
        
        .codex-editor__redactor {
          padding: 0 !important;
        }
        
        .ce-block__content {
          max-width: none !important;
          margin: 0 !important;
        }
        
        .ce-paragraph {
          line-height: 1.6;
          margin: 0.5em 0;
        }
        
        .ce-header {
          margin: 1em 0 0.5em 0;
          font-weight: 600;
        }
        
        .ce-toolbar__plus {
          color: #388ae5;
        }
        
        .ce-toolbar__settings-btn {
          color: #388ae5;
        }
        
        .ce-inline-toolbar {
          background: #fff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .ce-conversion-toolbar {
          background: #fff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .ce-settings {
          background: #fff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .ce-popover {
          background: #fff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .ce-block--selected .ce-block__content {
          background: rgba(59, 130, 246, 0.05);
        }
        
        .cdx-quote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
        }
        
        .cdx-list {
          margin: 0.5rem 0;
        }
        
        .cdx-list__item {
          line-height: 1.6;
          margin: 0.25rem 0;
        }
        
        .image-tool {
          margin: 1rem 0;
          position: relative;
        }
        
        .image-tool-wrapper {
          position: relative;
          display: inline-block;
          max-width: 100%;
        }
        
        .image-tool__image {
          border-radius: 8px;
          max-width: 100%;
          height: auto;
          display: block;
          transition: all 0.3s ease;
        }
        
        .image-tool__image:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .image-tool__caption {
          text-align: center;
          font-style: italic;
          color: #6b7280;
          margin-top: 0.5rem;
          font-size: 0.875rem;
          line-height: 1.4;
        }
        
        .image-tool__caption:empty::before {
          content: 'Enter image caption...';
          color: #9ca3af;
        }
        
        /* Image tool settings */
        .image-tool--withBorder .image-tool__image {
          border: 1px solid #e5e7eb;
          padding: 4px;
        }
        
        .image-tool--withBackground .image-tool__image {
          background: #f9fafb;
          padding: 8px;
        }
        
        .image-tool--stretched .image-tool__image {
          width: 100%;
          max-width: none;
        }
        
        /* Image resize handles */
        .image-tool:hover .image-resize-handle {
          opacity: 1;
        }
        
        .image-resize-handle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border: 1px solid white;
          border-radius: 2px;
          opacity: 0;
          transition: opacity 0.2s ease;
          cursor: pointer;
          z-index: 10;
        }
        
        .image-resize-handle:hover {
          background: #1d4ed8;
          transform: scale(1.2);
        }
        
        .image-resize-handle--nw {
          top: -4px;
          left: -4px;
          cursor: nw-resize;
        }
        
        .image-resize-handle--ne {
          top: -4px;
          right: -4px;
          cursor: ne-resize;
        }
        
        .image-resize-handle--sw {
          bottom: -4px;
          left: -4px;
          cursor: sw-resize;
        }
        
        .image-resize-handle--se {
          bottom: -4px;
          right: -4px;
          cursor: se-resize;
        }
        
        /* Image upload area */
        .image-tool__image-preloader {
          background: #f3f4f6;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          color: #6b7280;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }
        
        .image-tool__image-preloader:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        
        .image-tool__upload-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          margin-top: 0.5rem;
          transition: background 0.2s ease;
        }
        
        .image-tool__upload-button:hover {
          background: #1d4ed8;
        }
        
        /* Image tool tune buttons */
        .image-tool__tune {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .image-tool__tune-button {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .image-tool__tune-button:hover {
          background: #e5e7eb;
        }
        
        .image-tool__tune-button--active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        
        .cdx-table {
          margin: 1rem 0;
        }
        
        .tc-table {
          border-collapse: collapse;
          width: 100%;
        }
        
        .tc-table td {
          border: 1px solid #e5e7eb;
          padding: 0.5rem;
        }
        
        .cdx-code {
          background: #f3f4f6;
          border-radius: 6px;
          padding: 1rem;
          margin: 1rem 0;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          line-height: 1.5;
        }
        
        .ce-delimiter {
          margin: 2rem 0;
          text-align: center;
        }
        
        .ce-delimiter::before {
          content: '***';
          font-size: 1.5rem;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}