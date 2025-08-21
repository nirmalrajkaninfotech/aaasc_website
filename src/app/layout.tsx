import type { Metadata } from "next";
import "./globals.css";
import HeaderWrapper from '@/components/HeaderWrapper';
import Footer from '@/components/Footer';
import { SiteSettings } from '@/types';
import React from 'react';
import fs from 'fs';
import path from 'path';

async function getSiteSettings(): Promise<SiteSettings> {
  const filePath = path.join(process.cwd(), 'data', 'site.json');
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading site settings:', error);
    // Return default values if file reading fails
    return {
      siteTitle: "My Collage Website",
      logo: "/logo.png",
      navLinks: [
        { label: "Home", href: "/" },
        { label: "Gallery", href: "/gallery" },
        { label: "About", href: "/about" }
      ],
      hero: {
        title: "Welcome to Our College",
        subtitle: "Excellence in Education",
        backgroundImage: "/images/hero-bg.jpg",
        ctaText: "Learn More",
        ctaLink: "/about"
      },
      about: {
        title: "About Us",
        content: "Welcome to our institution.",
        image: "/images/about.jpg",
        stats: []
      },
      placements: {
        title: "Placements",
        subtitle: "Our successful placements",
        items: []
      },
      achievements: {
        title: "Achievements",
        subtitle: "Our proud moments",
        items: []
      },
      facilities: {
        title: "Facilities",
        subtitle: "World-class infrastructure",
        items: []
      },
      carousel: {
        title: "Highlights",
        subtitle: "Campus life",
        items: []
      },
      contact: {
        address: "123 College Street, City",
        phone: "+1234567890",
        email: "info@college.edu",
        officeHours: "Mon-Fri: 9AM - 5PM"
      },
      homepage: {
        sections: []
      },
      footer: {
        text: "© 2025 My Collage Website. All rights reserved.",
        socialLinks: []
      },
      examCell: {
        title: "Exam Cell",
        subtitle: "Examination information",
        content: "Exam cell details",
        showHero: false,
        showFeatures: false,
        showQuickLinks: false,
        showCTA: false,
        heroButtonText: "",
        ctaButtonText: ""
      },
      others: {
        aishe: { title: "AISHE", subtitle: "", content: "" },
        academicCoordinator: { title: "Academic Coordinator", subtitle: "", content: "" }
      },
      faculty: {
        title: "Our Faculty",
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