import { FacultySection as FacultySectionType } from '@/types';
import FacultySection from '@/components/FacultySection';
import UpscrollButton from '@/components/UpscrollButton';
import { getSiteSettings } from '@/lib/api-utils';

export default async function FacultyPage() {
  let faculty: FacultySectionType | null = null;
  
  try {
    const siteSettings = await getSiteSettings();
    faculty = siteSettings.faculty || { title: 'Our Faculty', subtitle: 'Expert educators', items: [] };
  } catch (error) {
    console.error('Error fetching faculty data:', error);
    // Use fallback data
    faculty = { title: 'Our Faculty', subtitle: 'Expert educators', items: [] };
  }
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <FacultySection faculty={faculty} />
      </main>
      <UpscrollButton />
    </div>
  );
}
