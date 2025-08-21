import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { FacultySection, SiteSettings } from '@/types';

// This function runs at build time to generate all possible paths
export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), 'data', 'site.json');
  const data = fs.readFileSync(filePath, 'utf8');
  const siteSettings: SiteSettings = JSON.parse(data);
  
  return siteSettings.faculty.items
    .filter(item => item.published)
    .map(item => ({
      slug: item.slug,
    }));
}

async function getFacultyData(): Promise<FacultySection> {
  const filePath = path.join(process.cwd(), 'data', 'site.json');
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const siteSettings: SiteSettings = JSON.parse(data);
    return siteSettings.faculty;
  } catch (error) {
    console.error('Error reading faculty data:', error);
    return {
      title: 'Our Faculty',
      items: []
    };
  }
}

interface PageProps {
  params: { slug: string };
}

export default async function FacultyDetailPage({ params }: PageProps) {
  const faculty = await getFacultyData();
  const item = faculty.items.find(i => i.slug === params.slug && i.published);
  
  if (!item) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {item.image && (
            <div className="md:w-1/3">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-8 md:w-2/3">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
            {item.designation && (
              <p className="text-lg text-gray-600 mb-4">{item.designation}</p>
            )}
            
            {(item.email || item.phone) && (
              <div className="mt-6 space-y-2">
                {item.email && (
                  <p className="text-gray-700">
                    <span className="font-medium">Email:</span> {item.email}
                  </p>
                )}
                {item.phone && (
                  <p className="text-gray-700">
                    <span className="font-medium">Phone:</span> {item.phone}
                  </p>
                )}
              </div>
            )}
            
            {item.socialLinks && (
              <div className="mt-6 flex space-x-4">
                {Object.entries(item.socialLinks).map(([platform, url]) => (
                  url && (
                    <a 
                      key={platform} 
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-700"
                      aria-label={platform}
                    >
                      <span className="sr-only">{platform}</span>
                      {/* You can add icons here if you have an icon library */}
                      {platform}
                    </a>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
        
        {item.content && (
          <div className="px-8 pb-8">
            <div 
              className="prose max-w-none" 
              dangerouslySetInnerHTML={{ __html: item.content }} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
