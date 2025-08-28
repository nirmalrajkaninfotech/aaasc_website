import AcademicSection from '@/components/AcademicSection';
import { getAcademics } from '@/lib/api-utils';

export default async function AcademicsPage() {
  const academicData = await getAcademics();

  return (
    <main>
      <AcademicSection academic={academicData} />
    </main>
  );
}
