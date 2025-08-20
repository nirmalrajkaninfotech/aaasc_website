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
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/admin" className="text-xl font-bold">
              {siteSettings.siteTitle || 'Admin Panel'}
            </Link>
      
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              View Site
            </Link>
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium transition-colors">
              Logout
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className="md:hidden mt-3 pt-3 border-t border-gray-700">
          <div className="flex flex-col space-y-2">
            <Link href="/admin/dashboard" className="block py-2 px-2 rounded hover:bg-gray-700">
              Dashboard
            </Link>
            <Link href="/admin/posts" className="block py-2 px-2 rounded hover:bg-gray-700">
              Posts
            </Link>
            <Link href="/admin/pages" className="block py-2 px-2 rounded hover:bg-gray-700">
              Pages
            </Link>
            <Link href="/admin/header" className="block py-2 px-2 rounded hover:bg-gray-700">
              Header
            </Link>
            <Link href="/admin/settings" className="block py-2 px-2 rounded hover:bg-gray-700">
              Settings
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
