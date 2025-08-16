'use client';

import { useState, useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

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
      const img = document.createElement('img');
      img.src = url;
      img.style.width = '300px'; // Set initial width
      img.style.height = 'auto';
      img.style.cursor = 'pointer';
      img.className = 'resizable-image';
      img.draggable = false; // Prevent default drag behavior

      // Insert image at cursor position
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(img);
        range.collapse(false);
      } else if (editorRef.current) {
        editorRef.current.appendChild(img);
      }

      handleInput();
    }
  };

  const handleImageClick = (e: Event) => {
    const target = e.target as HTMLImageElement;
    if (target.tagName === 'IMG' && !target.classList.contains('has-wrapper')) {
      e.preventDefault();
      e.stopPropagation();

      // Remove any existing wrappers
      removeAllResizeWrappers();

      // Remove selected class from all images
      const allImages = editorRef.current?.querySelectorAll('img');
      allImages?.forEach(img => img.classList.remove('selected'));

      // Add selected class to clicked image
      target.classList.add('selected');
      setSelectedImage(target);

      // Wrap image with resize container
      wrapImageWithResizeHandles(target);
    }
  };

  const removeAllResizeWrappers = () => {
    const existingWrappers = document.querySelectorAll('.image-resize-wrapper');
    existingWrappers.forEach(wrapper => {
      const img = wrapper.querySelector('img');
      if (img) {
        img.classList.remove('has-wrapper');
        wrapper.parentNode?.insertBefore(img, wrapper);
      }
      wrapper.remove();
    });
  };

  const wrapImageWithResizeHandles = (img: HTMLImageElement) => {
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'image-resize-wrapper';
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    wrapper.style.border = '1px dashed #3b82f6';
    wrapper.style.background = 'rgba(59, 130, 246, 0.05)';

    // Insert wrapper before image
    img.parentNode?.insertBefore(wrapper, img);
    wrapper.appendChild(img);
    img.classList.add('has-wrapper');

    // Create resize handles
    const handles = ['se']; // Start with just one handle for simplicity

    handles.forEach(position => {
      const handle = document.createElement('div');
      handle.className = `resize-handle resize-handle-${position}`;
      handle.style.position = 'absolute';
      handle.style.width = '12px';
      handle.style.height = '12px';
      handle.style.backgroundColor = '#3b82f6';
      handle.style.border = '2px solid white';
      handle.style.borderRadius = '2px';
      handle.style.cursor = 'se-resize';
      handle.style.bottom = '-6px';
      handle.style.right = '-6px';
      handle.style.zIndex = '1000';

      // Add resize functionality
      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = img.offsetWidth;
        const startHeight = img.offsetHeight;
        const aspectRatio = startWidth / startHeight;

        const handleMouseMove = (e: MouseEvent) => {
          const deltaX = e.clientX - startX;
          const deltaY = e.clientY - startY;

          const newWidth = Math.max(50, startWidth + deltaX);
          const newHeight = newWidth / aspectRatio;

          img.style.width = `${newWidth}px`;
          img.style.height = `${newHeight}px`;
        };

        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          handleInput();
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      });

      wrapper.appendChild(handle);
    });
  };

  const resizeImage = (size: string) => {
    if (selectedImage) {
      const editorWidth = editorRef.current?.offsetWidth || 400;
      let newWidth: number;

      switch (size) {
        case 'small':
          newWidth = editorWidth * 0.25;
          break;
        case 'medium':
          newWidth = editorWidth * 0.5;
          break;
        case 'large':
          newWidth = editorWidth * 0.75;
          break;
        case 'full':
          newWidth = editorWidth * 0.95;
          break;
        default:
          newWidth = 300;
      }

      selectedImage.style.width = `${newWidth}px`;
      selectedImage.style.height = 'auto';
      selectedImage.style.maxWidth = 'none';

      // No need to update handle positions with wrapper approach

      handleInput();
    }
  };

  const alignImage = (alignment: string) => {
    if (selectedImage) {
      const wrapper = selectedImage.closest('.image-resize-wrapper') as HTMLElement;
      const targetElement = wrapper || selectedImage;

      // Reset all alignment styles
      targetElement.style.display = 'block';
      targetElement.style.marginLeft = '';
      targetElement.style.marginRight = '';
      targetElement.style.float = '';
      targetElement.style.textAlign = '';

      // Apply new alignment
      switch (alignment) {
        case 'left':
          targetElement.style.marginLeft = '0';
          targetElement.style.marginRight = 'auto';
          targetElement.style.display = 'block';
          break;
        case 'center':
          targetElement.style.marginLeft = 'auto';
          targetElement.style.marginRight = 'auto';
          targetElement.style.display = 'block';
          break;
        case 'right':
          targetElement.style.marginLeft = 'auto';
          targetElement.style.marginRight = '0';
          targetElement.style.display = 'block';
          break;
        case 'float-left':
          targetElement.style.float = 'left';
          targetElement.style.marginRight = '15px';
          targetElement.style.marginBottom = '10px';
          targetElement.style.display = 'block';
          break;
        case 'float-right':
          targetElement.style.float = 'right';
          targetElement.style.marginLeft = '15px';
          targetElement.style.marginBottom = '10px';
          targetElement.style.display = 'block';
          break;
      }
      handleInput();
    }
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('click', handleImageClick);
      return () => {
        editor.removeEventListener('click', handleImageClick);
      };
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Don't deselect if clicking on resize handles or wrapper
      if (target.classList.contains('resize-handle') ||
        target.classList.contains('image-resize-wrapper') ||
        target.closest('.image-resize-wrapper')) {
        return;
      }

      if (selectedImage && !selectedImage.contains(target) && !isResizing) {
        selectedImage.classList.remove('selected');
        removeAllResizeWrappers();
        setSelectedImage(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [selectedImage, isResizing]);

  // Cleanup resize wrappers on unmount
  useEffect(() => {
    return () => {
      removeAllResizeWrappers();
    };
  }, []);

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
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 active:bg-blue-100"
          title="Align Left"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyCenter')}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 active:bg-blue-100"
          title="Align Center"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h18v2H3V3zm3 4h12v2H6V7zm-3 4h18v2H3v-2zm3 4h12v2H6v-2zm-3 4h18v2H3v-2z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyRight')}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 active:bg-blue-100"
          title="Align Right"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h18v2H3V3zm6 4h12v2H9V7zm-6 4h18v2H3v-2zm6 4h12v2H9v-2zm-6 4h18v2H3v-2z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyFull')}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 active:bg-blue-100"
          title="Justify"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2z" />
          </svg>
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

        {selectedImage && (
          <>
            <div className="w-px h-6 bg-gray-300 mx-1"></div>

            {/* Image Size Controls */}
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => resizeImage('small')}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                title="Small Image (25%)"
              >
                S
              </button>
              <button
                type="button"
                onClick={() => resizeImage('medium')}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                title="Medium Image (50%)"
              >
                M
              </button>
              <button
                type="button"
                onClick={() => resizeImage('large')}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                title="Large Image (75%)"
              >
                L
              </button>
              <button
                type="button"
                onClick={() => resizeImage('full')}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                title="Full Width (100%)"
              >
                XL
              </button>
            </div>

            <div className="w-px h-6 bg-gray-300 mx-1"></div>

            {/* Image Alignment Controls */}
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => alignImage('left')}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                title="Align Left"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => alignImage('center')}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                title="Center"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 3h18v2H3V3zm3 4h12v2H6V7zm-3 4h18v2H3v-2zm3 4h12v2H6v-2zm-3 4h18v2H3v-2z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => alignImage('right')}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                title="Align Right"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 3h18v2H3V3zm6 4h12v2H9V7zm-6 4h18v2H3v-2zm6 4h12v2H9v-2zm-6 4h18v2H3v-2z" />
                </svg>
              </button>

              <div className="w-px h-4 bg-gray-300 mx-1"></div>

              <button
                type="button"
                onClick={() => alignImage('float-left')}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                title="Float Left (text wraps around)"
              >
                📄⬅
              </button>
              <button
                type="button"
                onClick={() => alignImage('float-right')}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                title="Float Right (text wraps around)"
              >
                ➡📄
              </button>
            </div>
          </>
        )}

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

      <style jsx global>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        .resizable-image {
          border: 2px solid transparent;
          transition: border-color 0.2s ease;
          position: relative;
          max-width: none !important;
          display: block;
        }
        
        .resizable-image:hover {
          border-color: #3b82f6;
        }
        
        .resizable-image.selected {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        
        .image-resize-wrapper {
          margin: 2px;
        }
        
        .image-resize-wrapper[style*="float: left"] {
          margin-right: 15px !important;
          margin-bottom: 10px !important;
        }
        
        .image-resize-wrapper[style*="float: right"] {
          margin-left: 15px !important;
          margin-bottom: 10px !important;
        }
        
        .resize-handle {
          transition: all 0.2s ease;
        }
        
        .resize-handle:hover {
          background-color: #1d4ed8 !important;
          transform: scale(1.1);
        }
        
        body.resizing {
          user-select: none;
          cursor: inherit;
        }
      `}</style>
    </div>
  );
}