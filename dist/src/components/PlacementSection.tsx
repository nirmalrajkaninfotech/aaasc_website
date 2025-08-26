import Image from 'next/image';
import { PlacementSection } from '@/types';
import { useState } from 'react';

const getImageUrl = (url: string) => {
  if (!url) return '';
  
  // If it's already a full URL, return as is
  if (url.startsWith('http')) return url;
  
  // Remove leading slash if present for consistent joining
  const cleanPath = url.startsWith('/') ? url.slice(1) : url;
  
  // In development, use the local API server
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:3001/${cleanPath}`;
  }
  
  // In production, use the production domain
  return `https://aaasc.edu.in/${cleanPath}`;
};

export default function PlacementSectionComponent({ placements }: { placements: PlacementSection }) {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  
  if (!placements) return <div className="p-8 text-center">No placement data found.</div>;

  const publishedItems = placements.items
    .filter(item => item.published !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const firstItem = publishedItems[0];
  const allImages: string[] = publishedItems.flatMap(i => i.images || []);
  const mainImage = allImages[0];
  const galleryImages = mainImage ? allImages.slice(1) : allImages;

  return (
    <section className="py-16 bg-green-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-800 mb-3">{placements.title}</h2>
          {placements.subtitle && (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">{placements.subtitle}</p>
          )}
        </div>

        {mainImage && (
          <div className="relative w-full max-w-4xl mx-auto aspect-[4/3] bg-gray-100 shadow-lg rounded-xl overflow-hidden ring-1 ring-black/5 transition-all duration-300 transform hover:shadow-2xl hover:-translate-y-1">
            <Image 
              src={getImageUrl(mainImage)} 
              alt={firstItem?.title || 'Placement'} 
              fill 
              className={`object-contain transition-opacity duration-300 ${
                loadedImages[mainImage] ? 'opacity-100' : 'opacity-0'
              }`}
              onLoadingComplete={() => setLoadedImages(prev => ({ ...prev, [mainImage]: true }))}
              unoptimized={process.env.NODE_ENV !== 'production'}
            />
            {!loadedImages[mainImage] && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse bg-gray-200 w-full h-full"></div>
              </div>
            )}
          </div>
        )}

        {firstItem?.content && (
          <div className="mt-8 max-w-5xl mx-auto">
            <div
              className="prose max-w-none prose-gray prose-lg text-justify leading-relaxed bg-white/80 backdrop-blur p-6 md:p-8 rounded-xl shadow-md ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-lg"
              dangerouslySetInnerHTML={{ __html: firstItem.content }}
            />
          </div>
        )}

        {galleryImages.length > 0 && (
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {galleryImages.map((img, idx) => (
              <div key={idx} className="group relative w-full aspect-[4/3] bg-gray-100 shadow-md rounded-lg overflow-hidden ring-1 ring-black/5 transition-all duration-300 transform hover:shadow-xl hover:-translate-y-1">
                <Image 
                  src={getImageUrl(img)} 
                  alt={`Placement image ${idx + 1}`} 
                  fill 
                  className={`object-cover transition-all duration-300 group-hover:scale-105 ${
                    loadedImages[img] ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoadingComplete={() => setLoadedImages(prev => ({ ...prev, [img]: true }))}
                  unoptimized={process.env.NODE_ENV !== 'production'}
                />
                {!loadedImages[img] && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-pulse bg-gray-200 w-full h-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {publishedItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">No placement items available.</div>
        )}
      </div>
    </section>
  );
}
