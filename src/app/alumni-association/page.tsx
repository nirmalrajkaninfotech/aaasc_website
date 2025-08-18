import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AlumniSection from '@/components/AlumniSection';
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

export default async function AlumniAssociationPage() {
  const siteSettings = await getSiteSettings();

  return (
    <div className="min-h-screen flex flex-col">
      <Header siteSettings={siteSettings} />

      <main className="flex-1">
        {siteSettings.alumni && <AlumniSection alumni={siteSettings.alumni} />}
      </main>

      <Footer siteSettings={siteSettings} />
    </div>
  );
}
