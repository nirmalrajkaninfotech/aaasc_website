import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Collage } from '@/types';

// Add revalidation to the page
export const revalidate = 3600; // Revalidate this page every hour

// This function generates static params at build time
export async function generateStaticParams() {
  // For static export, we need to return at least one valid path
  // If the API is not available during build, return a default path
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/collages`, {
      cache: 'no-store',
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!res.ok) {
      console.error('Failed to fetch collages for static params:', res.status, res.statusText);
      // Return a default path to prevent build failure
      return [{ id: '1' }];
    }
    
    const collages = await res.json();
    
    if (!Array.isArray(collages) || collages.length === 0) {
      console.error('No collages found or invalid response format');
      return [{ id: '1' }];
    }
    
    // Return all collages as static params
    return collages.map((collage: { id: number | string }) => ({
      id: collage.id.toString(),
    }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    // Return a default path to prevent build failure
    return [{ id: '1' }];
  }
}

async function getCollage(id: string): Promise<Collage | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/collages/${id}`, {
      cache: 'no-store',
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch collage ${id}:`, res.status, res.statusText);
      return null;
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Error fetching collage ${id}:`, error);
    return null;
  }
}

export default async function CollageDetailPage({ params }: { params: { id: string } }) {
  const collage = await getCollage(params.id);
  
  if (!collage) {
    // If in production, show a fallback page instead of 404
    if (process.env.NODE_ENV === 'production') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Gallery Item Not Available</h1>
            <p className="text-gray-600 mb-6">The requested gallery item could not be loaded. It may have been moved or deleted.</p>
            <Link 
              href="/gallery"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Gallery
            </Link>
          </div>
        </div>
      );
    }
    notFound();
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <main className="flex-1 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/gallery"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Gallery
          </Link>
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-wrap items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-800 mb-3">{collage.title}</h1>
              
              {/* Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium mb-1">Category</div>
                  <div className="text-lg font-semibold text-blue-800">{collage.category}</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium mb-1">Date</div>
                  <div className="text-lg font-semibold text-green-800">{formatDate(collage.date)}</div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium mb-1">Images</div>
                  <div className="text-lg font-semibold text-purple-800">{collage.images.length} photo{collage.images.length !== 1 ? 's' : ''}</div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm text-orange-600 font-medium mb-1">Status</div>
                  <div className="text-lg font-semibold text-orange-800">
                    {collage.featured ? 'Featured' : 'Standard'}
                  </div>
                </div>
              </div>
              
              {/* Featured Badge */}
              {collage.featured && (
                <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Featured Collection
                </div>
              )}
            </div>
          </div>
          
          {/* Description */}
          {collage.description && (
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Description</h3>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                  {collage.description.replace(/#\w+\s*/g, '')}
                </p>
              </div>
            </div>
          )}

          {/* Tags - Removed */}
        </div>

        {/* Main Image Display */}
        {collage.images.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Main Image</h3>
              <span className="text-sm text-gray-500">
                1 of {collage.images.length}
              </span>
            </div>
            
            <div className="relative w-full h-96 md:h-[500px] rounded-lg overflow-hidden mb-6">
              <Image
                src={collage.images[0]}
                alt={collage.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Thumbnail Grid */}
            {collage.images.length > 1 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">All Images ({collage.images.length})</h3>
            <div className="grid grid-cols-4 gap-2 mt-4">
              {collage.images.map((image, index) => (
                <div key={index} className="relative w-full aspect-square rounded overflow-hidden">
                  <Image
                    src={image}
                    alt={`${collage.title} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

          </div>
        )}

        {/* Additional Info Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Collection Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Collection ID</h4>
              <p className="text-gray-900">#{collage.id}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Created Date</h4>
              <p className="text-gray-900">{formatDate(collage.date)}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Category</h4>
              <p className="text-gray-900">{collage.category}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Total Images</h4>
              <p className="text-gray-900">{collage.images.length} photo{collage.images.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
