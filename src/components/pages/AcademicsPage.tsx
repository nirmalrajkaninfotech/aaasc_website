'use client';

import { useEffect, useState } from 'react';
import AcademicSection from '@/components/AcademicSection';
import UpscrollButton from '@/components/UpscrollButton';
import { AcademicSection as AcademicSectionType } from '@/types';
import { getAcademics } from '@/lib/api-utils';

export default function AcademicsPage() {
  const [academicData, setAcademicData] = useState<AcademicSectionType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getAcademics();
      setAcademicData(data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading academics...</p>
        </div>
      </div>
    );
  }

  return (
    <main>
      <AcademicSection academic={academicData as AcademicSectionType} />
      <UpscrollButton />
    </main>
  );
}