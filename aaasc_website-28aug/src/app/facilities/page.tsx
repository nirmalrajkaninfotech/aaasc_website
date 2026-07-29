'use client';

import { useState, useEffect } from 'react';
import FacilitiesSection from '@/components/FacilitiesSection';
import { getSiteSettings } from '@/lib/api-utils';
import UpscrollButton from '@/components/UpscrollButton';
import { FacilitiesSection as FacilitiesSectionType } from '@/types';

export default function FacilitiesPage() {
  const [facilitiesData, setFacilitiesData] = useState<FacilitiesSectionType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const siteSettings = await getSiteSettings();
        setFacilitiesData(siteSettings.facilities || {
          title: 'Facilities',
          subtitle: 'Our Campus Facilities',
          items: []
        });
      } catch (error) {
        console.error('Error fetching facilities data:', error);
        setFacilitiesData({
          title: 'Facilities',
          subtitle: 'Our Campus Facilities',
          items: []
        });
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
          <p className="text-gray-600 font-medium">Loading facilities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <FacilitiesSection facilities={facilitiesData || { title: 'Facilities', subtitle: 'Our Campus Facilities', items: [] }} />
      </main>
      <UpscrollButton />
    </div>
  );
}