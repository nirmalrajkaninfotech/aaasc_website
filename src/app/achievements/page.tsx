import AchievementsSection from '@/components/AchievementsSection';
import { SiteSettings } from '@/types';
import { fetchApi } from '@/lib/api';

async function getSiteSettings(): Promise<SiteSettings> {
  const res = await fetch(`/api/site`, {
    cache: 'no-store'
  });
  if (!res.ok) {
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
      contact: { address: '', phone: '', email: '', officeHours: '' },
      homepage: { sections: [] },
      footer: { text: '', socialLinks: [] },
      examCell: { title: '', subtitle: '', content: '', showHero: false, showFeatures: false, showQuickLinks: false, showCTA: false, heroButtonText: '', ctaButtonText: '' },
      others: { aishe: { title: '', subtitle: '', content: '' }, academicCoordinator: { title: '', subtitle: '', content: '' } },
      faculty: { title: '', items: [] }
    } as unknown as SiteSettings;
  }
  return res.json();
}

export default async function AchievementsPage() {
  const siteSettings = await getSiteSettings();
  return (
    <main>
      <AchievementsSection achievements={siteSettings.achievements} />
    </main>
  );
}


