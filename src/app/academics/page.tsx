import AcademicSection from '@/components/AcademicSection';
import { readAcademicData } from '@/lib/data';

async function getAcademicData() {
  try {
    return readAcademicData();
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
