import AchievementsSection from '@/components/AchievementsSection';
import { getSiteSettings } from '@/lib/api-utils';
import UpscrollButton from '@/components/UpscrollButton';

export default async function AchievementsPage() {
  const siteSettings = await getSiteSettings();
  return (
    <main>
      <AchievementsSection achievements={siteSettings.achievements || { title: 'Achievements', subtitle: '', items: [] }} />
      <UpscrollButton />
    </main>
  );
}


