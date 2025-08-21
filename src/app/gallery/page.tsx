'use client';
import { useDisableRightClick } from '@/hooks/useDisableRightClick';
import { useState, useEffect } from 'react';
import CollageCard from '@/components/CollageCard';
import CategoryFilter from '@/components/CategoryFilter';
import { Collage, SiteSettings } from '@/types';

export default function GalleryPage() {
    useDisableRightClick();

  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [allCollages, setAllCollages] = useState<Collage[]>([]);
  const [filteredCollages, setFilteredCollages] = useState<Collage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    
    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Add event listener
    document.addEventListener('contextmenu', handleContextMenu);

    // Clean up
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg blur opacity-20 animate-pulse"></div>
          <div className="relative bg-white/80 backdrop-blur-sm px-8 py-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xl font-medium text-gray-700">Loading Gallery...</span>
            </div>
          </div>
        </div>
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
    <main className="flex-1 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      <div className="container mx-auto px-4 py-12 relative">
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
          <div className="relative py-16 overflow-hidden">
            <div className="relative bg-white/80 backdrop-blur-sm max-w-2xl mx-auto p-8 rounded-2xl shadow-xl">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No collages found!</h3>
                <p className="text-gray-600 mb-6">We couldn't find any collages matching your selection.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <a 
                    href="/admin" 
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md hover:shadow-lg"
                  >
                    Go to Admin Panel
                  </a>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCollages.map((collage) => (
              <div key={collage.id} className="h-full">
                <CollageCard collage={collage} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}