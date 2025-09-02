import AcademicSection from '@/components/AcademicSection';
import { getAcademics } from '@/lib/api-utils';
import UpscrollButton from '@/components/UpscrollButton';

export default async function AcademicsPage() {
  const academicData = await getAcademics();

  return (
    <main>
      <AcademicSection academic={academicData} />
      <UpscrollButton />
    </main>
  );
}
