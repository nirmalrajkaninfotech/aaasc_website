'use client';

import { useState, useEffect } from 'react';
import CollageCard from '@/components/CollageCard';
import CategoryFilter from '@/components/CategoryFilter';
import { Collage, SiteSettings } from '@/types';

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
        fetch('/api/site'),
        fetch('/api/collages')
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
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!siteSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Failed to load site settings</div>
      </div>
    );
  }

  return (
    <main className="flex-1 bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            College Gallery
          </h1>
          <p className="text-xl text-gray-600">
            Explore our collection of memorable moments and experiences
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
              <a href="/admin" className="text-blue-600 hover:underline">
                admin panel
              </a>{' '}
              to create new collages.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCollages.map((collage) => (
              <CollageCard key={collage.id} collage={collage} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}