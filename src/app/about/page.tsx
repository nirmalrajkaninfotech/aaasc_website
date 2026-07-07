
import AboutSection from '@/components/AboutSection';
import { SiteSettings } from '@/types';
import { fetchApi } from '@/lib/api';

async function getSiteSettings(): Promise<SiteSettings> {
  return fetchApi<SiteSettings>('/api/site', { cache: 'no-store' });
}

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