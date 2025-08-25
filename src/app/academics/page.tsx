import AcademicSection from '@/components/AcademicSection';
import { getAcademicsData } from '@/lib/data';

function getAcademicData() {
  return getAcademicsData();
}

export default function AcademicsPage() {
  const academicData = getAcademicData();

  return (
    <main>
      <AcademicSection academic={academicData} />
    </main>
  );
}
