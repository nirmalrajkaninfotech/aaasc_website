import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import PlacementsSection from '@/components/PlacementsSection';
import AchievementsSection from '@/components/AchievementsSection';
import AlumniSection from '@/components/AlumniSection';
import FacilitiesSection from '@/components/FacilitiesSection';
import FeaturedCollages from '@/components/FeaturedCollages';
import { Collage, SiteSettings } from '@/types';

async function getSiteSettings(): Promise<SiteSettings> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/site`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    // Return default settings if API fails
    return {
      siteTitle: "University Memories",
      logo: "/logo.png",
      navLinks: [
        { label: "Home", href: "/" },
        { label: "Gallery", href: "/gallery" },
        { label: "About", href: "/about" },
        { label: "Alumni", href: "/alumni-association" }
      ],
      hero: {
        title: "Capturing College Memories",
        subtitle: "Preserving the moments that define our academic journey",
        backgroundImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=600&fit=crop",
        ctaText: "Explore Gallery",
        ctaLink: "/gallery"
      },
      about: {
        title: "About Our College",
        content: "Our institution has been a beacon of academic excellence.",
        image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&h=400&fit=crop",
        stats: [
          { label: "Students", value: "15,000+" },
          { label: "Faculty", value: "800+" }
        ]
      },
      placements: {
        title: "Placements",
        subtitle: "Our students succeed",
        items: []
      },
      achievements: {
        title: "Achievements",
        subtitle: "Our milestones",
        items: []
      },
      alumni: {
        title: "Alumni Association",
        subtitle: "Stay connected with our alumni network",
        items: []
      },
      facilities: {
        title: "Facilities",
        subtitle: "What we offer",
        items: []
      },
      contact: {
        address: "",
        phone: "",
        email: "",
        officeHours: ""
      },
      homepage: {
        sections: [
          { id: 'hero', name: 'Hero Section', enabled: true, order: 1 },
          { id: 'about', name: 'About Section', enabled: true, order: 2 },
          { id: 'placements', name: 'Placements', enabled: false, order: 3 },
          { id: 'achievements', name: 'Achievements', enabled: false, order: 4 },
          { id: 'alumni', name: 'Alumni Association', enabled: false, order: 5 },
          { id: 'facilities', name: 'Facilities', enabled: false, order: 6 },
          { id: 'featured-collages', name: 'Featured Collages', enabled: false, order: 7 }
        ]
      },
      footer: {
        text: " 2025 University Memories. All rights reserved.",
        socialLinks: [
          { label: "Facebook", href: "https://facebook.com/university" }
        ]
      }
    };
  }
  
  return res.json();
}

async function getCollages(): Promise<Collage[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/collages`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    return [];
  }
  
  return res.json();
}

export default async function Home() {
  const [siteSettings, collages] = await Promise.all([
    getSiteSettings(),
    getCollages()
  ]);

  // Get enabled sections sorted by order
  const enabledSections = siteSettings.homepage?.sections
    ?.filter(section => section.enabled)
    ?.sort((a, b) => a.order - b.order) || [];

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hero':
        return <HeroSection key="hero" hero={siteSettings.hero} />;
      case 'about':
        return <AboutSection key="about" about={siteSettings.about} />;
      case 'placements':
        return <PlacementsSection key="placements" placements={siteSettings.placements} />;
      case 'achievements':
        return <AchievementsSection key="achievements" achievements={siteSettings.achievements} />;
      case 'alumni':
        return siteSettings.alumni ? (
          <AlumniSection key="alumni" alumni={siteSettings.alumni} />
        ) : null;
      case 'facilities':
        return <FacilitiesSection key="facilities" facilities={siteSettings.facilities} />;
      case 'featured-collages':
        return <FeaturedCollages key="featured-collages" collages={collages} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <Header siteSettings={siteSettings} />
      
      <main>
        {enabledSections.map(section => renderSection(section.id))}
      </main>

      <Footer siteSettings={siteSettings} />
    </div>
  );
}