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
      setActiveId(items.id);
    }
  }, [items, activeId]);

  const activeItem = useMemo(
    () => items.find((i) => i.id === activeId) ?? items,
    [items, activeId]
  );

  if (items.length === 0)
    return (
      <section className="py-16">
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
    <section className="py-16">
      <div className="container mx-auto px-1">
        <div className="text-center mb-12">
        
          <p className="text-xl text-gray-600">
            {faculty.subtitle ?? 'Explore departments and staff information'}
          </p>
        </div>

        {/* Department tabs/chips */}
        <div
          className="relative z-10 flex flex-wrap justify-center gap-4 mb-10 pointer-events-auto"
          role="tablist"
        >
          {items.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setActiveId(item.id)}
              className={`px-6 py-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 ${
                activeId === item.id
                  ? 'bg-blue-700 text-white'
                  : 'bg-transparent text-blue-700 hover:bg-blue-50'
              }`}
              aria-selected={activeId === item.id}
              role="tab"
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* Detail view for selected department/staff */}
        <div
          className="flex flex-col md:flex-row items-stretch"
          role="tabpanel"
          aria-labelledby={`tab-${activeItem?.id ?? ''}`}
        >
          {/* Left: Basic info/description */}
          <div className="md:w-1/3 flex flex-col justify-center p-6">
            {activeItem?.subtitle && (
              <div className="text-lg font-semibold text-blue-700 mb-2">
                {activeItem.subtitle}
              </div>
            )}
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              {activeItem?.title}
            </h3>
            <div
              className="text-sm text-gray-700 leading-relaxed prose max-w-none"
              dangerouslySetInnerHTML={{ __html: activeItem?.content ?? '' }}
            />
            {activeItem?.additionalInfo && (
              <div
                className="mt-4 text-xs text-gray-600 p-2"
                dangerouslySetInnerHTML={{
                  __html: activeItem.additionalInfo,
                }}
              />
            )}
          </div>

          {/* Right: Gallery of staff photos/images */}
          <div className="md:w-2/3 flex flex-wrap gap-6 p-6 items-center justify-center">
            {gallery.length > 0 ? (
              <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-6">
                {gallery.map((img, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center"
                  >
                    <div className="relative w-32 h-50 mb-2 bg-gray-100">
                      {img.url ? (
                        <Image
                          src={getImageUrl(img.url)}
                          alt={activeItem?.title ?? 'Image'}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, 160px"
                        />
                      ) : (
                        <div className="text-gray-400 text-xs flex items-center justify-center h-full">
                          No image
                        </div>
                      )}
                    </div>
                    {img.caption && (
                      <div className="text-sm font-medium text-gray-800 text-center mt-1">
                        {img.caption}
                      </div>
                    )}
                    {img.subtitle && (
                      <div className="text-xs text-gray-600 text-center">
                        {img.subtitle}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center w-full py-8">
                No images available for this department.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
