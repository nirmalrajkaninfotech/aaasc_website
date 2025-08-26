import type { Metadata } from "next";
import "./globals.css";
import HeaderWrapper from '@/components/HeaderWrapper';
import Footer from '@/components/Footer';
import type { SiteSettings, Logo } from '@/types';
import React from 'react';
import DisableRightClick from '@/components/DisableRightClick';
// Import ErrorBoundary directly since we've created it
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

async function getSiteSettings(): Promise<SiteSettings> {
  // For static export, return default settings
  if (process.env.NEXT_PHASE === 'phase-export' || process.env.NODE_ENV === 'production') {
    console.warn('[Static Export] Using default site settings');
    return defaultSiteSettings;
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/api/site`, {
      cache: 'no-store',
      next: { revalidate: 3600 }, // Revalidate every hour
      // Add timeout for fetch
      signal: AbortSignal.timeout(5000)
    });
    
    if (!res.ok) {
      console.error('Failed to fetch site settings, using defaults');
      return defaultSiteSettings;
    }
    
    const data = await res.json();
    
    // Ensure the data has required fields
    return {
      ...defaultSiteSettings,
      ...data,
      // Ensure logo is properly formatted
      logo: data.logo || defaultSiteSettings.logo,
      // Ensure contact info exists
      contact: {
        ...defaultSiteSettings.contact,
        ...(data.contact || {})
      },
      // Ensure footer exists
      footer: {
        ...defaultSiteSettings.footer,
        ...(data.footer || {})
      }
    };
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return defaultSiteSettings;
  }
}

// Generate metadata dynamically based on site settings
export async function generateMetadata(): Promise<Metadata> {
  // Use default settings for metadata to avoid fetch during build
  const settings = defaultSiteSettings;
  const title = settings.siteTitle || "AAASC - Annai Arts and Science College";
  const description = settings.description || "Excellence in Education";
  const logoUrl = getLogoUrl(settings.logo);
  
  // In production, we'll use the defaults to avoid build-time fetches
  // In development, you might want to fetch the actual settings
  if (process.env.NODE_ENV === 'development') {
    try {
      const dynamicSettings = await getSiteSettings();
      if (dynamicSettings) {
        const dynamicTitle = dynamicSettings.siteTitle || title;
        const dynamicDescription = dynamicSettings.description || description;
        const dynamicLogoUrl = getLogoUrl(dynamicSettings.logo);
        
        return {
          title: {
            default: dynamicTitle,
            template: `%s | ${dynamicTitle.split(' - ')[0]}`
          },
          description: dynamicDescription,
          keywords: ["college", "education", "arts", "science", "AAASC"],
          authors: [{ name: "AAASC" }],
          themeColor: [
            { media: "(prefers-color-scheme: light)", color: "#ffffff" },
            { media: "(prefers-color-scheme: dark)", color: "#1a202c" },
          ],
          viewport: {
            width: "device-width",
            initialScale: 1,
            maximumScale: 5,
          },
          robots: {
            index: true,
            follow: true,
            googleBot: {
              index: true,
              follow: true,
              'max-video-preview': -1,
              'max-image-preview': 'large',
              'max-snippet': -1,
            },
          },
          openGraph: {
            title: dynamicTitle,
            description: dynamicDescription,
            url: process.env.NEXT_PUBLIC_SITE_URL || "https://aaasc.edu.in",
            siteName: dynamicTitle.split(' - ')[0],
            images: [
              {
                url: dynamicLogoUrl,
                width: 1200,
                height: 630,
                alt: getLogoAlt(dynamicSettings.logo),
              },
            ],
            locale: "en_US",
            type: "website",
          },
          twitter: {
            card: "summary_large_image",
            title: dynamicTitle,
            description: dynamicDescription,
            images: [dynamicLogoUrl],
            creator: "@aaasc",
          },
          icons: {
            icon: '/favicon.ico',
            shortcut: '/favicon-16x16.png',
            apple: '/apple-touch-icon.png',
          },
        };
      }
    } catch (error) {
      console.error('Error fetching site settings for metadata:', error);
    }
  }
  
  return {
    title: {
      default: title,
      template: `%s | ${title.split(' - ')[0]}`
    },
    description: description,
    keywords: ["college", "education", "arts", "science", "AAASC"],
    authors: [{ name: "AAASC" }],
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#ffffff" },
      { media: "(prefers-color-scheme: dark)", color: "#1a202c" },
    ],
    viewport: {
      width: "device-width",
      initialScale: 1,
      maximumScale: 5,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: title,
      description: description,
      url: process.env.NEXT_PUBLIC_SITE_URL || "https://aaasc.edu.in",
      siteName: title.split(' - ')[0],
      images: [
        {
          url: logoUrl,
          width: 1200,
          height: 630,
          alt: getLogoAlt(settings.logo),
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [logoUrl],
      creator: "@aaasc",
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get site settings with fallback
  let siteSettings: SiteSettings = defaultSiteSettings;
  
  if (process.env.NODE_ENV !== 'production') {
    try {
      siteSettings = await getSiteSettings();
    } catch (error) {
      console.error('Error in RootLayout:', error);
    }
  }

  // Determine if this is an admin route
  const isAdminRoute = false; // This will be determined client-side by HeaderWrapper
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <ErrorBoundary>
          <DisableRightClick>
            <HeaderWrapper siteSettings={siteSettings} />
            <main className="flex-1">
              {children}
            </main>
            {!isAdminRoute && <Footer siteSettings={siteSettings} />}
          </DisableRightClick>
        </ErrorBoundary>
      </body>
    </html>
  );
}