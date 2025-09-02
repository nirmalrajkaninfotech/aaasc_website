import AboutSection from '@/components/AboutSection';
import UpscrollButton from '@/components/UpscrollButton';
import { getSiteSettings } from '@/lib/api-utils';

export default async function AboutPage() {
  const siteSettings = await getSiteSettings();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero Section */}
     

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <AboutSection about={siteSettings.about} />
        </div>
      </main>
      <UpscrollButton />
    </div>
  );
}