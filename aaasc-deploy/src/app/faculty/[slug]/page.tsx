import { API_BASE_URL } from '@/config';
import { FacultySection } from '@/types';
import { notFound } from 'next/navigation';

async function getFaculty(): Promise<FacultySection> {
  const res = await fetch(`/api/site`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch site settings');
  const data = await res.json();
  return data.faculty;
}

interface PageProps {
  params: { slug: string };
}

export default async function FacultyDetailPage({ params }: PageProps) {
  const faculty = await getFaculty();
  const item = faculty.items.find(i => i.slug === params.slug && i.published);
  if (!item) return notFound();
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{item.title}</h1>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: item.content }} />
    </div>
  );
}
