import FacilitiesSection from '@/components/FacilitiesSection';
import { SiteSettings } from '@/types';

async function getSiteSettings(): Promise<SiteSettings> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/site`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch site settings');
  }
  
  return res.json();
}

export default async function FacilitiesPage() {
  const siteSettings = await getSiteSettings();

  return (
    <main className="flex-1">
      <FacilitiesSection facilities={siteSettings.facilities} />
    </main>
  );
}