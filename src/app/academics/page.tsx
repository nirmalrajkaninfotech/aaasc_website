import AcademicSection from '@/components/AcademicSection';
import fs from 'fs';
import path from 'path';

async function getAcademicData() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'academics.json');
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading academic data:', error);
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
