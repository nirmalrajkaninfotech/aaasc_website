'use client';

import { useEffect, useState } from 'react';
import FacultySection from '@/components/FacultySection';
import UpscrollButton from '@/components/UpscrollButton';
import { FacultySection as FacultySectionType } from '@/types';
import { getFaculty } from '@/lib/api-utils';

export default function FacultiesPage() {
  const [facultyData, setFacultyData] = useState<FacultySectionType>({ title: 'Faculty', subtitle: '', items: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getFaculty();
      setFacultyData(data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading faculty...</p>
        </div>
      </div>
    );
  }

  return (
    <main>
      <FacultySection faculty={facultyData} />
      <UpscrollButton />
    </main>
  );
}