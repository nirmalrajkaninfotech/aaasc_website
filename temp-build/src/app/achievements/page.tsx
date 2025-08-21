import AchievementsSection from '@/components/AchievementsSection';
import { SiteSettings } from '@/types';
import siteData from '../../../data/site.json';

export default function AchievementsPage() {
  const siteSettings = siteData as SiteSettings;
  return (
    <main>
      <AchievementsSection achievements={siteSettings.achievements} />
    </main>
  );
}


