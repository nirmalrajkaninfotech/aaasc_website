'use client';

import Image from 'next/image';
import { PlacementsSection as PlacementsSectionType } from '@/types';

interface PlacementsSectionProps {
  placements: PlacementsSectionType;
}

export default function PlacementsSection({ placements }: PlacementsSectionProps) {
  const publishedItems = placements.items
    .filter(item => item.published)
    .sort((a, b) => a.order - b.order);

  if (publishedItems.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            {placements.title}
          </h2>
          <p className="text-xl text-gray-600">
            {placements.subtitle}
          </p>
        </div>

        <div className="space-y-16">
          {publishedItems.map((item, index) => (
            <div
              key={item.id}
              className={`flex flex-col lg:flex-row items-center gap-8 ${
                item.alignment === 'right' || index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {item.image && (
                <div className="lg:w-1/2">
                  <div className="relative h-64 lg:h-80 rounded-lg overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
              
              <div className={`lg:w-1/2 ${
                item.alignment === 'center' ? 'text-center' : 
                item.alignment === 'right' ? 'text-right' : 'text-left'
              }`}>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {item.title}
                </h3>
                <div 
                  className="text-gray-600 prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}