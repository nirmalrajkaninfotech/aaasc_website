'use client';

import { useState, useEffect } from 'react';
import AchievementsSection from '@/components/AchievementsSection';
import { getSiteSettings } from '@/lib/api-utils';
import UpscrollButton from '@/components/UpscrollButton';
import { SiteSettings } from '@/types';

export default function AchievementsPage() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getSiteSettings();
        setSiteSettings(data);
      } catch (error) {
        console.error('Error fetching achievements:', error);
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
          <p className="text-gray-600 font-medium">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <main>
      <AchievementsSection
        achievements={siteSettings?.achievements || { title: 'Achievements', subtitle: '', items: [] }}
      />
      <UpscrollButton />
    </main>
  );
}



