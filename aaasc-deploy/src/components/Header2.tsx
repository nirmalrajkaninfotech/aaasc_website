'use client';

import Link from 'next/link';
import { SiteSettings } from '@/types';

interface Header2Props {
  siteSettings: SiteSettings;
}

export default function Header2({ siteSettings }: Header2Props) {
  if (!siteSettings) {
    return null;
  }
  
  return (
    <header className="bg-gray-800 text-white shadow-md">
  
    </header>
  );
}
