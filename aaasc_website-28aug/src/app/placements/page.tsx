'use client';

import React, { useState, useEffect } from 'react';
import PlacementSection from '@/components/PlacementSection';
import UpscrollButton from '@/components/UpscrollButton';
import { getPlacements } from '@/lib/api-utils';
import { PlacementSection as PlacementSectionType } from '@/types';

export default function PlacementsPage() {
  const [placements, setPlacements] = useState<PlacementSectionType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getPlacements();
        setPlacements(data);
      } catch (error) {
        console.error('Error fetching placements:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading placement information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        {placements ? (
          <PlacementSection placements={placements} />
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-500 italic">Placement information is currently unavailable.</p>
          </div>
        )}
      </main>
      <UpscrollButton />
    </div>
  );
}
