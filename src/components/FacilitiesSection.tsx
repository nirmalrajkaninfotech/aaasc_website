'use client';

import Image from 'next/image';
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

  // Group facilities by category
  const categorizedFacilities = publishedItems.reduce((acc, facility) => {
    if (!acc[facility.category]) {
      acc[facility.category] = [];
    }
    acc[facility.category].push(facility);
    return acc;
  }, {} as Record<string, typeof publishedItems>);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            {facilities.title}
          </h2>
          <p className="text-xl text-gray-600">
            {facilities.subtitle}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {Object.keys(categorizedFacilities).map((category) => (
            <button
              key={category}
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publishedItems.map((facility) => (
            <div
              key={facility.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {facility.image && (
                <div className="relative h-48">
                  <Image
                    src={facility.image}
                    alt={facility.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {facility.category}
                  </div>
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {facility.name}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {facility.description}
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
                        <li className="text-sm text-gray-500 italic">
                          +{facility.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Category Sections */}
        <div className="mt-16 space-y-12">
          {Object.entries(categorizedFacilities).map(([category, categoryFacilities]) => (
            <div key={category} className="bg-white rounded-lg p-8 shadow-md">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                {category} Facilities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categoryFacilities.map((facility) => (
                  <div key={facility.id} className="flex space-x-4">
                    {facility.image && (
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={facility.image}
                          alt={facility.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">
                        {facility.name}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {facility.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}