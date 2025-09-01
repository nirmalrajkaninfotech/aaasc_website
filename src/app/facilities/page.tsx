import FacilitiesSection from '@/components/FacilitiesSection';
import { getSiteSettings } from '@/lib/api-utils';
import UpscrollButton from '@/components/UpscrollButton';

export default async function FacilitiesPage() {
  const siteSettings = await getSiteSettings();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <FacilitiesSection facilities={siteSettings.facilities || []} />
      </main>
      <UpscrollButton />
    </div>
  );
}