import AlumniSection from '@/components/AlumniSection';
import { SiteSettings } from '@/types';
import fs from 'fs';
import path from 'path';

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
    siteTitle: "My Collage Website",
    logo: "/logo.png",
    navLinks: [],
    hero: { title: "", subtitle: "", backgroundImage: "", ctaText: "", ctaLink: "" },
    about: { title: "", content: "", image: "", stats: [] },
    placements: { title: "", subtitle: "", items: [] },
    achievements: { title: "", subtitle: "", items: [] },
    facilities: { title: "", subtitle: "", items: [] },
    carousel: { title: "", subtitle: "", items: [] },
    contact: { address: "", phone: "", email: "", officeHours: "" },
    homepage: { sections: [] },
    footer: { text: "", socialLinks: [] },
    examCell: { 
      title: "", 
      subtitle: "", 
      content: "", 
      showHero: false, 
      showFeatures: false, 
      showQuickLinks: false, 
      showCTA: false, 
      heroButtonText: "", 
      ctaButtonText: "" 
    },
    others: {
      aishe: { title: "", subtitle: "", content: "" },
      academicCoordinator: { title: "", subtitle: "", content: "" }
    },
    faculty: { title: "", items: [] }
  };
}

// Read alumni data from file
async function getAlumni() {
  const filePath = path.join(process.cwd(), 'data', 'alumni.json');
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading alumni data:', error);
    return {
      title: 'Alumni Association',
      content: 'Welcome to our alumni network. Stay connected with your alma mater!',
      image: '',
      members: []
    };
  }
}

// This function tells Next.js to pre-render this page at build time
export const dynamic = 'force-static';

// Page Component
export default async function AlumniPage() {
  const [siteSettings, alumni] = await Promise.all([
    getSiteSettings(),
    getAlumni(),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      {/* Page Header */}
      <header className="w-full bg-white shadow-md">
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-6 py-12">
      
          {alumni ? (
            <AlumniSection alumni={alumni} />
          ) : (
            <p className="text-center text-gray-500 italic">
              No alumni data available at this moment.
            </p>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
          <span className="text-sm">
            &copy; {new Date().getFullYear()} {siteSettings?.siteTitle || 'Alumni Network'}
          </span>
          <span className="text-sm">
            Built with ❤️ | Powered by Next.js
          </span>
        </div>
      </footer>
    </div>
  );
}
