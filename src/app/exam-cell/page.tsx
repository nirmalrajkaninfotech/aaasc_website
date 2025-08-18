import { API_BASE_URL } from '@/config';
import { ExamCellSection } from '@/types';

async function getExamCell(): Promise<ExamCellSection> {
  const res = await fetch(`${API_BASE_URL}/api/site`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch site settings');
  const data = await res.json();
  return data.examCell;
}

export default async function ExamCellPage() {
  const examCell = await getExamCell();
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{examCell.title}</h1>
      <h2 className="text-xl text-gray-600 mb-6">{examCell.subtitle}</h2>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: examCell.content }} />
    </div>
  );
}
