'use client';

import { ReactNode } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import DisableRightClick from '@/components/DisableRightClick';
import HeaderWrapper from '@/components/HeaderWrapper';
import Footer from '@/components/Footer';
import type { SiteSettings } from '@/types';

interface ClientLayoutProps {
  children: ReactNode;
  siteSettings: SiteSettings;
}

export default function ClientLayout({ children, siteSettings }: ClientLayoutProps) {
  // Determine if this is an admin route
  const isAdminRoute = false; // This will be determined client-side by HeaderWrapper
  
  return (
    <ErrorBoundary>
      <DisableRightClick>
        <HeaderWrapper siteSettings={siteSettings} />
        <main className="flex-1">
          {children}
        </main>
        {!isAdminRoute && <Footer siteSettings={siteSettings} />}
      </DisableRightClick>
    </ErrorBoundary>
  );
}
