'use client';

import { useState } from 'react';
import { HomepageSection } from '@/types';

interface SortableSectionProps {
  sections: HomepageSection[];
  onSectionsChange: (sections: HomepageSection[]) => void;
}

export default function SortableSection({ sections, onSectionsChange }: SortableSectionProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedItem(sectionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null);
      return;
    }

    const draggedIndex = sections.findIndex(s => s.id === draggedItem);
    const targetIndex = sections.findIndex(s => s.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }

    const newSections = [...sections];
    const [draggedSection] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, draggedSection);

    // Update order numbers
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index + 1
    }));

    onSectionsChange(updatedSections);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const toggleSection = (sectionId: string) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId
        ? { ...section, enabled: !section.enabled }
        : section
    );
    onSectionsChange(updatedSections);
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 mb-4">
        Drag and drop to reorder sections. Toggle switches to show/hide sections on homepage.
      </div>
      
      {sortedSections.map((section) => (
        <div
          key={section.id}
          draggable
          onDragStart={(e) => handleDragStart(e, section.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, section.id)}
          onDragEnd={handleDragEnd}
          className={`flex items-center justify-between p-4 bg-white border rounded-lg cursor-move transition-all duration-200 ${
            draggedItem === section.id
              ? 'opacity-50 scale-95'
              : 'hover:shadow-md'
          } ${
            section.enabled
              ? 'border-gray-200'
              : 'border-gray-100 bg-gray-50'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="flex flex-col space-y-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
            
            <div>
              <h3 className={`font-medium ${
                section.enabled ? 'text-gray-800' : 'text-gray-500'
              }`}>
                {section.name}
              </h3>
              <p className="text-sm text-gray-500">
                Order: {section.order}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className={`text-sm ${
              section.enabled ? 'text-green-600' : 'text-gray-500'
            }`}>
              {section.enabled ? 'Visible' : 'Hidden'}
            </span>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={section.enabled}
                onChange={() => toggleSection(section.id)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}