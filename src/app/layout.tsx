import type { Metadata } from "next";
import "./globals.css";
import HeaderWrapper from '@/components/HeaderWrapper';
import Footer from '@/components/Footer';
import { SiteSettings } from '@/types';
import React from 'react';
import { getSiteData } from '@/lib/data';

function getSiteSettings(): SiteSettings {
  return getSiteData() as SiteSettings;
}

export const metadata: Metadata = {
  title: "My Collage Website",
  description: "A customizable collage website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteSettings = getSiteSettings();
  const isAdminRoute = false; // This will be determined client-side by HeaderWrapper

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <HeaderWrapper siteSettings={siteSettings} />
        <main className="flex-1">
          {children}
        </main>
        {!isAdminRoute && <Footer siteSettings={siteSettings} />}
      </body>
    </html>
  );
}