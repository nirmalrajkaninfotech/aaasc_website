import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import PlacementsSection from '@/components/PlacementsSection';
import AchievementsSection from '@/components/AchievementsSection';
import FacilitiesSection from '@/components/FacilitiesSection';
import FeaturedCollages from '@/components/FeaturedCollages';
import GallerySection from '@/components/GallerySection';
import { Collage, SiteSettings } from '@/types';
import Carousel from '@/components/Carousel';
import Image from 'next/image';
import { api } from '@/lib/api';

async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const response = await api.site();
    if (response.error) {
      console.error('Failed to fetch site settings:', response.error);
      throw new Error(response.error);
    }
    return response.data;
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
        content: "AAASC College is committed to providing quality education.",
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
      },
      gallery: {
        title: "Gallery",
        items: []
      },
      homepage_image: null
    };
  }
}

async function getCollages(): Promise<Collage[]> {
  try {
    const response = await api.collages();
    if (response.error) {
      console.error('Failed to fetch collages:', response.error);
      return [];
    }
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch collages:', error);
    return [];
  }
}

export default async function Home() {
  const [siteSettings, collages] = await Promise.all([
    getSiteSettings(),
    getCollages()
  ]);

  // Get enabled sections from homepage layout
  const enabledSections = siteSettings.homepage?.sections
    ?.filter(section => section.enabled)
    .sort((a, b) => a.order - b.order) || [];

  // Function to render each section based on its ID
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
      case 'facilities':
        return <FacilitiesSection key="facilities" facilities={siteSettings.facilities} />;
      case 'featured-collages':
        return <FeaturedCollages key="featured-collages" collages={collages} />;
      case 'gallery':
        return <GallerySection key="gallery" items={siteSettings.gallery?.items || []} />;
      case 'carousel':
        return <Carousel key="carousel" isTamil={false} items={siteSettings.carousel?.items || []} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Homepage Image Section */}
      {siteSettings.homepage_image?.image && (
        <section className="w-full flex flex-col items-center justify-center bg-gray-100 py-8">
          <div className="relative w-full max-w-4xl h-80 rounded overflow-hidden shadow-lg">
            <Image
              src={siteSettings.homepage_image.image}
              alt={siteSettings.homepage_image.title || 'Homepage Image'}
              fill
              className="object-contain"
              unoptimized={process.env.NODE_ENV !== 'production'}
            />
          </div>
          {(siteSettings.homepage_image.title || siteSettings.homepage_image.description) && (
            <div className="mt-4 text-center">
              {siteSettings.homepage_image.title && <h2 className="text-2xl font-bold mb-2">{siteSettings.homepage_image.title}</h2>}
              {siteSettings.homepage_image.description && <p className="text-gray-600">{siteSettings.homepage_image.description}</p>}
            </div>
          )}
        </section>
      )}

      <main>
        {enabledSections.map(section => renderSection(section.id))}
      </main>
    </div>
  );
}