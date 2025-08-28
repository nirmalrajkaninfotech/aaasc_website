import { FacultySection, FacultyItem } from '@/types';
import { notFound } from 'next/navigation';
import Image from 'next/image';

// Define a type for the faculty item with required properties
type FacultyMember = FacultyItem & {
  slug: string;
  published: boolean;
  name: string;
  position?: string;
  image?: string;
  bio?: string;
  email?: string;
  phone?: string;
  qualifications?: string[];
  experience?: string;
  researchInterests?: string[];
};

import { getSiteSettings } from '@/lib/api-utils';

async function getFaculty(): Promise<{ items: FacultyMember[] }> {
  try {
    const data = await getSiteSettings();
    
    // Ensure we return a properly typed response with default values
    const items = Array.isArray(data.faculty?.items) 
      ? data.faculty.items.map((item: any) => ({
          ...item,
          slug: item.slug || `faculty-${item.id || Math.random().toString(36).substr(2, 9)}`,
          published: item.published !== false, // Default to true if not specified
          name: item.name || 'Faculty Member',
          position: item.position || '',
          bio: item.bio || '',
          email: item.email || '',
          phone: item.phone || '',
          qualifications: Array.isArray(item.qualifications) ? item.qualifications : [],
          experience: item.experience || '',
          researchInterests: Array.isArray(item.researchInterests) ? item.researchInterests : []
        }))
      : [];
      
    return { items };
  } catch (error) {
    console.error('Error fetching faculty data:', error);
    // Return empty items array to prevent build failures
    return { items: [] };
  }
}

interface PageProps {
  params: { slug: string };
}

// Remove revalidation for static export

// This function generates static params at build time
export async function generateStaticParams() {
  // For static export, return minimal static params
  // The actual data will be fetched at runtime
  return [{ slug: 'default-faculty' }];
}

export default async function FacultyDetailPage({ params }: PageProps) {
  const facultyData = await getFaculty();
  
  if (!facultyData || !Array.isArray(facultyData.items)) {
    console.error('Invalid faculty data format');
    notFound();
  }
  
  const faculty = facultyData.items.find(item => item.slug === params.slug);
  
  if (!faculty) {
    console.error(`Faculty member with slug ${params.slug} not found`);
    notFound();
  }
  
  // Render the faculty member's details
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <a 
          href="/faculty" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Faculty
        </a>
      </div>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {faculty.image && (
            <div className="md:w-1/3 p-4">
              <div className="relative h-64 md:h-full">
                <Image
                  src={faculty.image}
                  alt={faculty.name}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority
                />
              </div>
            </div>
          )}
          
          <div className="p-6 md:w-2/3">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{faculty.name}</h1>
            
            {faculty.position && (
              <p className="text-xl text-blue-600 mb-4">{faculty.position}</p>
            )}
            
            {faculty.qualifications && faculty.qualifications.length > 0 && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Qualifications</h2>
                <ul className="list-disc list-inside">
                  {faculty.qualifications.map((qualification, index) => (
                    <li key={index} className="text-gray-600">{qualification}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {faculty.experience && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Experience</h2>
                <p className="text-gray-600">{faculty.experience}</p>
              </div>
            )}
            
            {faculty.researchInterests && faculty.researchInterests.length > 0 && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Research Interests</h2>
                <ul className="list-disc list-inside">
                  {faculty.researchInterests.map((interest, index) => (
                    <li key={index} className="text-gray-600">{interest}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {faculty.bio && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Biography</h2>
                <p className="text-gray-600 whitespace-pre-line">{faculty.bio}</p>
              </div>
            )}
            
            <div className="border-t pt-4">
              {(faculty.email || faculty.phone) && (
                <div className="flex flex-wrap gap-4">
                  {faculty.email && (
                    <a 
                      href={`mailto:${faculty.email}`}
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      {faculty.email}
                    </a>
                  )}
                  
                  {faculty.phone && (
                    <a 
                      href={`tel:${faculty.phone.replace(/\D/g, '')}`}
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      {faculty.phone}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
