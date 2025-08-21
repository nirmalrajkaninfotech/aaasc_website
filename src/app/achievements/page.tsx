import AchievementsSection from '@/components/AchievementsSection';
import { SiteSettings } from '@/types';
import fs from 'fs';
import path from 'path';

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
    // Fallback minimal settings
    return {
      siteTitle: 'Site',
      logo: '/logo.png',
      navLinks: [],
      hero: { title: '', subtitle: '', backgroundImage: '/img/1.jpg', ctaText: '', ctaLink: '/' },
      about: { title: 'About', content: '', image: '/img/1.jpg', stats: [] },
      placements: { title: '', subtitle: '', items: [] },
      achievements: { title: 'Achievements', subtitle: '', items: [] },
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
}

export default async function AchievementsPage() {
  const siteSettings = await getSiteSettings();
  return (
    <main>
      <AchievementsSection achievements={siteSettings.achievements} />
    </main>
  );
}


