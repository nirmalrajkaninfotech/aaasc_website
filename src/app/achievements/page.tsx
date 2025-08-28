import AchievementsSection from '@/components/AchievementsSection';
import { getSiteSettings } from '@/lib/api-utils';

export default async function AchievementsPage() {
  const siteSettings = await getSiteSettings();
  return (
    <main>
      <AchievementsSection achievements={siteSettings.achievements || { title: 'Achievements', subtitle: '', items: [] }} />
    </main>
  );
}


