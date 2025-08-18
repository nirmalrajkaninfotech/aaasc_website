import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AlumniSection from '@/components/AlumniSection';
import { SiteSettings } from '@/types';

async function getSiteSettings(): Promise<SiteSettings> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/site`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch site settings');
  return res.json();
}

async function getAlumni() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/alumni`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function AlumniPage() {
  const [siteSettings, alumni] = await Promise.all([
    getSiteSettings(),
    getAlumni()
  ]);
  return (
    <div className="flex flex-col min-h-screen">
      <Header siteSettings={siteSettings} />
      <main>
        <AlumniSection alumni={alumni} />
      </main>
      <Footer siteSettings={siteSettings} />
    </div>
  );
}
