import { Collage, SiteSettings } from '@/types';
import fs from 'fs';
import path from 'path';
import CollageCard from '@/components/CollageCard';
import CategoryFilter from '@/components/CategoryFilter';

// This tells Next.js this page is static
export const dynamic = 'force-static';

// Read site settings from file
async function getSiteSettings(): Promise<SiteSettings> {
  const filePath = path.join(process.cwd(), 'data', 'site.json');
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading site settings:', error);
    return getDefaultSiteSettings();
  }
}

// Get default site settings
function getDefaultSiteSettings(): SiteSettings {
  return {
    siteTitle: 'Gallery',
    logo: '/logo.png',
    navLinks: [],
    hero: { title: '', subtitle: '', backgroundImage: '', ctaText: '', ctaLink: '' },
    about: { title: '', content: '', image: '', stats: [] },
    placements: { title: '', subtitle: '', items: [] },
    achievements: { title: '', subtitle: '', items: [] },
    facilities: { title: '', subtitle: '', items: [] },
    carousel: { title: '', subtitle: '', items: [] },
    contact: { address: '', phone: '', email: '', officeHours: '' },
    homepage: { sections: [] },
    footer: { text: '', socialLinks: [] },
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
    faculty: { title: '', items: [] }
  };
}

// Read collages from file
async function getCollages(): Promise<Collage[]> {
  const filePath = path.join(process.cwd(), 'data', 'collages.json');
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading collages:', error);
    return [];
  }
}

export default async function GalleryPage() {
  const [siteSettings, collages] = await Promise.all([
    getSiteSettings(),
    getCollages()
  ]);
  
  // Filter published collages
  const publishedCollages = collages.filter(collage => collage.published !== false);

  return (
    <main className="flex-1 bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            College Gallery
          </h1>
          <p className="text-xl text-gray-600">
            Explore our collection of memorable moments and experiences
          </p>
        </div>

        <CategoryFilter 
          collages={publishedCollages} 
          onFilterChange={() => {}} // Client-side filtering will be handled by the component
        />

        {publishedCollages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No collages found!</p>
            <p className="text-gray-400">
              Please check back later for updates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {publishedCollages.map((collage) => (
              <CollageCard key={collage.id} collage={collage} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
