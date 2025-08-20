import AcademicSection from '@/components/AcademicSection';

async function getAcademicData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/academics/public`, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch academic data');
    }
    
    return await res.json();
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
