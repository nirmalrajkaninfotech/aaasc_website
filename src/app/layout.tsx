import type { Metadata } from "next";
import "./globals.css";
import HeaderWrapper from '@/components/HeaderWrapper';
import Footer from '@/components/Footer';
import { SiteSettings } from '@/types';
import React from 'react';
import { API_BASE_URL } from "@/config";


async function getSiteSettings(): Promise<SiteSettings> {
  try {
    // Try the public endpoint first (no authentication required)
    const res = await fetch(`${API_BASE_URL}/api/site/public`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch site settings');
    return res.json();
  } catch (error) {
    console.error('Failed to fetch site settings:', error);
    // Return default settings if API is unavailable
    return {
      siteTitle: "AAASC College",
      logo: "",
      navLinks: [],
      hero: {
        title: "Welcome to AAASC College",
        subtitle: "A customizable collage website",
        backgroundImage: "",
        ctaText: "Learn More",
        ctaLink: "/about"
      },
      about: {
        title: "About Us",
        content: "Welcome to AAASC College",
        image: "",
        stats: []
      },
      placements: {
        title: "Placements",
        subtitle: "Our placement achievements",
        items: []
      },
      achievements: {
        title: "Achievements",
        subtitle: "Our accomplishments",
        items: []
      },
      facilities: {
        title: "Facilities",
        subtitle: "Our campus facilities",
        items: []
      },
      carousel: {
        title: "Carousel",
        subtitle: "Featured content",
        items: []
      },
      contact: {
        email: "",
        phone: "",
        address: "",
        officeHours: ""
      },
      homepage: {
        sections: []
      },
      footer: {
        text: "© 2024 AAASC College. All rights reserved.",
        socialLinks: []
      },
      examCell: {
        title: "Exam Cell",
        subtitle: "Examination information",
        content: "Welcome to our exam cell",
        showHero: true,
        showFeatures: true,
        showQuickLinks: true,
        showCTA: true,
        heroButtonText: "Learn More",
        ctaButtonText: "Contact Us"
      },
      others: {
        aishe: {
          title: "AISHE",
          subtitle: "All India Survey on Higher Education",
          content: "Information about AISHE"
        },
        academicCoordinator: {
          title: "Academic Coordinator",
          subtitle: "Academic coordination information",
          content: "Details about academic coordination"
        }
      },
      faculty: {
        title: "Faculty",
        items: []
      }
    };
  }
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