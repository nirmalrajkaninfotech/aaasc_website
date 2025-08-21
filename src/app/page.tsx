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
import fs from 'fs';
import path from 'path';

// Read data directly from files during build time
function getSiteSettings(): SiteSettings {
  try {
    const filePath = path.join(process.cwd(), 'data', 'site.json');
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading site settings:', error);
    // Return default settings that match the SiteSettings interface
    return {
      siteTitle: 'AAASC',
      logo: '',
      navLinks: [],
      hero: {
        title: '',
        subtitle: '',
        backgroundImage: '',
        ctaText: '',
        ctaLink: ''
      },
      about: {
        title: '',
        content: '',
        image: '',
        stats: []
      },
      placements: {
        title: '',
        subtitle: '',
        items: []
      },
      achievements: {
        title: '',
        subtitle: '',
        items: []
      },
      facilities: {
        title: '',
        subtitle: '',
        items: []
      },
      carousel: {
        title: '',
        subtitle: '',
        items: []
      },
      contact: {
        address: '',
        phone: '',
        email: '',
        officeHours: ''
      },
      homepage: { 
        sections: [] 
      },
      footer: {
        text: '',
        socialLinks: []
      },
      examCell: {
        title: '',
        subtitle: '',
        content: '',
        showHero: false,
        showFeatures: false,
        showQuickLinks: false,
        showCTA: false,
        heroButtonText: '',
        ctaButtonText: ''
      },
      others: {
        aishe: { title: '', subtitle: '', content: '' },
        academicCoordinator: { title: '', subtitle: '', content: '' }
      },
      faculty: {
        title: '',
        items: []
      }
    };
  }
}

function getCollages(): Collage[] {
  try {
    const filePath = path.join(process.cwd(), 'data', 'collages.json');
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading collages:', error);
    return [];
  }
}

export default function Home() {
  const siteSettings = getSiteSettings();
  const collages = getCollages();

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
        // Map collages to gallery items
        const galleryItems = collages.map(collage => ({
          id: collage.id.toString(),
          title: collage.title,
          description: collage.description,
          category: collage.category,
          date: collage.date,
          featured: collage.featured || false,
          tags: collage.tags || [],
          images: collage.images || [],
          order: 0, // Add default order if not present
          published: true // Default to published
        }));
        return <GallerySection key="gallery" items={galleryItems} title="Photo Gallery" subtitle="Explore our collection of memorable moments" />;
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