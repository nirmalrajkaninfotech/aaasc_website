
import AboutSection from '@/components/AboutSection';
import { SiteSettings } from '@/types';
import siteData from '../../../data/site.json';

export default function AboutPage() {
  const siteSettings = siteData as SiteSettings;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <AboutSection about={siteSettings.about} />
      </main>
    </div>
  );
}