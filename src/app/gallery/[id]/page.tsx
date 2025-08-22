'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Collage } from '@/types';

export default function CollageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [collage, setCollage] = useState<Collage | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchCollage();
    }
  }, [params.id]);

  const fetchCollage = async () => {
    try {
      const response = await fetch(`/api/collages/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setCollage(data);
      } else {
        console.error('Failed to fetch collage');
        router.push('/gallery');
      }
    } catch (error) {
      console.error('Error fetching collage:', error);
      router.push('/gallery');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!collage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Collage not found</div>
      </div>
    );
  }

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
                {selectedImage + 1} of {collage.images.length}
              </span>
            </div>
            
            <div className="relative w-full" style={{ aspectRatio: '16/9', minHeight: 500 }}>
              <Image
                src={collage.images[selectedImage]}
                alt={`${collage.title} - Image ${selectedImage + 1}`}
                fill
                className="object-contain rounded-lg"
                unoptimized={process.env.NODE_ENV !== 'production'}
              />
            </div>
            
            {/* Image Navigation */}
            {collage.images.length > 1 && (
              <div className="mt-6">
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : collage.images.length - 1)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                    disabled={collage.images.length <= 1}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  
                  <button
                    onClick={() => setSelectedImage(prev => prev < collage.images.length - 1 ? prev + 1 : 0)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                    disabled={collage.images.length <= 1}
                  >
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Thumbnail Grid */}
        {collage.images.length > 1 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">All Images ({collage.images.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {collage.images.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                    selectedImage === index ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${collage.title} - Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized={process.env.NODE_ENV !== 'production'}
                  />
                  {/* Image number overlay */}
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
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
