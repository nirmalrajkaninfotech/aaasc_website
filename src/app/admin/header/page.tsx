'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header3 from '@/components/Header3';
import { Header3Content } from '@/types/header3';

// This page should not be statically generated
export const dynamic = 'force-dynamic';

export default function AdminHeaderPage() {
  const router = useRouter();
  
  // In production, redirect to admin login
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      router.push('/admin/login');
    }
  }, [router]);
  
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h1>
          <p className="text-gray-600">Please log in to access the admin panel.</p>
        </div>
      </div>
    );
  }
  const [content, setContent] = useState<Header3Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHeaderContent = async () => {
      try {
        const response = await fetch('/api/header3', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to fetch header content');
        const data = await response.json();
        setContent(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeaderContent();
  }, []);

  const handleSave = async (updatedContent: Header3Content) => {
    try {
      const response = await fetch('/api/header3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedContent),
        cache: 'no-store'
      });

      if (!response.ok) throw new Error('Failed to save header content');
      
      const savedContent = await response.json();
      setContent(savedContent);
      return true;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Failed to load header content</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Header Management</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <Header3 
          isAdmin={true} 
          initialContent={content} 
          onSave={handleSave} 
        />
      </div>
    </div>
  );
}
