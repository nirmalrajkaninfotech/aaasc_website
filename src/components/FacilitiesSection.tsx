'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { FacilitiesSection as FacilitiesSectionType } from '@/types';

interface FacilitiesSectionProps {
  facilities: FacilitiesSectionType;
}

export default function FacilitiesSection({ facilities }: FacilitiesSectionProps) {
  const publishedItems = facilities.items
    .filter(item => item.published)
    .sort((a, b) => a.order - b.order);

  if (publishedItems.length === 0) {
    return null;
  }

  // Build category list and active filter
  const categories = useMemo(() => {
    const unique = Array.from(new Set(publishedItems.map(f => f.category)));
    return ['All', ...unique];
  }, [publishedItems]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const visibleItems = useMemo(
    () => (activeCategory === 'All' ? publishedItems : publishedItems.filter(f => f.category === activeCategory)),
    [activeCategory, publishedItems]
  );

  const [activeFacilityId, setActiveFacilityId] = useState<string | null>(null);
  const activeFacility = useMemo(() => visibleItems.find(f => f.id === activeFacilityId) || publishedItems.find(f => f.id === activeFacilityId) || null, [activeFacilityId, visibleItems, publishedItems]);

  const getPreviewText = (html: string, maxChars = 220): string => {
    const tmp = typeof window !== 'undefined' ? document.createElement('div') : null;
    if (!tmp) return '';
    tmp.innerHTML = html || '';
    const text = tmp.textContent || tmp.innerText || '';
    return text.length > maxChars ? text.slice(0, maxChars).trimEnd() + '…' : text;
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Facilities
          </h2>
          <p className="text-xl text-gray-600">

          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`${activeCategory === category ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'} px-6 py-2 rounded-full hover:bg-blue-700 hover:text-white transition-colors duration-200`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Facilities Grid (filtered by category) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleItems.map((facility) => (
            <div
              key={facility.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => setActiveFacilityId(facility.id)}
            >
              {(facility.gallery && facility.gallery.length > 0) ? (
                <div className="relative h-48">
                  <Image src={facility.gallery[0]} alt={facility.name} fill className="object-cover" />
                  <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">{facility.category}</div>
                  {facility.gallery.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      +{facility.gallery.length - 1} more
                    </div>
                  )}
                </div>
              ) : facility.image ? (
                <div className="relative h-48">
                  <Image src={facility.image} alt={facility.name} fill className="object-cover" />
                  <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">{facility.category}</div>
                </div>
              ) : null}
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {facility.name}
                </h3>
                
                <p className="text-gray-700 mb-4">
                  {getPreviewText(facility.description)}
                </p>
                
                {facility.features && facility.features.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800 text-sm">Key Features:</h4>
                    <ul className="space-y-1">
                      {facility.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                          {feature}
                        </li>
                      ))}
                      {facility.features.length > 3 && (
                        <li className="text-sm text-gray-500 italic">+{facility.features.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="mt-4">
                  <Link
                    href={`/facilities/${encodeURIComponent(facility.id)}`}
                    className="inline-flex items-center text-blue-700 hover:text-blue-900 font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View full details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for facility details */}
        {activeFacility && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/60" onClick={() => setActiveFacilityId(null)} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <h3 className="text-xl font-semibold text-gray-800">{activeFacility.name}</h3>
                  <button aria-label="Close" onClick={() => setActiveFacilityId(null)} className="text-gray-500 hover:text-gray-800">✕</button>
                </div>
                {activeFacility.image && (
                  <div className="relative w-full h-64 bg-gray-100">
                    <Image src={activeFacility.image} alt={activeFacility.name} fill className="object-cover" />
                    <span className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">{activeFacility.category}</span>
                  </div>
                )}
                <div className="px-6 py-5 space-y-4">
                  <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: activeFacility.description }} />
                  {activeFacility.features && activeFacility.features.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Key Features</h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeFacility.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-center">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}