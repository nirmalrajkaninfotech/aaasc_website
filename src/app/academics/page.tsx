import AcademicSection from '@/components/AcademicSection';
import { fetchApi } from '@/lib/api';

async function getAcademicData() {
  try {
    return await fetchApi('/api/academics/public', { cache: 'no-store' });
  } catch (error) {
    console.error('Error fetching academic data:', error);
    return {
      title: 'Academic Programs',
      subtitle: 'Explore our diverse range of academic programs',
      programs: [],
      additionalInfo: ''
    };
  }
}

export default async function AcademicsPage() {
  const academicData = await getAcademicData();

  return (
    <main>
      <AcademicSection academic={academicData} />
    </main>
  );
}
