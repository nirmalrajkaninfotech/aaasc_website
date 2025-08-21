'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Collage } from '@/types';

interface CollageCardProps {
  collage: Collage;
}

export default function CollageCard({ collage }: CollageCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="h-full flex flex-col bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-400 border border-white/50 transition-all duration-300">
        <div className="aspect-video relative bg-gray-100/50">
          {collage.images.length > 0 ? (
            <Image
              src={collage.images[0]}
              alt={collage.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No Image
            </div>
          )}
          {collage.featured && (
            <div className="absolute top-3 right-3 bg-yellow-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
              Featured
            </div>
          )}
          <div className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
            {collage.category}
          </div>
        </div>
        <div className="p-4 flex flex-col flex-1 bg-white/30">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {collage.title}
          </h3>
          {collage.description && (
            <p className="text-sm text-gray-600 mb-3">
              {collage.description}
            </p>
          )}
          <div className="flex justify-between items-center text-sm text-gray-500 mt-4">
            <span className="inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {collage.images.length} image{collage.images.length !== 1 ? 's' : ''}
            </span>
            <span className="inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(collage.date)}
            </span>
          </div>
        </div>
      </div>
  );
}