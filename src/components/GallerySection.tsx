import React from 'react';
import Image from 'next/image';
import { GalleryItem, GallerySectionProps } from '@/types/gallery';

const GallerySection: React.FC<GallerySectionProps> = ({ 
  items = [], 
  title = 'Our Gallery',
  subtitle = 'Capturing the best moments from our college'
}) => {
  // Filter out unpublished items and sort by order
  const publishedItems = items
    .filter(item => item.published !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (publishedItems.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-2 text-gray-800">{title}</h2>
          {subtitle && <p className="text-gray-600 mb-6">{subtitle}</p>}
          <p className="text-gray-500">No gallery items available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">{title}</h2>
          {subtitle && <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publishedItems.map((item) => (
            <div 
              key={item.id} 
              className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative w-full h-64">
                <Image
                  src={item.images?.[0] || '/placeholder-image.jpg'}
                  alt={item.title}
                  fill
                  className="object-cover"
                  unoptimized={process.env.NODE_ENV !== 'production'}
                />
                {item.tags && item.tags.length > 0 && (
                  <div className="absolute top-2 right-2 flex flex-wrap gap-1">
                    {item.tags.slice(0, 2).map((tag, idx) => (
                      <span 
                        key={idx}
                        className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                  <span>{item.category}</span>
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
