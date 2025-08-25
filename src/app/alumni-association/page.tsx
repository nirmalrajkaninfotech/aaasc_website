import AlumniSection from '@/components/AlumniSection';
import { SiteSettings } from '@/types';
import { getSiteData, getAlumniData } from '@/lib/data';

// Fetch site settings
function getSiteSettings(): SiteSettings {
  return getSiteData() as SiteSettings;
}

// Fetch alumni data
function getAlumni() {
  return getAlumniData();
}

// Page Component
export default function AlumniPage() {
  const siteSettings = getSiteSettings();
  const alumni = getAlumni();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      {/* Page Header */}
      <header className="w-full bg-white shadow-md">
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-6 py-12">
      
          {alumni ? (
            <AlumniSection alumni={alumni} />
          ) : (
            <p className="text-center text-gray-500 italic">
              No alumni data available at this moment.
            </p>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
          <span className="text-sm">
            &copy; {new Date().getFullYear()} {siteSettings?.siteName || 'Alumni Network'}
          </span>
          <span className="text-sm">
            Built with ❤️ | Powered by Next.js
          </span>
        </div>
      </footer>
    </div>
  );
}
