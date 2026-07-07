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
    <Link href={`/collage/${collage.id}`}>
      <div className="bg-[var(--theme-bg-card)] rounded-lg shadow-md overflow-hidden hover:shadow-lg hover:border-blue-400 border border-transparent transition-all duration-300 cursor-pointer flex flex-col h-full min-h-[370px]">
        <div className="aspect-video relative bg-gray-200">
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
            <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Featured
            </div>
          )}
          <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            {collage.category}
          </div>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-2 line-clamp-2">
            {collage.title}
          </h3>
          {collage.description && (
            <p className="text-sm text-[var(--theme-text-secondary)] mb-3 line-clamp-2">
              {collage.description}
            </p>
          )}
          <div className="flex justify-between items-center text-sm text-[var(--theme-text-secondary)] mt-auto">
            <span>{collage.images.length} image{collage.images.length !== 1 ? 's' : ''}</span>
            <span>{formatDate(collage.date)}</span>
          </div>
          {collage.tags && collage.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {collage.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)] px-2 py-1 rounded text-xs"
                >
                  #{tag}
                </span>
              ))}
              {collage.tags.length > 3 && (
                <span className="text-gray-400 text-xs">+{collage.tags.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}