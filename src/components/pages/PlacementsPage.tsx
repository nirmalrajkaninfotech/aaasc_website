'use client';

import { useEffect, useState } from 'react';
import PlacementSection from '@/components/PlacementSection';
import UpscrollButton from '@/components/UpscrollButton';
import { getSiteSettings } from '@/lib/api-utils';

export default function PlacementsPage() {
  const [placements, setPlacements] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const site = await getSiteSettings();
      setPlacements(site?.placements || { title: 'Placements', subtitle: '', items: [] });
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading placements...</p>
        </div>
      </div>
    );
  }

  return (
    <main>
      <PlacementSection placements={placements} />
      <UpscrollButton />
    </main>
  );
}