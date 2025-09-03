'use client';

import { useEffect, useState } from 'react';
import UpscrollButton from '@/components/UpscrollButton';
import { getSiteSettings } from '@/lib/api-utils';

export default function OthersPage() {
  const [others, setOthers] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const site = await getSiteSettings();
      setOthers(site?.others || null);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading others...</p>
        </div>
      </div>
    );
  }

  if (!others) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No content available.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{others.title || 'Others'}</h1>
        {others.subtitle && <p className="text-gray-600 mb-8">{others.subtitle}</p>}
        {others.content && (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: others.content }} />
          </div>
        )}
      </div>
      <UpscrollButton />
    </main>
  );
}