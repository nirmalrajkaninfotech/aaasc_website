'use client';

import { ReactNode, useEffect, useState } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import DisableRightClick from '@/components/DisableRightClick';
import HeaderWrapper from '@/components/HeaderWrapper';
import Footer from '@/components/Footer';
import type { SiteSettings } from '@/types';
import { getSiteSettings } from '@/lib/api-utils';

interface ClientLayoutProps {
  children: ReactNode;
  siteSettings: SiteSettings; // Initial/default settings from server
}

export default function ClientLayout({ children, siteSettings: initialSiteSettings }: ClientLayoutProps) {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSiteSettings);
  const [loading, setLoading] = useState(true);

  // Fetch real site settings on client side (CSR)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSiteSettings();
        setSiteSettings(settings);
      } catch (error) {
        console.error('Error fetching site settings:', error);
        // Keep using initial settings on error
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Determine if this is an admin route
  const isAdminRoute = false; // This will be determined client-side by HeaderWrapper
  
  return (
    <ErrorBoundary>
      <DisableRightClick>
        {!loading && <HeaderWrapper siteSettings={siteSettings} />}
        <main className="flex-1">
          {children}
        </main>
        {!loading && !isAdminRoute && <Footer siteSettings={siteSettings} />}
      </DisableRightClick>
    </ErrorBoundary>
  );
}
