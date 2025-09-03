'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Collage, SiteSettings } from '@/types';
import { API_BASE_URL } from '@/lib/api-utils';
import Image from 'next/image';
import Link from 'next/link';
import UpscrollButton from '@/components/UpscrollButton';

const apiurl = API_BASE_URL;

export default function GalleryItemPage() {
  const params = useParams();
  const [collage, setCollage] = useState<Collage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollageDetails = async () => {
      try {
        const response = await fetch(`${apiurl}/api/collages/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch gallery item');
        }
        
        const data = await response.json();
        setCollage(data);
      } catch (err) {
        console.error('Error fetching gallery item:', err);
        setError('Failed to load gallery item');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCollageDetails();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
        <Link href="/gallery" className="ml-4 underline">
          Go back to Gallery
        </Link>
      </div>
    );
  }

  if (!collage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">No gallery item found</div>
        <Link href="/gallery" className="ml-4 underline">
          Go back to Gallery
        </Link>
      </div>
    );
  }

  return (
    <main className="flex-1 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
          <div className="relative w-full h-[500px] mb-6">
            <Image 
              src={collage.image} 
              alt={collage.title} 
              fill 
              className="object-cover rounded-lg" 
              priority 
            />
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">{collage.title}</h1>
            {collage.description && (
              <p className="text-gray-600 mb-6">{collage.description}</p>
            )}
            
            <div className="flex justify-center space-x-4">
              <Link 
                href="/gallery" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Return to Gallery
              </Link>
            </div>
          </div>
        </div>
      </div>
      <UpscrollButton />
    </main>
  );
}
