'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Header2 from './Header2';
import { SiteSettings } from '@/types';

interface HeaderWrapperProps {
  siteSettings: SiteSettings;
}

export default function HeaderWrapper({ siteSettings }: HeaderWrapperProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return isAdminRoute ? (
    <Header2 siteSettings={siteSettings} />
  ) : (
    <Header siteSettings={siteSettings} />
  );
}
