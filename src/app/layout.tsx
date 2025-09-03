'use client';

import "./globals.css";
import HeaderWrapper from '@/components/HeaderWrapper';
import Footer from '@/components/Footer';
import type { SiteSettings, Logo } from '@/types';
import React, { useEffect, useState } from 'react';
import DisableRightClick from '@/components/DisableRightClick';
import ErrorBoundary from '@/components/ErrorBoundary';

// Helper to safely get the logo URL
const getLogoUrl = (logo: Logo): string => {
  return typeof logo === 'string' ? logo : logo?.url || '/logo.png';
};

// Helper to safely get the logo alt text
const getLogoAlt = (logo: Logo): string => {
  return typeof logo === 'string' ? 'Site Logo' : logo?.alt || 'Site Logo';
};

// Default site settings for fallback
const defaultSiteSettings: SiteSettings = {
  siteTitle: "AAASC - Annai Arts and Science College",
  description: "Annai Arts and Science College - Excellence in Education",
  logo: {
    url: "/logo.png",
    alt: "AAASC Logo"
  },
  contact: {
    email: "info@aaasc.edu.in",
    phone: "+91 1234567890",
    address: "College Address, City, State, Pincode"
  },
  hero: {
    title: "Welcome to AAASC",
    subtitle: "Excellence in Education",
    image: "/images/hero.jpg"
  },
  about: {
    title: "About Us",
    content: "Annai Arts and Science College is committed to providing quality education.",
    stats: []
  },
  facilities: {
    title: "Our Facilities",
    subtitle: "World-class facilities for our students",
    items: []
  },
  faculty: {
    title: "Our Faculty",
    items: []
  },
  header: {
    navigation: [
      { name: "Home", href: "/" },
      { name: "About", href: "/about" },
      { name: "Academics", href: "/academics" },
      { name: "Faculty", href: "/faculty" },
      { name: "Facilities", href: "/facilities" },
      { name: "Gallery", href: "/gallery" },
      { name: "Contact", href: "/contact" }
    ]
  },
  footer: {
    copyright: `© ${new Date().getFullYear()} AAASC. All rights reserved.`,
    links: [],
    socialLinks: [
      { label: 'Facebook', href: '#' },
      { label: 'Twitter', href: '#' },
      { label: 'Instagram', href: '#' },
      { label: 'LinkedIn', href: '#' }
    ]
  }
};

import { getSiteSettings as fetchSiteSettings } from '@/lib/api-utils';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set document metadata
    const updateMetadata = (settings: SiteSettings) => {
      const title = settings.siteTitle || "AAASC - Annai Arts and Science College";
      const description = settings.description || "Excellence in Education";

      document.title = title;

      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);

      // Update favicon
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = '/favicon.ico';
    };

    // Fetch site settings on client side
    const loadSiteSettings = async () => {
      try {
        const settings = await fetchSiteSettings();
        setSiteSettings(settings);
        updateMetadata(settings);
      } catch (error) {
        console.error('Error fetching site settings:', error);
        setSiteSettings(defaultSiteSettings);
        updateMetadata(defaultSiteSettings);
      } finally {
        setIsLoading(false);
      }
    };

    loadSiteSettings();
  }, []);

  if (isLoading) {
    return (
      <html lang="en">
        <body className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <ErrorBoundary>
          <DisableRightClick>
            <HeaderWrapper siteSettings={siteSettings} />
            <main className="flex-1">
              {children}
            </main>
            <Footer siteSettings={siteSettings} />
          </DisableRightClick>
        </ErrorBoundary>
      </body>
    </html>
  );
}