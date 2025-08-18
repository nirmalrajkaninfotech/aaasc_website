'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableNavItemProps {
  id: string;
  children: React.ReactNode;
  onRemove: () => void;
  onEdit: () => void;
}

export function SortableNavItem({ id, children, onRemove, onEdit }: SortableNavItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 'auto',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="flex items-center justify-between p-3 bg-white border rounded-md shadow-sm hover:shadow-md transition-shadow mb-2"
    >
      <div className="flex items-center">
        <button
          {...attributes}
          {...listeners}
          className="p-1 mr-2 text-gray-400 hover:text-gray-600 cursor-move"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        {children}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={onEdit}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          Edit
        </button>
        <button
          onClick={onRemove}
          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
