import React from 'react';
import Image from 'next/image';

interface GalleryItem {
  id: string;
  image: string;
  title?: string;
  description?: string;
  order?: number;
  published?: boolean;
}

interface GallerySectionProps {
  items: GalleryItem[];
}

const GallerySection: React.FC<GallerySectionProps> = ({ items }) => {
  const publishedItems = (items || []).filter(item => item.published !== false);
  if (publishedItems.length === 0) {
    return (
      <section className="py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Gallery</h2>
          <p className="text-gray-500">No images available.</p>
        </div>
      </section>
    );
  }
  return (
    <section className="py-12">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center"></h2>
        <div className="flex flex-wrap justify-center items-center gap-8">
          {publishedItems.map(item => (
            <div key={item.id} className="flex flex-col items-center w-full max-w-5xl mx-auto bg-white rounded shadow-lg overflow-hidden">
              <div className="relative w-full" style={{ aspectRatio: '16/9', minHeight: 500 }}>
                <Image
                  src={item.image}
                  alt={item.title || ''}
                  fill
                  className="object-contain"
                  unoptimized={process.env.NODE_ENV !== 'production'}
                />
              </div>
              <div className="p-4 w-full text-center">
                {item.title && <h3 className="font-semibold text-lg mb-1">{item.title}</h3>}
                {item.description && <p className="text-gray-600 text-sm">{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
