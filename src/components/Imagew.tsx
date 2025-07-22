"use client"
import React, { useState, useCallback, useRef, useEffect, JSX } from 'react';
import Image from 'next/image';
// @ts-ignore - react-dnd types are not properly exported in the package
import { DndProvider, useDrag, useDrop } from 'react-dnd/dist/index.js';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { DragSourceMonitor, DropTargetMonitor } from 'react-dnd/dist/types';
import { FiEdit2, FiTrash2, FiUpload, FiSave, FiFolder, FiGrid, FiSquare, FiMove, FiX, FiPlus, FiSettings } from 'react-icons/fi';

type ImageLayout = 'default' | 'rounded' | 'circle' | 'full' | 'left' | 'right' | 'center' | 'grid';
type ImageSize = 'thumbnail' | 'medium' | 'large' | 'full';

interface GridConfig {
  columns: number;
  rowHeight: number;
  gap: number;
}

interface ImageItem {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  x: number;
  y: number;
  hAlign: 'left' | 'center' | 'right';
  vAlign: 'top' | 'middle' | 'bottom';
  caption: string;
  layout: ImageLayout;
  size: ImageSize;
  aspectRatio?: number;
  rowSpan?: number;
  colSpan?: number;
}

interface ImageConfig {
  grid: GridConfig;
  images: ImageItem[];
  layout?: ImageLayout;
  size?: ImageSize;
  className?: string;
}

const DEFAULT_GRID_CONFIG: GridConfig = {
  columns: 3,
  rowHeight: 200,
  gap: 16
};

const DEFAULT_CONFIG: ImageConfig = {
  grid: { ...DEFAULT_GRID_CONFIG },
  images: [],
  layout: 'default',
  size: 'medium',
  className: ''
} as const;

// DraggableImage should match ImageItem structure
interface DraggableImage extends Omit<ImageItem, 'caption' | 'layout' | 'size'> {
  caption: string;
  layout: ImageLayout;
  size: ImageSize;
}

// DraggableImage component
const DraggableImage = ({ 
  image, 
  index, 
  onMove, 
  onClick,
  onRemove,
  onConfigChange
}: { 
  image: ImageItem; 
  index: number; 
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onClick: (e: React.MouseEvent, idx: number) => void;
  onRemove: (id: string) => void;
  onConfigChange: (id: string, updates: Partial<ImageItem>) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'image',
    item: { index },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'image',
    hover: (item: { index: number }, monitor: DropTargetMonitor) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  // Use a callback ref to handle the drag and drop
  const setRef = useCallback((node: HTMLDivElement | null) => {
    ref.current = node;
    drag(drop(node));
  }, [drag, drop]);

  const getLayoutClass = (layout: ImageLayout) => {
    switch (layout) {
      case 'rounded': return 'rounded-lg';
      case 'circle': return 'rounded-full';
      case 'full': return 'w-full';
      case 'left': return 'float-left mr-4 mb-4';
      case 'right': return 'float-right ml-4 mb-4';
      case 'center': return 'mx-auto block';
      case 'grid': return 'w-full h-full object-cover';
      default: return '';
    }
  };

  const getNextLayout = (current: ImageLayout): ImageLayout => {
    const layouts: ImageLayout[] = ['default', 'rounded', 'circle', 'full', 'left', 'right', 'center', 'grid'];
    const currentIndex = layouts.indexOf(current);
    return layouts[(currentIndex + 1) % layouts.length];
  };

  const renderImage = useCallback((image: ImageItem, index: number) => {
    const { src, alt, width, height, layout = 'default', size = 'medium' } = image;
    const imageSize = sizeMap[size];
    
    return (
      <div
        key={image.id}
        className={`relative ${layout === 'grid' ? 'w-full h-full' : ''}`}
        style={{
          gridColumn: `span ${size === 'large' ? 2 : 1}`,
          gridRow: `span ${size === 'large' ? 2 : 1}`
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`w-full h-full object-cover ${
            layout === 'circle' ? 'rounded-full' : ''
          } ${layout === 'rounded' ? 'rounded-lg' : ''}`}
        />
      </div>
    );
  }, []);

  return (
    <div
      ref={setRef}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        position: 'relative',
        gridColumn: 'span 1',
      }}
      onClick={(e) => onClick(e, index)}
    >
      <div className="relative group">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className={`w-full h-auto ${getLayoutClass(image.layout)}`}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
          <button 
            className="p-2 bg-white rounded-full hover:bg-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              onConfigChange(image.id, { layout: getNextLayout(image.layout) });
            }}
          >
            <FiGrid className="w-4 h-4" />
          </button>
          <button 
            className="p-2 bg-white rounded-full hover:bg-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(image.id);
            }}
          >
            <FiTrash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
      {image.caption && (
        <div className="mt-2 text-sm text-center">
          {image.caption}
        </div>
      )}
    </div>
  );
};

interface ImageGalleryData {
  images: DraggableImage[];
  grid: GridConfig;
  layout: ImageLayout;
}

interface ImageGalleryProps {
  config?: Partial<ImageConfig>;
  onSave?: (config: ImageConfig) => void | Promise<void>;
  onLoad?: (images: ImageItem[]) => void;
  className?: string;
  onSelectImage?: (image: ImageItem | null) => void;
  onUpdateConfig?: (config: ImageConfig) => void;
}

const sizeMap: Record<ImageSize, { width: number; height: number }> = {
  thumbnail: { width: 150, height: 150 },
  medium: { width: 300, height: 200 },
  large: { width: 1024, height: 768 },
  full: { width: 0, height: 0 }, // Will use original dimensions
};

// ...

const ImageGallery: React.FC<ImageGalleryProps> = ({
  config: initialConfig = {
    ...DEFAULT_CONFIG,
    grid: DEFAULT_GRID_CONFIG,
    images: []
  },
  onSave = async () => {},
  onLoad = () => {},
  className = '',
  onSelectImage = () => {},
  onUpdateConfig = () => {}
}): JSX.Element => {
  // Initialize state with proper types and default values
  const [configState, setConfig] = useState<ImageConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
    grid: {
      ...DEFAULT_GRID_CONFIG,
      ...(initialConfig.grid || {})
    },
    images: initialConfig.images || []
  });
  const [images, setImages] = useState<ImageItem[]>(initialConfig.images || []);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Initialize refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image selection – shared by mouse click & keyboard
  const handleSelectImage = useCallback((image: ImageItem | null) => {
    setSelectedImage(prev => (image && prev?.id === image.id) ? null : image);
    if (image) {
      onSelectImage?.(image);
    }
  }, [onSelectImage]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectImage(images[index]);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      setImages(prev => prev.filter((_, i) => i !== index));
      if (selectedImage?.id === images[index]?.id) {
        setSelectedImage(null);
      }
    } else if (e.key === 'ArrowRight' && index < images.length - 1) {
      const nextElement = document.getElementById(`image-${index + 1}`);
      if (nextElement) (nextElement as HTMLElement).focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      const prevElement = document.getElementById(`image-${index - 1}`);
      if (prevElement) (prevElement as HTMLElement).focus();
    } else if (e.key === 'ArrowDown' && index < images.length - (configState.grid?.columns || 3)) {
      const belowElement = document.getElementById(`image-${index + (configState.grid?.columns || 3)}`);
      if (belowElement) (belowElement as HTMLElement).focus();
    } else if (e.key === 'ArrowUp' && index >= (configState.grid?.columns || 3)) {
      const aboveElement = document.getElementById(`image-${index - (configState.grid?.columns || 3)}`);
      if (aboveElement) (aboveElement as HTMLElement).focus();
    }
  }, [images, selectedImage, configState.grid?.columns, onSelectImage]);

  // Handle save
  const handleSave = useCallback(async () => {
    const saveData = {
      ...configState,
      images
    };
    
    try {
      if (onSave) {
        await onSave(saveData);
      }
      if (onUpdateConfig) {
        onUpdateConfig(saveData);
      }
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  }, [configState, images, onSave, onUpdateConfig]);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const img = new window.Image();
            img.onload = () => {
              const newImage: ImageItem = {
                id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                src: event.target?.result as string,
                alt: file.name.replace(/\.[^/.]+$/, ''),
                width: img.width,
                height: img.height,
                x: 0,
                y: 0,
                hAlign: 'center',
                vAlign: 'middle',
                caption: '',
                layout: 'default',
                size: 'medium',
                aspectRatio: img.width / img.height,
                rowSpan: 1,
                colSpan: 1
              };
              setImages(prev => [...prev, newImage]);
            };
            img.src = event.target.result as string;
          }
        };
        reader.onerror = () => {
          console.error('Error reading file');
        };
        reader.readAsDataURL(file);
      }
    }
  }, []);

  // Handle file change
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const img = new window.Image();
        img.onload = () => {
          const newImage: ImageItem = {
            id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            src: event.target?.result as string,
            alt: file.name.replace(/\.[^/.]+$/, ''),
            width: img.width,
            height: img.height,
            x: 0,
            y: 0,
            hAlign: 'center',
            vAlign: 'middle',
            caption: '',
            layout: 'default',
            size: 'medium',
            aspectRatio: img.width / img.height,
            rowSpan: 1,
            colSpan: 1
          };
          setImages(prev => [...prev, newImage]);
        };
        img.src = event.target.result as string;
      }
    };
    reader.onerror = () => {
      console.error('Error reading file');
    };
    reader.readAsDataURL(file);
    
    // Reset file input
    if (e.target) {
      e.target.value = '';
    }
  }, []);

  // Handle config panel toggle
  const toggleConfigPanel = useCallback(() => {
    setIsConfigPanelOpen(prev => !prev);
  }, []);

  // Move image
  const moveImage = useCallback((fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const newImages = [...prev];
      const [movedItem] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedItem);
      return newImages;
    });
  }, []);

  // Handle image click
  const handleImageClick = useCallback((e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    handleSelectImage(images[idx]);
  }, [images, handleSelectImage]);

  // Render grid layout
  const renderGrid = useCallback(() => {
    return (
      <div 
        className={`grid w-full`}
        style={{
          gridTemplateColumns: `repeat(${configState.grid.columns}, minmax(0, 1fr))`,
          gap: `${configState.grid.gap}px`
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {images.map((img, idx) => (
          <div 
            key={img.id} 
            className={`relative ${isDraggingOver ? 'border-2 border-dashed border-blue-500' : ''}`}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <DraggableImage
              image={img}
              index={idx}
              onMove={moveImage}
              onClick={handleImageClick}
              onRemove={(id) => setImages(prev => prev.filter(img => img.id !== id))}
              onConfigChange={(id, updates) => {
                setImages(prev => 
                  prev.map(img => 
                    img.id === id ? { ...img, ...updates } : img
                  )
                );
              }}
            />
          </div>
        ))}
      </div>
    );
  }, [images, configState.grid, isDraggingOver, handleDragOver, handleDragLeave, handleDrop, moveImage, handleImageClick]);

  return (
    <div 
      className={`relative ${className} ${isDraggingOver ? 'bg-blue-50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <DndProvider backend={HTML5Backend}>
        {renderGrid()}
        
        {/* File upload area */}
        <div className="mt-4 flex justify-center">
          <label className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors">
            <FiUpload className="mr-2" />
            Upload Images
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
          </label>
          
          <button 
            className="ml-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center"
            onClick={toggleConfigPanel}
          >
            <FiSettings className="mr-2" />
            Configure
          </button>
        </div>
      </DndProvider>
      
      {/* Configuration panel */}
      {isConfigPanelOpen && (
        <div className="fixed top-4 right-4 bg-white p-6 rounded-lg shadow-xl z-50 w-80">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Gallery Configuration</h3>
            <button 
              onClick={toggleConfigPanel}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Layout Type</label>
              <select 
                value={configState.layout}
                onChange={e => setConfig(prev => ({ ...prev, layout: e.target.value as ImageLayout }))}
                className="w-full p-2 border rounded"
              >
                <option value="grid">Grid</option>
                <option value="masonry">Masonry</option>
                <option value="flex">Flexbox</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Columns</label>
              <input 
                type="number" 
                min="1" 
                max="12"
                value={configState.grid.columns}
                onChange={e => setConfig(prev => ({
                  ...prev, 
                  grid: { ...prev.grid, columns: parseInt(e.target.value) }
                }))}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Gap Size (px)</label>
              <input 
                type="number" 
                min="0" 
                max="50"
                value={configState.grid.gap}
                onChange={e => setConfig(prev => ({
                  ...prev, 
                  grid: { ...prev.grid, gap: parseInt(e.target.value) }
                }))}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <button 
              className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              onClick={handleSave}
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;