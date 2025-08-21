import fs from 'fs';
import path from 'path';
import { FacultySection as FacultySectionType, SiteSettings } from '@/types';
import FacultySection from '@/components/FacultySection';

// This page is statically generated at build time
export const dynamic = 'force-static';

async function getFacultyData(): Promise<FacultySectionType> {
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

export default async function FacultyPage() {
  const faculty = await getFacultyData();
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {faculty.title || 'Our Faculty'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet our dedicated team of educators and staff members
          </p>
        </div>
        
        <FacultySection faculty={faculty} />
      </div>
    </div>
  );
}
