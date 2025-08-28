
import AboutSection from '@/components/AboutSection';
import { getSiteSettings } from '@/lib/api-utils';

export default async function AboutPage() {
  const siteSettings = await getSiteSettings();

  return (
    <div className="min-h-screen flex flex-col">
    

      <main className="flex-1">
        <AboutSection about={siteSettings.about} />
      </main>

    </div>
  );
}