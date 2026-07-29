'use client';

import React, { useState, useEffect } from 'react';
import AboutSection from '@/components/AboutSection';
import UpscrollButton from '@/components/UpscrollButton';
import { getSiteSettings } from '@/lib/api-utils';
import { SiteSettings } from '@/types';

export default function AboutPage() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const settings = await getSiteSettings();
        setSiteSettings(settings);
      } catch (error) {
        console.error('Error fetching site settings:', error);
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
          <p className="text-gray-600 font-medium">Loading About details...</p>
        </div>
      </div>
    );
  }

  if (!siteSettings || !siteSettings.about) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 italic">About section content not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero Section */}


      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <AboutSection about={siteSettings.about} />
        </div>
      </main>
      <UpscrollButton />
    </div>
  );
}