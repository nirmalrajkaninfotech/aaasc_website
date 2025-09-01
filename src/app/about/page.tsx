import AboutSection from '@/components/AboutSection';
import UpscrollButton from '@/components/UpscrollButton';
import { getSiteSettings } from '@/lib/api-utils';

export default async function AboutPage() {
  const siteSettings = await getSiteSettings();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-8 sm:py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4">
            About Us
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-blue-100 max-w-3xl mx-auto">
            Learn more about our institution and values
          </p>
        </div>
      </div>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <AboutSection about={siteSettings.about} />
        </div>
      </main>
      <UpscrollButton />
    </div>
  );
}