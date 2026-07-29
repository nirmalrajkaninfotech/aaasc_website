'use client';

import React, { useState, useEffect } from 'react';
import { FacultySection as FacultySectionType } from '@/types';
import FacultySection from '@/components/FacultySection';
import UpscrollButton from '@/components/UpscrollButton';
import { getFaculty } from '@/lib/api-utils';

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<FacultySectionType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getFaculty();
        setFaculty(data);
      } catch (error) {
        console.error('Error fetching faculty data:', error);
        setFaculty({ title: 'Our Faculty', items: [] });
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
          <p className="text-gray-600 font-medium">Loading faculty information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <FacultySection faculty={faculty!} />
      </main>
      <UpscrollButton />
    </div>
  );
}
