import FacilitiesSection from '@/components/FacilitiesSection';
import { SiteSettings } from '@/types';
import { fetchApi } from '@/lib/api';

async function getSiteSettings(): Promise<SiteSettings> {
  return fetchApi<SiteSettings>('/api/site', {
    cache: 'no-store'
  });
}

export default async function FacilitiesPage() {
  const siteSettings = await getSiteSettings();

  return (
    <main className="flex-1">
      <FacilitiesSection facilities={siteSettings.facilities} />
    </main>
  );
}