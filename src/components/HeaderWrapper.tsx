'use client';

import { useState, useEffect } from 'react';
import Header from './Header';
import Header2 from './Header2';
import { SiteSettings } from '@/types';

interface HeaderWrapperProps {
  siteSettings: SiteSettings;
}

export default function HeaderWrapper({ siteSettings }: HeaderWrapperProps) {
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  useEffect(() => {
    const checkAdminRoute = () => {
      const hash = window.location.hash.slice(1) || '/';
      setIsAdminRoute(hash.startsWith('/admin'));
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    
    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, []);

  return isAdminRoute ? (
    <Header2 siteSettings={siteSettings} />
  ) : (
    <Header siteSettings={siteSettings} />
  );
}
