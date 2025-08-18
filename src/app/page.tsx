import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
        { label: "About", href: "/about" }
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
      footer: {
        text: "© 2025 University Memories. All rights reserved.",
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

  // Get enabled sections from homepage layout
  const enabledSections = siteSettings.homepage.sections
    .filter(section => section.enabled)
    .sort((a, b) => a.order - b.order);

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
      <Header siteSettings={siteSettings} />

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

      <Footer siteSettings={siteSettings} />
    </div>
  );
}