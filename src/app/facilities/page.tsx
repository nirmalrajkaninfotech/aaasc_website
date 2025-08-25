import FacilitiesSection from '@/components/FacilitiesSection';
import { SiteSettings } from '@/types';
import { getSiteData } from '@/lib/data';

function getSiteSettings(): SiteSettings {
  return getSiteData() as SiteSettings;
}

export default function FacilitiesPage() {
  const siteSettings = getSiteSettings();

  return (
    <main className="flex-1">
      <FacilitiesSection facilities={siteSettings.facilities} />
    </main>
  );
}