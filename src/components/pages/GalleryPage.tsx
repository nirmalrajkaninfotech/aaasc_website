'use client';

import { useState, useEffect } from 'react';
import CollageCard from '@/components/CollageCard';
import CategoryFilter from '@/components/CategoryFilter';
import { Collage, SiteSettings } from '@/types';
import { API_BASE_URL } from '@/lib/api-utils';
import UpscrollButton from '@/components/UpscrollButton';

const apiurl = API_BASE_URL;

export default function GalleryPage() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [allCollages, setAllCollages] = useState<Collage[]>([]);
  const [filteredCollages, setFilteredCollages] = useState<Collage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [siteRes, collagesRes] = await Promise.all([
        fetch(apiurl+'/api/site'),
        fetch(apiurl+'/api/collages')
      ]);

      if (siteRes.ok) {
        const siteData = await siteRes.json();
        setSiteSettings(siteData);
      }

      if (collagesRes.ok) {
        const collagesData = await collagesRes.json();
        setAllCollages(collagesData);
        setFilteredCollages(collagesData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (!siteSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Gallery</h1>
          <p className="text-gray-600">Failed to load site settings. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 bg-gray-50">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">
            College Gallery
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Explore our collection of memorable moments
          </p>
        </div>

        <CategoryFilter 
          collages={allCollages} 
          onFilterChange={setFilteredCollages}
        />

        {filteredCollages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No collages found!</p>
            <p className="text-gray-400">
              Try selecting a different category or visit the{' '}
              <button 
                onClick={() => window.location.hash = '/admin'}
                className="text-blue-600 hover:underline"
              >
                admin panel
              </button>{' '}
              to create new collages.
            </p>
          </div>
        ) : (
          <div className="relative min-h-[70vh] w-full">
            {/* Background blur effect for single collage */}
            {filteredCollages.length === 1 && (
              <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-100/80 to-gray-200/80 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-3xl transition-opacity duration-500"></div>
            )}
            
            <div className={`grid ${filteredCollages.length === 1 ? 'justify-center items-center h-full' : ''} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6`}>
              {filteredCollages.map((collage) => (
                <div 
                  key={collage.id} 
                  className={`
                    ${filteredCollages.length === 1 
                      ? 'relative z-10 w-full max-w-2xl mx-auto transform transition-transform duration-500' 
                      : 'transition-transform duration-300 hover:scale-105'
                    }
                  `}
                >
                  <CollageCard collage={collage} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <UpscrollButton />
    </main>
  );
}