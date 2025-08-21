import AcademicSection from '@/components/AcademicSection';
import academicsData from '../../../data/academics.json';
import { AcademicSection as AcademicSectionType } from '@/types';

export default function AcademicsPage() {
  const academicData = academicsData as AcademicSectionType;

  return (
    <main>
      <AcademicSection academic={academicData} />
    </main>
  );
}
