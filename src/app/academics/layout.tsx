import { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SiteSettings } from '@/types';

async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/site/public`, { 
      cache: 'force-cache',
      next: { revalidate: 3600 } // Revalidate every hour
    });
    if (!res.ok) throw new Error('Failed to fetch site settings');
    return res.json();
  } catch (error) {
    console.error('Failed to fetch site settings:', error);
    // Return comprehensive fallback settings if API fails
    return {
      siteTitle: "AAASC College",
      logo: "",
      navLinks: [],
      hero: {
        title: "Welcome to AAASC College",
        subtitle: "Excellence in Education",
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

export default async function AcademicsLayout({ children }: { children: ReactNode }) {
  const siteSettings = await getSiteSettings();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header siteSettings={siteSettings} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer siteSettings={siteSettings} />
    </div>
  );
}
