import type { Metadata } from "next";
import "./globals.css";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SiteSettings } from '@/types';
import { API_BASE_URL } from '@/config';
import React from 'react';
import Header2 from '@/components/Header2';

async function getSiteSettings(): Promise<SiteSettings> {
  const res = await fetch(`${API_BASE_URL}/api/site`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch site settings');
  return res.json();
}

export const metadata: Metadata = {
  title: "My Collage Website",
  description: "A customizable collage website",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteSettings = await getSiteSettings();
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header2 header2Data={siteSettings.header2} />
          <Header siteSettings={siteSettings} />
        </div>
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <Footer siteSettings={siteSettings} />
      </body>
    </html>
  );
}