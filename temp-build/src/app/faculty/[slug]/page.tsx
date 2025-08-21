import { FacultySection } from '@/types';
import { notFound } from 'next/navigation';
import siteData from '../../../../data/site.json';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const faculty = siteData.faculty as FacultySection;
  return faculty.items
    .filter(item => item.published)
    .map(item => ({
      slug: item.slug,
    }));
}

export default async function FacultyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const faculty = siteData.faculty as FacultySection;
  const item = faculty.items.find(i => i.slug === slug && i.published);
  if (!item) return notFound();
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{item.title}</h1>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: item.content }} />
    </div>
  );
}
