import fs from 'fs';
import path from 'path';
import FacilitiesSection from '@/components/FacilitiesSection';
import { SiteSettings } from '@/types';

// This page is statically generated at build time
export const dynamic = 'force-static';

async function getSiteSettings(): Promise<SiteSettings> {
  const filePath = path.join(process.cwd(), 'data', 'site.json');
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading site settings:', error);
    return {
      siteTitle: 'College Facilities',
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
        title: 'Our Facilities',
        subtitle: 'World-class infrastructure for learning and growth',
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

export default async function FacilitiesPage() {
  const siteSettings = await getSiteSettings();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {siteSettings.facilities.title || 'Our Facilities'}
          </h1>
          {siteSettings.facilities.subtitle && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {siteSettings.facilities.subtitle}
            </p>
          )}
        </div>
        
        <FacilitiesSection facilities={siteSettings.facilities} />
      </div>
    </div>
  );
}