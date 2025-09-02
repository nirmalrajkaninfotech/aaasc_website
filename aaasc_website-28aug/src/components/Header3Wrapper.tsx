'use client';

import { useState, useEffect } from 'react';
import Header3 from './Header3';
import { Header3Content } from '@/types/header3';

export default function Header3Wrapper({ isAdmin = false }) {
  const [content, setContent] = useState<Header3Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHeaderContent = async () => {
      try {
        const response = await fetch('/api/header3');
        const data = await response.json();
        setContent(data);
      } catch (error) {
        console.error('Error fetching header content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeaderContent();
  }, []);

  const handleSave = async (updatedContent: Header3Content) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/header3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedContent),
        cache: 'no-store' // Prevent caching
      });

      if (!response.ok) {
        throw new Error('Failed to save header content');
      }

      // Fetch the latest data from the server to ensure consistency
      const savedContent = await response.json();
      setContent(savedContent);
      return true;
    } catch (error) {
      console.error('Error saving header content:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="w-full h-16 bg-gray-200 animate-pulse"></div>;
  }

  if (!content) {
    return null;
  }

  return (
    <Header3 
      isAdmin={isAdmin} 
      initialContent={content} 
      onSave={isAdmin ? handleSave : undefined} 
    />
  );
}
