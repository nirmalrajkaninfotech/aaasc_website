import { API_BASE_URL } from '@/config';
import { FacultySection as FacultySectionType } from '@/types';
import FacultySection from '@/components/FacultySection';

async function getFaculty(): Promise<FacultySectionType> {
 const res = await fetch(`/api/site`, {
  cache: 'default' // or simply omit the cache option
});
  if (!res.ok) throw new Error('Failed to fetch site settings');
  const data = await res.json();
  return data.faculty;
}

export default async function FacultyPage() {
  const faculty = await getFaculty();
  return (
    <FacultySection faculty={faculty} />
  );
}
