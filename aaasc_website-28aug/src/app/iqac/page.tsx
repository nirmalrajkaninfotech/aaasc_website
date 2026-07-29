'use client';

import { useState, useEffect } from 'react';
import IQACSection from '@/components/IQACSection';
import UpscrollButton from '@/components/UpscrollButton';
import { getSiteSettings } from '@/lib/api-utils';

export default function IQACPage() {
  const [iqacData, setIqacData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const siteSettings = await getSiteSettings();
        setIqacData(siteSettings.iqac || null);
      } catch (error) {
        console.error('Error fetching IQAC data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading IQAC data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <IQACSection iqacData={iqacData} />
      </main>
      <UpscrollButton />
    </div>
  );
}