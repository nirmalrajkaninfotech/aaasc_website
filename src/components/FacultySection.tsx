'use client';

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { FacultySection as FacultySectionType } from '@/types';
import { getImageUrl } from '@/config';

interface FacultySectionProps {
  faculty: FacultySectionType;
}

export default function FacultySection({ faculty }: FacultySectionProps) {
  // Defensive default for items array
  const items = useMemo(
    () =>
      Array.isArray(faculty?.items)
        ? faculty.items
            .filter((i) => i.published)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        : [],
    [faculty?.items]
  );

  // Initial tab selection: always first available item, even when items change
  const [activeId, setActiveId] = useState<string>('');
  useEffect(() => {
    if (items.length > 0 && !items.find((i) => i.id === activeId)) {
      setActiveId(items[0].id);
    }
  }, [items, activeId]);

  const activeItem = useMemo(
    () => items.find((i) => i.id === activeId) ?? items[0],
    [items, activeId]
  );

  if (items.length === 0)
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">No faculty information available.</p>
        </div>
      </section>
    );

  // Get images array (always an array for mapping)
  const gallery =
    activeItem?.images && activeItem.images.length > 0
      ? activeItem.images
      : activeItem?.image
      ? [{ url: activeItem.image }]
      : [];

  return (
    <section className="py-8 sm:py-16 bg-gray-50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-base sm:text-xl text-gray-600">
            {faculty.subtitle ?? 'Explore departments and staff information'}
          </p>
        </div>

        {/* Department tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-10 overflow-x-auto py-2 px-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveId(item.id)}
              className={`px-4 py-1.5 sm:px-6 sm:py-2 rounded-full text-sm sm:text-base transition-all ${
                activeId === item.id
                  ? 'bg-blue-700 text-white shadow-md'
                  : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* Detail view */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg overflow-hidden flex flex-col lg:flex-row">
          {/* Left info */}
          <div className="lg:w-1/3 p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-blue-50/10 flex flex-col items-center text-center gap-3 min-h-64">
            {activeItem?.subtitle && (
              <div className="text-sm sm:text-base font-semibold text-blue-700 mb-1 sm:mb-2">
                {activeItem.subtitle}
              </div>
            )}
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 text-center mx-auto">
              {activeItem?.title}
            </h3>
            <div
              className="text-sm sm:text-base text-gray-700 leading-relaxed max-w-lg"
              style={{ wordBreak: 'break-word' }}
              dangerouslySetInnerHTML={{ __html: activeItem?.content ?? '' }}
            />
          </div>

          {/* Right gallery */}
          <div className="lg:w-2/3 p-6">
            {gallery.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 items-start gap-4">
                {gallery.map((img, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center">
                    {/* Square thumbnails with top focus to keep heads visible */}
                    <div className="relative w-32 h-44 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                      <Image
                        src={getImageUrl(img.url)}
                        alt={img.caption || activeItem?.title || 'Faculty image'}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 40vw, 300px"
                      />
                    </div>
                    <div className="mt-3 w-32 flex flex-col items-center text-center space-y-1">
                      <div className="h-[2.75rem] flex items-end text-xs sm:text-sm font-semibold text-gray-900 leading-snug break-words overflow-hidden text-center">
                        {img.caption}
                      </div>
                      <div className="h-[2rem] text-[11px] sm:text-xs text-gray-700 leading-snug break-words overflow-hidden">
                        {img.subtitle}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">No images available</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
