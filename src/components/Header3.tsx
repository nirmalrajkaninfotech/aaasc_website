'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Header3Content, defaultHeader3Content } from '@/types/header3';

interface Header3Props {
  isAdmin?: boolean;
  onSave?: (content: Header3Content) => Promise<boolean> | Promise<void> | void;
  initialContent?: Header3Content;
}

export default function Header3({ 
  isAdmin = false, 
  onSave,
  initialContent = defaultHeader3Content 
}: Header3Props) {
  const [content, setContent] = useState<Header3Content>(initialContent);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!onSave) return;
    
    setIsLoading(true);
    try {
      await onSave({
        ...content,
        updatedAt: new Date().toISOString()
      });
      
      // If we get here, save was successful
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save header content:', error);
      // Reset to initial content on error
      setContent(initialContent);
    } finally {
      setIsLoading(false);
    }
  };

  if (!content) return null;

  return (
    <header className="relative w-full">
      {/* Header Image */}
      <div className="relative w-full h-64 md:h-96 overflow-hidden">
        <Image
          src={content.imageUrl}
          alt={content.title}
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white px-4">
            {isEditing ? (
              <input
                type="text"
                value={content.title}
                onChange={(e) => setContent({...content, title: e.target.value})}
                className="text-3xl md:text-5xl font-bold bg-white bg-opacity-20 p-2 rounded w-full max-w-2xl text-center"
              />
            ) : (
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                {content.title}
              </h1>
            )}
            {isEditing ? (
              <input
                type="text"
                value={content.subtitle}
                onChange={(e) => setContent({...content, subtitle: e.target.value})}
                className="text-xl md:text-2xl bg-white bg-opacity-20 p-2 rounded w-full max-w-2xl text-center"
              />
            ) : (
              <p className="text-xl md:text-2xl">{content.subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="bg-gray-100 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h3 className="text-lg font-semibold">Header Settings</h3>
            {isEditing ? (
              <div className="space-x-2">
                <button
                  onClick={() => {
                    setContent(initialContent);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-200"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit Header
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
