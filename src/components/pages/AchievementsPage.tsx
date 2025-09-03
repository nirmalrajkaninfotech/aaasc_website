'use client';

import { useEffect, useState } from 'react';
import AchievementsSection from '@/components/AchievementsSection';
import UpscrollButton from '@/components/UpscrollButton';
import { getSiteSettings } from '@/lib/api-utils';

export default function AchievementsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const site = await getSiteSettings();
      setData(site?.achievements || { title: 'Achievements', subtitle: '', items: [] });
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <main>
      <AchievementsSection achievements={data} />
      <UpscrollButton />
    </main>
  );
}