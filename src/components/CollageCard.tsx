'use client';

import Link from 'next/link';
import Image from 'next/image';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
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
    <Link href={`/gallery/${collage.id}`} className="block h-full group relative">
      <div className="h-full flex flex-col bg-white/95 dark:bg-gray-800/95 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-500/30 transition-all duration-500 group-hover:-translate-y-1">
        {/* Image Container */}
        <div className="aspect-video relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
          {collage.images.length > 0 ? (
            <div className="relative w-full h-full">
              <Image
                src={collage.images[0].startsWith('/') ? collage.images[0] : `/${collage.images[0]}`}
                alt={collage.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
                unoptimized={process.env.NODE_ENV !== 'production'}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Hover content */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 dark:bg-gray-900/90 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  View Collection →
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between">
            <span className="bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium shadow-md">
              {collage.category}
            </span>
            {collage.featured && (
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                Featured
              </span>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5 flex flex-col flex-1 bg-white/80 dark:bg-gray-800/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {collage.title}
          </h3>
          
          {collage.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
              {collage.description.replace(/#\w+\s*/g, '')}
            </p>
          )}
          
          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50 flex justify-between items-center">
            <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400 font-medium">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              {collage.images.length} {collage.images.length === 1 ? 'Image' : 'Images'}
            </span>
            
            <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              {formatDate(collage.date)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}