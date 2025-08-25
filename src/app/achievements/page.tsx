import AchievementsSection from '@/components/AchievementsSection';
import { SiteSettings } from '@/types';
import { getSiteData } from '@/lib/data';

function getSiteSettings(): SiteSettings {
  return getSiteData() as SiteSettings;
}

export default function AchievementsPage() {
  const siteSettings = getSiteSettings();
  return (
    <main>
      <AchievementsSection achievements={siteSettings.achievements} />
    </main>
  );
}