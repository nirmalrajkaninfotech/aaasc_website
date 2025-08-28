import FacilitiesSection from '@/components/FacilitiesSection';
import { getSiteSettings } from '@/lib/api-utils';

export default async function FacilitiesPage() {
  const siteSettings = await getSiteSettings();

  return (
    <main className="flex-1">
      <FacilitiesSection facilities={siteSettings.facilities || []} />
    </main>
  );
}