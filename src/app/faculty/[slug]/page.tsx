import { FacultySection, SiteSettings } from '@/types';
import { notFound } from 'next/navigation';
import { getSiteData } from '@/lib/data';

// Generate static params for all faculty slugs
export async function generateStaticParams() {
  const siteData = getSiteData() as SiteSettings;
  
  return siteData.faculty.items
    .filter(item => item.published && item.slug)
    .map((item) => ({
      slug: item.slug,
    }));
}

function getFaculty(): FacultySection {
  const siteData = getSiteData() as SiteSettings;
  return siteData.faculty;
}

interface PageProps {
  params: { slug: string };
}

export default function FacultyDetailPage({ params }: PageProps) {
  const faculty = getFaculty();
  const item = faculty.items.find(i => i.slug === params.slug && i.published);
  if (!item) return notFound();
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{item.title}</h1>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: item.content }} />
    </div>
  );
}
