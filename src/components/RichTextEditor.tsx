'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
// TextStyle, Color, and FontFamily extensions temporarily disabled due to import issues
// import TextStyle from '@tiptap/extension-text-style';
// import Color from '@tiptap/extension-color';
// import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
// Table extensions temporarily disabled due to import issues
// import Table from '@tiptap/extension-table';
// import TableRow from '@tiptap/extension-table-row';
// import TableCell from '@tiptap/extension-table-cell';
// import TableHeader from '@tiptap/extension-table-header';
import Youtube from '@tiptap/extension-youtube';
import { useState, useCallback, useRef, useEffect } from 'react';
// Temporarily disable Filerobot Image Editor due to import issues
// import dynamic from 'next/dynamic';

// const FilerobotImageEditor = dynamic(
//   () => import('filerobot-image-editor').then(mod => mod.default),
//   { ssr: false }
// );

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImageSrc, setEditingImageSrc] = useState<string>('');
  const [selectedImageElement, setSelectedImageElement] = useState<HTMLImageElement | null>(null);
  const [showImagePanel, setShowImagePanel] = useState(false);
  const [imageProperties, setImageProperties] = useState({
    width: '',
    height: '',
    opacity: 100,
    borderRadius: 8,
    borderWidth: 0,
    borderColor: '#000000',
    shadowBlur: 0,
    shadowColor: '#000000',
    rotation: 0,
    brightness: 100,
    contrast: 100,
    saturate: 100,
    grayscale: 0,
    sepia: 0,
    hueRotate: 0,
    blur: 0,
    marginTop: 16,
    marginBottom: 16,
    marginLeft: 0,
    marginRight: 0,
  });
  const imageEditorRef = useRef<any>(null);

  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration issues
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'tiptap-image',
        },
        allowBase64: true,
        inline: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'tiptap-link',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      // TextStyle, Color, FontFamily temporarily disabled
      // TextStyle,
      // Color,
      // FontFamily,
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
      // Table extensions temporarily disabled
      // Table.configure({
      //   resizable: true,
      // }),
      // TableRow,
      // TableHeader,
      // TableCell,
      Youtube.configure({
        controls: false,
        nocookie: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
      handleDoubleClick: (view, pos, event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'IMG') {
          const img = target as HTMLImageElement;
          openImageEditor(img.src, img);
          return true;
        }
        return false;
      },
    },
  });

  const addImage = useCallback(async () => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const uploadImage = useCallback(async (file: File) => {
    if (!editor) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        editor.chain().focus().setImage({ src: result.file.url }).run();
      } else {
        alert('Failed to upload image: ' + result.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  }, [editor]);

  const openImageEditor = useCallback((imageSrc?: string, imageElement?: HTMLImageElement) => {
    if (imageSrc) {
      setEditingImageSrc(imageSrc);
      setSelectedImageElement(imageElement || null);
      setShowImageEditor(true);
    }
  }, []);

  const handleImageEdit = useCallback(() => {
    // Temporarily disabled - show alert instead
    alert('Advanced image editing is temporarily disabled. Please use the regular upload button for now.');
  }, []);

  const handleImageSave = useCallback(async (editedImageObject: any, designState: any) => {
    try {
      // Convert the edited image to blob
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        canvas.toBlob(async (blob) => {
          if (blob && editor) {
            // Upload the edited image
            const formData = new FormData();
            formData.append('image', blob, 'edited-image.png');
            
            setIsUploading(true);
            try {
              const response = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData,
              });
              
              const result = await response.json();
              if (result.success) {
                if (selectedImageElement) {
                  // Update existing image
                  selectedImageElement.src = result.file.url;
                } else {
                  // Insert new image
                  editor.chain().focus().setImage({ src: result.file.url }).run();
                }
              }
            } catch (error) {
              console.error('Upload error:', error);
            } finally {
              setIsUploading(false);
              setShowImageEditor(false);
              setSelectedImageElement(null);
            }
          }
        }, 'image/png');
      };
      
      img.src = editedImageObject.imageBase64;
    } catch (error) {
      console.error('Error saving edited image:', error);
      setShowImageEditor(false);
    }
  }, [editor, selectedImageElement]);

  const handleImageClose = useCallback(() => {
    setShowImageEditor(false);
    setSelectedImageElement(null);
    setEditingImageSrc('');
  }, []);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        uploadImage(file);
      }
    };
    input.click();
  }, [uploadImage]);

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addYoutube = useCallback(() => {
    const url = prompt('Enter YouTube URL');
    if (url && editor) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: 640,
        height: 480,
      });
    }
  }, [editor]);

  const insertTable = useCallback(() => {
    // Table functionality temporarily disabled
    alert('Table functionality is temporarily disabled due to import issues');
  }, [editor]);

  const applyImageStyles = useCallback((properties: typeof imageProperties) => {
    if (editor) {
      const selection = editor.state.selection;
      if (selection) {
        const { from } = selection;
        const node = editor.state.doc.nodeAt(from);
        if (node?.type.name === 'image') {
          const filters = [
            `brightness(${properties.brightness}%)`,
            `contrast(${properties.contrast}%)`,
            `saturate(${properties.saturate}%)`,
            `grayscale(${properties.grayscale}%)`,
            `sepia(${properties.sepia}%)`,
            `hue-rotate(${properties.hueRotate}deg)`,
            `blur(${properties.blur}px)`
          ].join(' ');

          const boxShadow = properties.shadowBlur > 0 
            ? `0 ${properties.shadowBlur}px ${properties.shadowBlur * 2}px ${properties.shadowColor}` 
            : 'none';

          const style = [
            properties.width ? `width: ${properties.width}${properties.width.includes('%') || properties.width.includes('px') ? '' : 'px'}` : '',
            properties.height ? `height: ${properties.height}${properties.height.includes('%') || properties.height.includes('px') ? '' : 'px'}` : 'height: auto',
            `opacity: ${properties.opacity / 100}`,
            `border-radius: ${properties.borderRadius}px`,
            properties.borderWidth > 0 ? `border: ${properties.borderWidth}px solid ${properties.borderColor}` : '',
            boxShadow !== 'none' ? `box-shadow: ${boxShadow}` : '',
            properties.rotation !== 0 ? `transform: rotate(${properties.rotation}deg)` : '',
            filters !== 'brightness(100%) contrast(100%) saturate(100%) grayscale(0%) sepia(0%) hue-rotate(0deg) blur(0px)' ? `filter: ${filters}` : '',
            `margin: ${properties.marginTop}px ${properties.marginRight}px ${properties.marginBottom}px ${properties.marginLeft}px`,
            'transition: all 0.3s ease'
          ].filter(Boolean).join('; ');

          editor.chain().focus().updateAttributes('image', { style }).run();
        }
      }
    }
  }, [editor]);

  const openImagePanel = useCallback(() => {
    if (editor) {
      const selection = editor.state.selection;
      if (selection) {
        const { from } = selection;
        const node = editor.state.doc.nodeAt(from);
        if (node?.type.name === 'image') {
          // Extract current properties from the image
          const currentStyle = node.attrs.style || '';
          const extractValue = (property: string, defaultValue: any) => {
            const match = currentStyle.match(new RegExp(`${property}:\\s*([^;]+)`));
            return match ? match[1].trim() : defaultValue;
          };

          setImageProperties({
            width: extractValue('width', ''),
            height: extractValue('height', ''),
            opacity: Math.round(parseFloat(extractValue('opacity', '1')) * 100),
            borderRadius: parseInt(extractValue('border-radius', '8')) || 8,
            borderWidth: parseInt(extractValue('border-width', '0')) || 0,
            borderColor: extractValue('border-color', '#000000'),
            shadowBlur: 0, // Extract from box-shadow if needed
            shadowColor: '#000000',
            rotation: parseInt(extractValue('transform', '0').replace(/[^\d-]/g, '')) || 0,
            brightness: 100, // Extract from filter if needed
            contrast: 100,
            saturate: 100,
            grayscale: 0,
            sepia: 0,
            hueRotate: 0,
            blur: 0,
            marginTop: 16,
            marginBottom: 16,
            marginLeft: 0,
            marginRight: 0,
          });
          setShowImagePanel(true);
        }
      }
    }
  }, [editor]);

  if (!editor) {
    return <div className="border border-gray-300 rounded-lg p-4 min-h-[300px] bg-gray-50 animate-pulse" />;
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-3 bg-gray-50">
        <div className="flex flex-wrap gap-1">
          {/* Text Formatting */}
          <div className="flex gap-1 mr-2">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Bold"
            >
              <strong>B</strong>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Italic"
            >
              <em>I</em>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Underline"
            >
              <u>U</u>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('strike') ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Strikethrough"
            >
              <s>S</s>
            </button>
          </div>

          <div className="w-px h-8 bg-gray-300 mx-1"></div>

          {/* Headings */}
          <div className="flex gap-1 mr-2">
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`px-2 py-1 text-sm rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Heading 1"
            >
              H1
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`px-2 py-1 text-sm rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Heading 2"
            >
              H2
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`px-2 py-1 text-sm rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Heading 3"
            >
              H3
            </button>
          </div>

          <div className="w-px h-8 bg-gray-300 mx-1"></div>

          {/* Text Alignment */}
          <div className="flex gap-1 mr-2">
            <button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Align Left"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z" />
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Align Center"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h18v2H3V3zm3 4h12v2H6V7zm-3 4h18v2H3v-2zm3 4h12v2H6v-2zm-3 4h18v2H3v-2z" />
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Align Right"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h18v2H3V3zm6 4h12v2H9V7zm-6 4h18v2H3v-2zm6 4h12v2H9v-2zm-6 4h18v2H3v-2z" />
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Justify"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2z" />
              </svg>
            </button>
          </div>

          <div className="w-px h-8 bg-gray-300 mx-1"></div>

          {/* Lists */}
          <div className="flex gap-1 mr-2">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Bullet List"
            >
              •
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Numbered List"
            >
              1.
            </button>
          </div>

          <div className="w-px h-8 bg-gray-300 mx-1"></div>

          {/* Media & Content */}
          <div className="flex gap-1 mr-2">
            <button
              onClick={handleImageUpload}
              className="p-2 rounded hover:bg-gray-200"
              title="Upload Image"
              disabled={isUploading}
            >
              {isUploading ? '⏳' : '🖼️'}
            </button>
            <button
              onClick={openImagePanel}
              className="p-2 rounded hover:bg-gray-200"
              title="Professional Image Controls"
            >
              🎨
            </button>
            
            {/* Custom Image Resize Controls */}
            <div className="flex gap-1 items-center">
              <span className="text-xs text-gray-600">Size:</span>
              <input
                type="number"
                placeholder="Width"
                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                title="Width in pixels"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const width = (e.target as HTMLInputElement).value;
                    if (width && editor) {
                      const selection = editor.state.selection;
                      if (selection) {
                        const { from } = selection;
                        const node = editor.state.doc.nodeAt(from);
                        if (node?.type.name === 'image') {
                          editor.chain().focus().updateAttributes('image', { 
                            style: `width: ${width}px; height: auto;` 
                          }).run();
                        }
                      }
                    }
                  }
                }}
              />
              <span className="text-xs text-gray-400">px</span>
              
              <div className="w-px h-4 bg-gray-300 mx-1"></div>
              
              <input
                type="number"
                placeholder="%"
                className="w-12 px-2 py-1 text-xs border border-gray-300 rounded"
                title="Width as percentage"
                min="1"
                max="100"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const percent = (e.target as HTMLInputElement).value;
                    if (percent && editor) {
                      const selection = editor.state.selection;
                      if (selection) {
                        const { from } = selection;
                        const node = editor.state.doc.nodeAt(from);
                        if (node?.type.name === 'image') {
                          editor.chain().focus().updateAttributes('image', { 
                            style: `width: ${percent}%; height: auto;` 
                          }).run();
                        }
                      }
                    }
                  }
                }}
              />
              <span className="text-xs text-gray-400">%</span>
              
              <button
                onClick={() => {
                  const customSize = prompt('Enter image width (e.g., 300px, 50%, auto):');
                  if (customSize && editor) {
                    const selection = editor.state.selection;
                    if (selection) {
                      const { from } = selection;
                      const node = editor.state.doc.nodeAt(from);
                      if (node?.type.name === 'image') {
                        let style = '';
                        if (customSize.includes('px') || customSize.includes('%') || customSize === 'auto') {
                          style = `width: ${customSize}; height: auto;`;
                        } else if (!isNaN(Number(customSize))) {
                          style = `width: ${customSize}px; height: auto;`;
                        } else {
                          style = `width: ${customSize}; height: auto;`;
                        }
                        editor.chain().focus().updateAttributes('image', { style }).run();
                      }
                    }
                  }
                }}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                title="Custom Size Dialog"
              >
                📐
              </button>
            </div>

            <div className="w-px h-8 bg-gray-300 mx-1"></div>

            {/* Image Alignment Controls */}
            <div className="flex gap-1 items-center">
              <span className="text-xs text-gray-600">Align:</span>
              <button
                onClick={() => {
                  if (editor) {
                    const selection = editor.state.selection;
                    if (selection) {
                      const { from } = selection;
                      const node = editor.state.doc.nodeAt(from);
                      if (node?.type.name === 'image') {
                        const currentStyle = node.attrs.style || '';
                        const newStyle = currentStyle.replace(/display:\s*[^;]+;?/g, '').replace(/margin-left:\s*[^;]+;?/g, '').replace(/margin-right:\s*[^;]+;?/g, '');
                        editor.chain().focus().updateAttributes('image', { 
                          style: `${newStyle} display: block; margin-left: 0; margin-right: auto;`.trim()
                        }).run();
                      }
                    }
                  }
                }}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                title="Align Left"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z" />
                </svg>
              </button>
              <button
                onClick={() => {
                  if (editor) {
                    const selection = editor.state.selection;
                    if (selection) {
                      const { from } = selection;
                      const node = editor.state.doc.nodeAt(from);
                      if (node?.type.name === 'image') {
                        const currentStyle = node.attrs.style || '';
                        const newStyle = currentStyle.replace(/display:\s*[^;]+;?/g, '').replace(/margin-left:\s*[^;]+;?/g, '').replace(/margin-right:\s*[^;]+;?/g, '');
                        editor.chain().focus().updateAttributes('image', { 
                          style: `${newStyle} display: block; margin-left: auto; margin-right: auto;`.trim()
                        }).run();
                      }
                    }
                  }
                }}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                title="Center"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 3h18v2H3V3zm3 4h12v2H6V7zm-3 4h18v2H3v-2zm3 4h12v2H6v-2zm-3 4h18v2H3v-2z" />
                </svg>
              </button>
              <button
                onClick={() => {
                  if (editor) {
                    const selection = editor.state.selection;
                    if (selection) {
                      const { from } = selection;
                      const node = editor.state.doc.nodeAt(from);
                      if (node?.type.name === 'image') {
                        const currentStyle = node.attrs.style || '';
                        const newStyle = currentStyle.replace(/display:\s*[^;]+;?/g, '').replace(/margin-left:\s*[^;]+;?/g, '').replace(/margin-right:\s*[^;]+;?/g, '');
                        editor.chain().focus().updateAttributes('image', { 
                          style: `${newStyle} display: block; margin-left: auto; margin-right: 0;`.trim()
                        }).run();
                      }
                    }
                  }
                }}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                title="Align Right"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 3h18v2H3V3zm6 4h12v2H9V7zm-6 4h18v2H3v-2zm6 4h12v2H9v-2zm-6 4h18v2H3v-2z" />
                </svg>
              </button>
            </div>
            <button
              onClick={addImage}
              className="p-2 rounded hover:bg-gray-200"
              title="Add Image URL"
            >
              🔗
            </button>
            <button
              onClick={addLink}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Add Link"
            >
              🔗
            </button>
            <button
              onClick={addYoutube}
              className="p-2 rounded hover:bg-gray-200"
              title="Add YouTube Video"
            >
              📺
            </button>
          </div>

          <div className="w-px h-8 bg-gray-300 mx-1"></div>

          {/* Advanced */}
          <div className="flex gap-1 mr-2">
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Quote"
            >
              💬
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('codeBlock') ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Code Block"
            >
              &lt;/&gt;
            </button>
            <button
              onClick={insertTable}
              className="p-2 rounded hover:bg-gray-200"
              title="Insert Table"
            >
              📊
            </button>
            <button
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="p-2 rounded hover:bg-gray-200"
              title="Horizontal Rule"
            >
              ➖
            </button>
          </div>

          <div className="w-px h-8 bg-gray-300 mx-1"></div>

          {/* Text Colors */}
          <div className="flex gap-1">
            {/* Color picker temporarily disabled */}
            {/* <input
              type="color"
              onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
              value={editor.getAttributes('textStyle').color || '#000000'}
              className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              title="Text Color"
            /> */}
            <button
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('highlight') ? 'bg-yellow-100 text-yellow-600' : ''}`}
              title="Highlight"
            >
              🖍️
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-4 min-h-[300px]">
        <EditorContent 
          editor={editor} 
          placeholder={placeholder || 'Start writing your content...'}
        />
      </div>

      {/* Professional Image Control Panel */}
      {showImagePanel && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">🎨 Professional Image Controls</h3>
              <button
                onClick={() => setShowImagePanel(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Size & Position */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 border-b pb-2">📏 Size & Position</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                      <input
                        type="text"
                        value={imageProperties.width}
                        onChange={(e) => setImageProperties(prev => ({ ...prev, width: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="300px or 50%"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                      <input
                        type="text"
                        value={imageProperties.height}
                        onChange={(e) => setImageProperties(prev => ({ ...prev, height: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="auto or 200px"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Opacity: {imageProperties.opacity}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={imageProperties.opacity}
                      onChange={(e) => setImageProperties(prev => ({ ...prev, opacity: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rotation: {imageProperties.rotation}°</label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={imageProperties.rotation}
                      onChange={(e) => setImageProperties(prev => ({ ...prev, rotation: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Borders & Effects */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 border-b pb-2">🎭 Borders & Effects</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Border Radius: {imageProperties.borderRadius}px</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={imageProperties.borderRadius}
                      onChange={(e) => setImageProperties(prev => ({ ...prev, borderRadius: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Border Width: {imageProperties.borderWidth}px</label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={imageProperties.borderWidth}
                        onChange={(e) => setImageProperties(prev => ({ ...prev, borderWidth: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Border Color</label>
                      <input
                        type="color"
                        value={imageProperties.borderColor}
                        onChange={(e) => setImageProperties(prev => ({ ...prev, borderColor: e.target.value }))}
                        className="w-full h-10 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Shadow Blur: {imageProperties.shadowBlur}px</label>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        value={imageProperties.shadowBlur}
                        onChange={(e) => setImageProperties(prev => ({ ...prev, shadowBlur: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Shadow Color</label>
                      <input
                        type="color"
                        value={imageProperties.shadowColor}
                        onChange={(e) => setImageProperties(prev => ({ ...prev, shadowColor: e.target.value }))}
                        className="w-full h-10 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 border-b pb-2">🌈 Filters</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brightness: {imageProperties.brightness}%</label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={imageProperties.brightness}
                      onChange={(e) => setImageProperties(prev => ({ ...prev, brightness: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contrast: {imageProperties.contrast}%</label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={imageProperties.contrast}
                      onChange={(e) => setImageProperties(prev => ({ ...prev, contrast: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Saturation: {imageProperties.saturate}%</label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={imageProperties.saturate}
                      onChange={(e) => setImageProperties(prev => ({ ...prev, saturate: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grayscale: {imageProperties.grayscale}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={imageProperties.grayscale}
                      onChange={(e) => setImageProperties(prev => ({ ...prev, grayscale: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Advanced Filters */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 border-b pb-2">✨ Advanced</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sepia: {imageProperties.sepia}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={imageProperties.sepia}
                      onChange={(e) => setImageProperties(prev => ({ ...prev, sepia: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hue Rotate: {imageProperties.hueRotate}°</label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={imageProperties.hueRotate}
                      onChange={(e) => setImageProperties(prev => ({ ...prev, hueRotate: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blur: {imageProperties.blur}px</label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={imageProperties.blur}
                      onChange={(e) => setImageProperties(prev => ({ ...prev, blur: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  {/* Quick Presets */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quick Presets</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setImageProperties(prev => ({ ...prev, brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0 }))}
                        className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        Reset Filters
                      </button>
                      <button
                        onClick={() => setImageProperties(prev => ({ ...prev, grayscale: 100, contrast: 110 }))}
                        className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        B&W
                      </button>
                      <button
                        onClick={() => setImageProperties(prev => ({ ...prev, sepia: 80, brightness: 110, contrast: 120 }))}
                        className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        Vintage
                      </button>
                      <button
                        onClick={() => setImageProperties(prev => ({ ...prev, saturate: 150, contrast: 120, brightness: 105 }))}
                        className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        Vibrant
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <button
                  onClick={() => {
                    setImageProperties({
                      width: '',
                      height: '',
                      opacity: 100,
                      borderRadius: 8,
                      borderWidth: 0,
                      borderColor: '#000000',
                      shadowBlur: 0,
                      shadowColor: '#000000',
                      rotation: 0,
                      brightness: 100,
                      contrast: 100,
                      saturate: 100,
                      grayscale: 0,
                      sepia: 0,
                      hueRotate: 0,
                      blur: 0,
                      marginTop: 16,
                      marginBottom: 16,
                      marginLeft: 0,
                      marginRight: 0,
                    });
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Reset All
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => applyImageStyles(imageProperties)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Apply Changes
                  </button>
                  <button
                    onClick={() => setShowImagePanel(false)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .tiptap-editor {
          outline: none;
          min-height: 250px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
        }

        .tiptap-editor p {
          margin: 0.5em 0;
        }

        .tiptap-editor h1, .tiptap-editor h2, .tiptap-editor h3, 
        .tiptap-editor h4, .tiptap-editor h5, .tiptap-editor h6 {
          margin: 1em 0 0.5em 0;
          font-weight: 600;
          line-height: 1.3;
        }

        .tiptap-editor h1 { font-size: 2em; }
        .tiptap-editor h2 { font-size: 1.5em; }
        .tiptap-editor h3 { font-size: 1.25em; }

        .tiptap-editor ul, .tiptap-editor ol {
          margin: 0.5em 0;
          padding-left: 1.5em;
        }

        .tiptap-editor li {
          margin: 0.25em 0;
        }

        .tiptap-editor blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }

        .tiptap-editor pre {
          background: #f3f4f6;
          border-radius: 6px;
          padding: 1rem;
          margin: 1rem 0;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          line-height: 1.5;
          overflow-x: auto;
        }

        .tiptap-editor code {
          background: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875em;
        }

        .tiptap-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1rem 0;
          display: block;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        /* Image alignment styles */
        .tiptap-image[style*="margin-left: 0"][style*="margin-right: auto"] {
          /* Left aligned */
          margin-left: 0 !important;
          margin-right: auto !important;
        }

        .tiptap-image[style*="margin-left: auto"][style*="margin-right: auto"] {
          /* Center aligned */
          margin-left: auto !important;
          margin-right: auto !important;
        }

        .tiptap-image[style*="margin-left: auto"][style*="margin-right: 0"] {
          /* Right aligned */
          margin-left: auto !important;
          margin-right: 0 !important;
        }

        .tiptap-image:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: scale(1.02);
        }

        .tiptap-image:hover::after {
          content: '🔍 Click to select • Drag corners to resize';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          animation: fadeIn 0.3s ease forwards;
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }

        .tiptap-image.ProseMirror-selectednode {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Image resize handles */
        .tiptap-image.ProseMirror-selectednode::before {
          content: '';
          position: absolute;
          top: -4px;
          right: -4px;
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border: 1px solid white;
          border-radius: 2px;
          cursor: se-resize;
          z-index: 10;
        }

        .tiptap-image.ProseMirror-selectednode::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: -4px;
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border: 1px solid white;
          border-radius: 2px;
          cursor: nw-resize;
          z-index: 10;
        }

        .tiptap-link {
          color: #3b82f6;
          text-decoration: underline;
          cursor: pointer;
        }

        .tiptap-link:hover {
          color: #1d4ed8;
        }

        .tiptap-editor table {
          border-collapse: collapse;
          margin: 1rem 0;
          width: 100%;
        }

        .tiptap-editor th, .tiptap-editor td {
          border: 1px solid #e5e7eb;
          padding: 0.5rem;
          text-align: left;
          vertical-align: top;
        }

        .tiptap-editor th {
          background: #f9fafb;
          font-weight: 600;
        }

        .tiptap-editor .selectedCell {
          background: rgba(59, 130, 246, 0.1);
        }

        .tiptap-editor hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2rem 0;
        }

        .tiptap-editor mark {
          background: #fef08a;
          padding: 0.1em 0.2em;
          border-radius: 2px;
        }

        .tiptap-editor .youtube-video {
          margin: 1rem 0;
          border-radius: 8px;
          overflow: hidden;
        }

        .tiptap-editor:empty::before {
          content: attr(placeholder);
          color: #9ca3af;
          pointer-events: none;
          position: absolute;
        }

        .ProseMirror-focused {
          outline: none;
        }
      `}</style>
    </div>
  );
}