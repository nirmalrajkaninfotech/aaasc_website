import { FacultySection as FacultySectionType, SiteSettings } from '@/types';
import FacultySection from '@/components/FacultySection';
import { getSiteData } from '@/lib/data';

function getFaculty(): FacultySectionType {
  const data = getSiteData() as SiteSettings;
  return data.faculty;
}

export default function FacultyPage() {
  const faculty = getFaculty();
  return (
    <FacultySection faculty={faculty} />
  );
}
