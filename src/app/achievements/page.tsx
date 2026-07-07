import AchievementsSection from '@/components/AchievementsSection';
import { SiteSettings } from '@/types';
import { fetchApi } from '@/lib/api';

async function getSiteSettings(): Promise<SiteSettings> {
  return fetchApi<SiteSettings>('/api/site', { cache: 'no-store' });
}

export default async function AchievementsPage() {
  const siteSettings = await getSiteSettings();
  return (
    <main>
      <AchievementsSection achievements={siteSettings.achievements} />
    </main>
  );
}


