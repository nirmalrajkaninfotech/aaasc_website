'use client';

import { useState, useEffect } from 'react';
import AcademicSection from '@/components/AcademicSection';
import { getAcademics } from '@/lib/api-utils';
import UpscrollButton from '@/components/UpscrollButton';
import { AcademicSection as AcademicSectionType } from '@/types';

export default function AcademicsPage() {
  const [academicData, setAcademicData] = useState<AcademicSectionType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAcademics();
        setAcademicData(data);
      } catch (error) {
        console.error('Error fetching academic data:', error);
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
          <p className="text-gray-600 font-medium">Loading academics content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        {academicData && <AcademicSection academic={academicData} />}
      </main>
      <UpscrollButton />
    </div>
  );
}

