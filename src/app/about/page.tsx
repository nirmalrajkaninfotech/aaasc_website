
import AboutSection from '@/components/AboutSection';
import { SiteSettings } from '@/types';
import { getSiteData } from '@/lib/data';

function getSiteSettings(): SiteSettings {
  return getSiteData() as SiteSettings;
}

export default function AboutPage() {
  const siteSettings = getSiteSettings();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <AboutSection about={siteSettings.about} />
      </main>
    </div>
  );
}