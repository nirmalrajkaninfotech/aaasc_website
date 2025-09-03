'use client';

import { useEffect, useState } from 'react';
import IQACSection from '@/components/IQACSection';
import UpscrollButton from '@/components/UpscrollButton';
import { getIQAC } from '@/lib/api-utils';

export default function IQACPage() {
  const [iqacData, setIqacData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getIQAC();
      setIqacData(data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading IQAC...</p>
        </div>
      </div>
    );
  }

  return (
    <main>
      <IQACSection iqacData={iqacData} />
      <UpscrollButton />
    </main>
  );
}