"use client";

import React, { useState, useCallback, useRef, useEffect, JSX } from "react";
import Image from "next/image";
// @ts-ignore
import { DndProvider, useDrag, useDrop } from "react-dnd/dist/index.js";
import { HTML5Backend } from "react-dnd-html5-backend";
import type { DragSourceMonitor, DropTargetMonitor } from "react-dnd/dist/types";
import {
  FiEdit2,
  FiTrash2,
  FiUpload,
  FiSave,
  FiGrid,
  FiMove,
  FiX,
  FiPlus,
  FiSettings,
  FiMaximize2,
  FiMinimize2,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiChevronDown,
  FiAperture,
  FiImage,
  FiType,
  FiAnchor,
  FiLock,
  FiUnlock,
  FiList,
  FiColumns,
  FiLayers,
  FiLayout,
  FiCornerDownLeft,
  FiCornerDownRight,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiSquare,
  FiTriangle,
  FiCircle,
} from "react-icons/fi";

type ImageLayout = 
  | "default"
  | "rounded"
  | "circle"
  | "full"
  | "left"
  | "right"
  | "center"
  | "grid"
  | "top-center"
  | "bottom-left"
  | "bottom-right"
  | "half-left"
  | "half-right"
  | "quarter-top-left"
  | "quarter-top-right"
  | "quarter-bottom-left"
  | "quarter-bottom-right"
  | "absolute";

type ImageSize = "thumbnail" | "medium" | "large" | "full";
type ImageFit = "fill" | "cover" | "contain" | "scale-down" | "none";
type GalleryView = "grid" | "list" | "masonry" | "absolute";

interface GridConfig {
  columns: number;
  rowHeight: number; // in px
  gap: number; // in px
}

interface ImageItem {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  x: number; // for absolute positioning
  y: number; // for absolute positioning
  w: number; // width in px
  h: number; // height in px
  hAlign: "left" | "center" | "right";
  vAlign: "top" | "middle" | "bottom";
  caption: string;
  layout: ImageLayout;
  size: ImageSize;
  aspectRatio?: number;
  rowSpan?: number;
  colSpan?: number;
  radius?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  shadow?: "none" | "sm" | "md" | "lg";
  fit?: ImageFit;
  zIndex?: number;
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
  rowHeight: 220,
  gap: 16,
};

const DEFAULT_CONFIG: ImageConfig = {
  grid: { ...DEFAULT_GRID_CONFIG },
  images: [],
  layout: "default",
  size: "medium",
  className: "",
} as const;

const sizeMap: Record<ImageSize, { width: number; height: number }> = {
  thumbnail: { width: 150, height: 150 },
  medium: { width: 600, height: 400 },
  large: { width: 1024, height: 768 },
  full: { width: 0, height: 0 }, // use original
};

const radiusClassMap: Record<NonNullable<ImageItem["radius"]>, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

const shadowClassMap: Record<NonNullable<ImageItem["shadow"]>, string> = {
  none: "shadow-none",
  sm: "shadow",
  md: "shadow-md",
  lg: "shadow-lg",
};

const controlButton =
  "p-2 bg-white/90 hover:bg-white text-gray-700 rounded-md border border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow-md";

const pillButton =
  "px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full border border-gray-200 transition-all";

const panelClass =
  "fixed top-4 right-4 bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-2xl z-50 w-96 border border-gray-200";

const toolbarClass =
  "absolute inset-x-2 top-2 flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity";

const resizeHandleClass =
  "absolute w-4 h-4 bg-white border border-gray-300 rounded-sm shadow cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity";

const viewButton = "p-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors";
const activeViewButton = "p-2 bg-blue-100 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-200 transition-colors";

const descriptions: Record<ImageFit, string> = {
  fill: "Stretches image to fill container",
  cover: "Covers container while maintaining aspect ratio",
  contain: "Shows entire image within container",
  "scale-down": "Like contain, but never scales up",
  none: "Original size, no scaling",
};

const FitModeTooltip: React.FC<{ mode: ImageFit }> = ({ mode }) => {
  return (
    <div className="relative group">
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {descriptions[mode]}
      </div>
      <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1 border-4 border-transparent border-t-gray-900" />
    </div>
  );
};

// Draggable + Resizable item
const DraggableImage = ({
  image,
  index,
  onMove,
  onClick,
  onRemove,
  onConfigChange,
  grid,
  view,
}: {
  image: ImageItem;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onClick: (e: React.MouseEvent, idx: number) => void;
  onRemove: (id: string) => void;
  onConfigChange: (id: string, updates: Partial<ImageItem>) => void;
  grid: GridConfig;
  view: GalleryView;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: "image",
    item: { index },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "image",
    hover: (item: { index: number }, monitor: DropTargetMonitor) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      
      // Determine if we're dropping above or below
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect?.top || 0) + (hoverBoundingRect?.height || 0) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset?.y || 0);
      
      // Only change the index if the user has dragged past the middle of the element
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      
      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      ref.current = node;
      if (node) drag(drop(node));
    },
    [drag, drop]
  );

  const getLayoutClass = (layout: ImageLayout) => {
    switch (layout) {
      case "rounded":
        return "rounded-lg";
      case "circle":
        return "rounded-full";
      case "full":
        return "w-full";
      case "left":
        return "float-left mr-4 mb-4";
      case "right":
        return "float-right ml-4 mb-4";
      case "center":
        return "mx-auto block";
      case "grid":
        return "w-full h-full object-cover";
      case "top-center":
        return "w-full";
      case "bottom-left":
        return "w-full";
      case "bottom-right":
        return "w-full";
      case "half-left":
        return "w-1/2 float-left";
      case "half-right":
        return "w-1/2 float-right";
      case "quarter-top-left":
        return "w-1/4 h-1/4";
      case "quarter-top-right":
        return "w-1/4 h-1/4";
      case "quarter-bottom-left":
        return "w-1/4 h-1/4";
      case "quarter-bottom-right":
        return "w-1/4 h-1/4";
      case "absolute":
        return "absolute";
      default:
        return "";
    }
  };

  const alignmentWrapper = () => {
    if (image.layout === "left") return "justify-start";
    if (image.layout === "right") return "justify-end";
    if (image.layout === "center") return "justify-center";
    return "";
  };

  const colSpan = Math.min(Math.max(image.colSpan || 1, 1), grid.columns);
  const rowSpan = Math.max(image.rowSpan || 1, 1);

  // Resize handles – updates colSpan/rowSpan based on drag distance
  const startPosRef = useRef<{ x: number; y: number; colSpan: number; rowSpan: number } | null>(null);
  const [resizing, setResizing] = useState(false);

  const onResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startPosRef.current = { x: e.clientX, y: e.clientY, colSpan, rowSpan };
    setResizing(true);
    window.addEventListener("mousemove", onResizing);
    window.addEventListener("mouseup", onResizeEnd);
  };

  const onResizing = (e: MouseEvent) => {
    if (!startPosRef.current) return;
    const { x, y, colSpan: startCols, rowSpan: startRows } = startPosRef.current;
    const dx = e.clientX - x;
    const dy = e.clientY - y;

    const colWidth = (ref.current?.parentElement?.clientWidth || 0) / grid.columns;
    const deltaCols = Math.round(dx / colWidth);
    const deltaRows = Math.round(dy / grid.rowHeight);

    const nextCols = Math.min(Math.max(startCols + deltaCols, 1), grid.columns);
    const nextRows = Math.max(startRows + deltaRows, 1);

    onConfigChange(image.id, { colSpan: nextCols, rowSpan: nextRows });
  };

  const onResizeEnd = () => {
    setResizing(false);
    startPosRef.current = null;
    window.removeEventListener("mousemove", onResizing);
    window.removeEventListener("mouseup", onResizeEnd);
  };

  // Aspect ratio lock for internal object-fit scaling
  const [lockAspect, setLockAspect] = useState(true);

  const radiusClass = radiusClassMap[image.radius || "md"];
  const shadowClass = shadowClassMap[image.shadow || "md"];

  const fitModes: ImageFit[] = ["fill", "cover", "contain", "scale-down", "none"];

  return (
    <div
      ref={setRef}
      style={{
        opacity: isDragging ? 0.5 : 1,
        gridColumn: view === "grid" ? `span ${colSpan}` : undefined,
        gridRow: view === "grid" ? `span ${rowSpan}` : undefined,
        transition: "box-shadow 150ms ease, transform 150ms ease",
        ...(view === "absolute" && image.layout === "absolute" ? {
          position: "absolute",
          left: `${image.x}px`,
          top: `${image.y}px`,
          width: `${image.w}px`,
          height: `${image.h}px`,
          zIndex: image.zIndex || 0
        } : {})
      }}
      className={`group relative ${alignmentWrapper()} ${
        view === "list" ? "flex gap-4 items-start" : ""
      }`}
      onClick={(e) => onClick(e, index)}
      role="button"
      tabIndex={0}
    >
      <div
        className={`relative overflow-hidden bg-white ${radiusClass} ${shadowClass} border border-gray-200 hover:border-gray-300 transition-all`}
        style={{
          height: `calc(${rowSpan} * ${grid.rowHeight}px + ${(rowSpan - 1) * grid.gap}px)`,
          ...(view === "absolute" && image.layout === "absolute" ? {
            width: `${image.w}px`,
            height: `${image.h}px`
          } : {})
        }}
      >
        <div className={toolbarClass}>
          <div className="flex items-center gap-1">
            <button
              className={controlButton}
              title="Drag to reorder"
              onMouseDown={(e) => {
                e.stopPropagation();
                // This will be handled by the drag system
              }}
            >
              <FiMove />
            </button>
            <button
              className={controlButton}
              title="Cycle layout"
              onClick={(e) => {
                e.stopPropagation();
                const layouts: ImageLayout[] = [
                  "default", "rounded", "circle", "full", "left", "right", "center", "grid",
                  "top-center", "bottom-left", "bottom-right", "half-left", "half-right",
                  "quarter-top-left", "quarter-top-right", "quarter-bottom-left", "quarter-bottom-right", "absolute"
                ];
                const currentIndex = layouts.indexOf(image.layout || "default");
                const next = layouts[(currentIndex + 1) % layouts.length];
                onConfigChange(image.id, { layout: next });
              }}
            >
              <FiGrid />
            </button>
            <button
              className={controlButton}
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(image.id);
              }}
            >
              <FiTrash2 className="text-red-500" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              className={`${controlButton} ${image.layout === "left" ? "ring-2 ring-blue-500" : ""}`}
              title="Align Left"
              onClick={(e) => {
                e.stopPropagation();
                onConfigChange(image.id, { layout: "left" });
              }}
            >
              <FiAlignLeft />
            </button>
            <button
              className={`${controlButton} ${image.layout === "center" ? "ring-2 ring-blue-500" : ""}`}
              title="Align Center"
              onClick={(e) => {
                e.stopPropagation();
                onConfigChange(image.id, { layout: "center" });
              }}
            >
              <FiAlignCenter />
            </button>
            <button
              className={`${controlButton} ${image.layout === "right" ? "ring-2 ring-blue-500" : ""}`}
              title="Align Right"
              onClick={(e) => {
                e.stopPropagation();
                onConfigChange(image.id, { layout: "right" });
              }}
            >
              <FiAlignRight />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              className={`${controlButton} flex items-center gap-1 relative group`}
              title="Change fit mode"
              onClick={(e) => {
                e.stopPropagation();
                const currentIndex = fitModes.indexOf(image.fit || "cover");
                const nextFit = fitModes[(currentIndex + 1) % fitModes.length];
                onConfigChange(image.id, { fit: nextFit });
              }}
            >
              <FiAperture />
              <span className="text-xs">{image.fit || "cover"}</span>
              <FitModeTooltip mode={image.fit || "cover"} />
            </button>
          </div>
        </div>

        <div className="absolute right-2 bottom-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className={pillButton}
            title="Decrease width"
            onClick={(e) => {
              e.stopPropagation();
              onConfigChange(image.id, { colSpan: Math.max((image.colSpan || 1) - 1, 1) });
            }}
          >
            <FiChevronLeft />
          </button>
          <button
            className={pillButton}
            title="Increase width"
            onClick={(e) => {
              e.stopPropagation();
              onConfigChange(image.id, { colSpan: Math.min((image.colSpan || 1) + 1, grid.columns) });
            }}
          >
            <FiChevronRight />
          </button>
          <button
            className={pillButton}
            title="Decrease height"
            onClick={(e) => {
              e.stopPropagation();
              onConfigChange(image.id, { rowSpan: Math.max((image.rowSpan || 1) - 1, 1) });
            }}
          >
            <FiChevronUp />
          </button>
          <button
            className={pillButton}
            title="Increase height"
            onClick={(e) => {
              e.stopPropagation();
              onConfigChange(image.id, { rowSpan: Math.max((image.rowSpan || 1) + 1, 1) });
            }}
          >
            <FiChevronDown />
          </button>
        </div>

        <button
          className={`absolute left-2 bottom-2 ${pillButton} flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity`}
          title={lockAspect ? "Unlock aspect ratio" : "Lock aspect ratio"}
          onClick={(e) => {
            e.stopPropagation();
            setLockAspect((s) => !s);
          }}
        >
          {lockAspect ? <FiLock /> : <FiUnlock />}
          <span className="text-xs">{lockAspect ? "Lock" : "Free"}</span>
        </button>

        <div className="absolute -bottom-2 -right-2" onMouseDown={onResizeStart}>
          <div className={`${resizeHandleClass} translate-x-2 translate-y-2 flex items-center justify-center`}>
            {resizing ? <FiMinimize2 className="text-gray-500" /> : <FiMaximize2 className="text-gray-500" />}
          </div>
        </div>

        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className={`w-full h-full ${getLayoutClass(image.layout)} ${
            image.layout === "circle" ? "rounded-full" : ""
          } ${image.layout === "rounded" ? "rounded-lg" : ""}`}
          style={{
            objectFit: image.fit || "cover",
            aspectRatio: lockAspect && image.aspectRatio ? `${image.aspectRatio}` : "auto",
            ...(view === "absolute" && image.layout === "absolute" ? {
              width: `${image.w}px`,
              height: `${image.h}px`
            } : {})
          }}
          onClick={(e) => e.stopPropagation()}
        />

        {image.caption && (
          <div className="absolute left-0 right-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent text-white text-sm p-2">
            <div className="line-clamp-2">{image.caption}</div>
          </div>
        )}
      </div>
    </div>
  );
};

interface ImageGalleryProps {
  config?: Partial<ImageConfig>;
  onSave?: (config: ImageConfig) => void | Promise<void>;
  onLoad?: (images: ImageItem[]) => void;
  className?: string;
  onSelectImage?: (image: ImageItem | null) => void;
  onUpdateConfig?: (config: ImageConfig) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  config: initialConfig = {
    ...DEFAULT_CONFIG,
    grid: DEFAULT_GRID_CONFIG,
    images: [],
  },
  onSave = async () => {},
  onLoad = () => {},
  className = "",
  onSelectImage = () => {},
  onUpdateConfig = () => {},
}): JSX.Element => {
  const [configState, setConfig] = useState<ImageConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
    grid: {
      ...DEFAULT_GRID_CONFIG,
      ...(initialConfig.grid || {}),
    },
    images: initialConfig.images || [],
  });

  const [images, setImages] = useState<ImageItem[]>(initialConfig.images || []);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<GalleryView>("grid");

  const fileInputRef = useRef<HTMLInputElement>(null);

  function updateSelected<K extends keyof ImageItem>(key: K, value: ImageItem[K]) {
    if (!selectedImage) return;
    setSelectedImage((s) => (s ? { ...s, [key]: value } : s));
    setImages((prev) => prev.map((img) => (img.id === selectedImage.id ? { ...img, [key]: value } : img)));
  }

  const handleSelectImage = useCallback(
    (image: ImageItem | null) => {
      setSelectedImage((prev) => (image && prev?.id === image.id ? null : image));
      onSelectImage?.(image);
    },
    [onSelectImage]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleSelectImage(images[index]);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        setImages((prev) => prev.filter((_, i) => i !== index));
        if (selectedImage?.id === images[index]?.id) {
          setSelectedImage(null);
        }
      } else if (e.key === "ArrowRight" && index < images.length - 1) {
        document.getElementById(`image-${index + 1}`)?.focus();
      } else if (e.key === "ArrowLeft" && index > 0) {
        document.getElementById(`image-${index - 1}`)?.focus();
      } else if (e.key === "ArrowDown" && index < images.length - (configState.grid?.columns || 3)) {
        document.getElementById(`image-${index + (configState.grid?.columns || 3)}`)?.focus();
      } else if (e.key === "ArrowUp" && index >= (configState.grid?.columns || 3)) {
        document.getElementById(`image-${index - (configState.grid?.columns || 3)}`)?.focus();
      }
    },
    [images, selectedImage, configState.grid?.columns, onSelectImage, handleSelectImage]
  );

  const handleSave = useCallback(async () => {
    const saveData: ImageConfig = {
      ...configState,
      images,
    };
    try {
      await onSave?.(saveData);
      onUpdateConfig?.(saveData);
    } catch (error) {
      console.error("Failed to save configuration:", error);
    }
  }, [configState, images, onSave, onUpdateConfig]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }, []);

  const addFileAsImage = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const img = new window.Image();
        img.onload = () => {
          const newImage: ImageItem = {
            id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            src: event.target?.result as string,
            alt: file.name.replace(/\.[^/.]+$/, ""),
            width: img.width,
            height: img.height,
            x: 0,
            y: 0,
            w: 0,
            h: 0,
            hAlign: "center",
            vAlign: "middle",
            caption: "",
            layout: "default",
            size: "medium",
            aspectRatio: img.width / img.height,
            rowSpan: 1,
            colSpan: 1,
            radius: "md",
            shadow: "md",
          };
          setImages((prev) => [...prev, newImage]);
        };
        img.src = event.target.result as string;
      }
    };
    reader.onerror = () => {
      console.error("Error reading file");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      addFileAsImage(files[i]);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      addFileAsImage(files[i]);
    }
    // Reset file input
    if (e.target) e.target.value = "";
  }, []);

  const toggleConfigPanel = useCallback(() => {
    setIsConfigPanelOpen((prev) => !prev);
  }, []);

  const moveImage = useCallback((fromIndex: number, toIndex: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      const [movedItem] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedItem);
      return newImages;
    });
  }, []);

  const handleImageClick = useCallback(
    (e: React.MouseEvent, idx: number) => {
      e.preventDefault();
      handleSelectImage(images[idx]);
    },
    [images, handleSelectImage]
  );

  const updateImage = (id: string, updates: Partial<ImageItem>) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, ...updates } : img)));
  };

  const renderGrid = useCallback(() => {
    const gridClass = {
      grid: `grid w-full transition-colors`,
      list: `flex flex-col w-full gap-4`,
      masonry: `columns-${configState.grid.columns} w-full gap-4`,
      absolute: `relative w-full h-screen`
    }[currentView];

    const itemClass = {
      grid: "",
      list: "w-full",
      masonry: "break-inside-avoid mb-4",
      absolute: "absolute"
    }[currentView];

    return (
      <div
        className={gridClass}
        style={currentView === "grid" ? {
          gridTemplateColumns: `repeat(${configState.grid.columns}, minmax(0, 1fr))`,
          gap: `${configState.grid.gap}px`,
        } : currentView === "absolute" ? {
          height: "100vh",
          position: "relative"
        } : undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {images.map((img, idx) => (
          <div
            key={img.id}
            id={`image-${idx}`}
            className={`relative outline-none ${isDraggingOver ? "ring-2 ring-blue-400/40 rounded-lg" : ""} ${itemClass}`}
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e as any, idx)}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <DraggableImage
              image={img}
              index={idx}
              onMove={moveImage}
              onClick={handleImageClick}
              onRemove={(id) => setImages((prev) => prev.filter((i) => i.id !== id))}
              onConfigChange={updateImage}
              grid={configState.grid}
              view={currentView}
            />
          </div>
        ))}
      </div>
    );
  }, [images, configState.grid, currentView, isDraggingOver, handleDragOver, handleDragLeave, handleDrop, moveImage, handleImageClick, handleKeyDown]);

  return (
    <div
      className={`relative ${className} ${isDraggingOver ? "bg-blue-50/50" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <DndProvider backend={HTML5Backend}>
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 transition-colors shadow-sm">
              <FiUpload className="mr-2" />
              Upload Images
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
            </label>

            <button 
              className="px-4 py-2 bg-white text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <FiPlus />
              Add
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 bg-white text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm flex items-center gap-2"
              onClick={toggleConfigPanel}
            >
              <FiSettings />
              Configure
            </button>
            <button
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
              onClick={handleSave}
            >
              <FiSave />
              Save
            </button>
          </div>
        </div>

        {/* View toggle buttons */}
        <div className="mb-4 flex items-center gap-2">
          <button
            className={currentView === "grid" ? activeViewButton : viewButton}
            onClick={() => setCurrentView("grid")}
            title="Grid view"
          >
            <FiGrid />
          </button>
          <button
            className={currentView === "list" ? activeViewButton : viewButton}
            onClick={() => setCurrentView("list")}
            title="List view"
          >
            <FiList />
          </button>
          <button
            className={currentView === "masonry" ? activeViewButton : viewButton}
            onClick={() => setCurrentView("masonry")}
            title="Masonry view"
          >
            <FiColumns />
          </button>
          <button
            className={currentView === "absolute" ? activeViewButton : viewButton}
            onClick={() => setCurrentView("absolute")}
            title="Absolute layout"
          >
            <FiLayout />
          </button>
        </div>

        {renderGrid()}
      </DndProvider>

      {isConfigPanelOpen && (
        <div className={panelClass}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FiImage /> Gallery Configuration
            </h3>
            <button onClick={toggleConfigPanel} className="text-gray-500 hover:text-gray-700">
              <FiX size={22} />
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block mb-1 font-medium">Columns</label>
              <input
                type="number"
                min={1}
                max={12}
                value={configState.grid.columns}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    grid: { ...prev.grid, columns: Math.max(1, Math.min(12, parseInt(e.target.value || "1"))) },
                  }))
                }
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Row Height (px)</label>
              <input
                type="number"
                min={80}
                max={800}
                value={configState.grid.rowHeight}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    grid: { ...prev.grid, rowHeight: Math.max(80, Math.min(800, parseInt(e.target.value || "220"))) },
                  }))
                }
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Gap (px)</label>
              <input
                type="number"
                min={0}
                max={64}
                value={configState.grid.gap}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    grid: { ...prev.grid, gap: Math.max(0, Math.min(64, parseInt(e.target.value || "16"))) },
                  }))
                }
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <FiType /> Selected Image
              </h4>
              {!selectedImage ? (
                <div className="text-gray-500 text-sm">No image selected</div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Alt text</label>
                    <input
                      value={selectedImage.alt}
                      onChange={(e) => {
                        const v = e.target.value;
                        setImages((prev) => prev.map((img) => (img.id === selectedImage.id ? { ...img, alt: v } : img)));
                        setSelectedImage((s) => (s ? { ...s, alt: v } : s));
                      }}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Caption</label>
                    <input
                      value={selectedImage.caption}
                      onChange={(e) => {
                        const v = e.target.value;
                        setImages((prev) => prev.map((img) => (img.id === selectedImage.id ? { ...img, caption: v } : img)));
                        setSelectedImage((s) => (s ? { ...s, caption: v } : s));
                      }}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm mb-1">Border radius</label>
                      <select
                        value={selectedImage.radius || "md"}
                        onChange={(e) => {
                          const v = e.target.value as ImageItem["radius"];
                          updateSelected("radius", v);
                        }}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="none">None</option>
                        <option value="sm">Small</option>
                        <option value="md">Medium</option>
                        <option value="lg">Large</option>
                        <option value="xl">XL</option>
                        <option value="full">Full</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm mb-1">Shadow</label>
                      <select
                        value={selectedImage.shadow || "md"}
                        onChange={(e) => {
                          const v = e.target.value as ImageItem["shadow"];
                          updateSelected("shadow", v);
                        }}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="none">None</option>
                        <option value="sm">Small</option>
                        <option value="md">Medium</option>
                        <option value="lg">Large</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm mb-1">Width (cols)</label>
                      <input
                        type="number"
                        min={1}
                        max={configState.grid.columns}
                        value={selectedImage.colSpan || 1}
                        onChange={(e) => {
                          const v = Math.max(1, Math.min(configState.grid.columns, parseInt(e.target.value || "1")));
                          updateSelected("colSpan", v);
                        }}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Height (rows)</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={selectedImage.rowSpan || 1}
                        onChange={(e) => {
                          const v = Math.max(1, Math.min(20, parseInt(e.target.value || "1")));
                          updateSelected("rowSpan", v);
                        }}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Layout</label>
                    <select
                      value={selectedImage.layout}
                      onChange={(e) => updateSelected("layout", e.target.value as ImageLayout)}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="default">Default</option>
                      <option value="rounded">Rounded</option>
                      <option value="circle">Circle</option>
                      <option value="full">Full width</option>
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                      <option value="grid">Grid-fit</option>
                      <option value="top-center">Top Center</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-right">Bottom Right</option>
                      <option value="half-left">Half Left</option>
                      <option value="half-right">Half Right</option>
                      <option value="quarter-top-left">Quarter Top Left</option>
                      <option value="quarter-top-right">Quarter Top Right</option>
                      <option value="quarter-bottom-left">Quarter Bottom Left</option>
                      <option value="quarter-bottom-right">Quarter Bottom Right</option>
                      <option value="absolute">Absolute Position</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Fit Mode</label>
                    <select
                      value={selectedImage.fit || "cover"}
                      onChange={(e) => updateSelected("fit", e.target.value as ImageFit)}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="fill">Fill</option>
                      <option value="cover">Cover</option>
                      <option value="contain">Contain</option>
                      <option value="scale-down">Scale Down</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;