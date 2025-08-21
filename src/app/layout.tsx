import type { Metadata } from "next";
import "./globals.css";
import HeaderWrapper from '@/components/HeaderWrapper';
import Footer from '@/components/Footer';
import { SiteSettings } from '@/types';
import React from 'react';
import { API_BASE_URL } from "@/config";


async function getSiteSettings(): Promise<SiteSettings> {
 const res = await fetch('https://aasc.veetusaapadu.in/api/site', {
  cache: 'default' // or simply omit the cache option
});
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