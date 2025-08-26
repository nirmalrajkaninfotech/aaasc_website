import Image from 'next/image';
import { SiteSettings } from '@/types';
import Link from 'next/link';

async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/site`, { 
      cache: 'no-store',
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (res.ok) {
      return await res.json();
    }
    
    console.error('Failed to fetch site settings:', res.status, res.statusText);
    
    // Return a minimal fallback site settings to prevent build failure
    if (process.env.NODE_ENV === 'production') {
      const minimalSiteSettings: Partial<SiteSettings> = {
        siteTitle: 'College Website',
        logo: '/logo.png',
        navLinks: [
          { label: 'Home', href: '/' },
          { label: 'Facilities', href: '/facilities' }
        ],
        hero: {
          title: 'Welcome',
          subtitle: 'Welcome to our college',
          backgroundImage: '',
          ctaText: 'Learn More',
          ctaLink: '/about'
        },
        about: {
          title: 'About Us',
          content: 'About our college',
          image: '',
          stats: []
        },
        placements: {
          title: 'Placements',
          subtitle: 'Our Placements',
          items: []
        },
        achievements: {
          title: 'Achievements',
          subtitle: 'Our Achievements',
          items: []
        },
        facilities: {
          title: 'Facilities',
          subtitle: 'Our Facilities',
          items: [{
            id: '1',
            name: 'Facility',
            description: 'Facility description',
            category: 'General',
            features: [],
            published: true,
            order: 1
          }]
        },
        carousel: {
          title: 'Gallery',
          subtitle: 'Our Gallery',
          items: []
        },
        contact: {
          address: '',
          phone: '',
          email: '',
          officeHours: ''
        },
        homepage: {
          sections: []
        },
        examCell: {
          title: 'Exam Cell',
          subtitle: 'Examination Information',
          content: '',
          showHero: false,
          showFeatures: false,
          showQuickLinks: false,
          showCTA: false,
          heroButtonText: '',
          ctaButtonText: ''
        },
        others: {
          aishe: {
            title: 'AISHE',
            subtitle: '',
            content: ''
          },
          academicCoordinator: {
            title: 'Academic Coordinator',
            subtitle: '',
            content: ''
          }
        },
        faculty: {
          title: 'Faculty',
          items: []
        },
        footer: {
          text: '© 2025 College Website',
          socialLinks: []
        }
      };
      
      return minimalSiteSettings as SiteSettings;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching site settings:', error);
    
    // Return a minimal fallback site settings to prevent build failure
    if (process.env.NODE_ENV === 'production') {
      const minimalSiteSettings: Partial<SiteSettings> = {
        siteTitle: 'College Website',
        logo: '/logo.png',
        navLinks: [
          { label: 'Home', href: '/' },
          { label: 'Facilities', href: '/facilities' }
        ],
        hero: {
          title: 'Welcome',
          subtitle: 'Welcome to our college',
          backgroundImage: '',
          ctaText: 'Learn More',
          ctaLink: '/about'
        },
        about: {
          title: 'About Us',
          content: 'About our college',
          image: '',
          stats: []
        },
        placements: {
          title: 'Placements',
          subtitle: 'Our Placements',
          items: []
        },
        achievements: {
          title: 'Achievements',
          subtitle: 'Our Achievements',
          items: []
        },
        facilities: {
          title: 'Facilities',
          subtitle: 'Our Facilities',
          items: [{
            id: '1',
            name: 'Facility',
            description: 'Facility description',
            category: 'General',
            features: [],
            published: true,
            order: 1
          }]
        },
        carousel: {
          title: 'Gallery',
          subtitle: 'Our Gallery',
          items: []
        },
        contact: {
          address: '',
          phone: '',
          email: '',
          officeHours: ''
        },
        homepage: {
          sections: []
        },
        examCell: {
          title: 'Exam Cell',
          subtitle: 'Examination Information',
          content: '',
          showHero: false,
          showFeatures: false,
          showQuickLinks: false,
          showCTA: false,
          heroButtonText: '',
          ctaButtonText: ''
        },
        others: {
          aishe: {
            title: 'AISHE',
            subtitle: '',
            content: ''
          },
          academicCoordinator: {
            title: 'Academic Coordinator',
            subtitle: '',
            content: ''
          }
        },
        faculty: {
          title: 'Faculty',
          items: []
        },
        footer: {
          text: '© 2025 College Website',
          socialLinks: []
        }
      };
      
      return minimalSiteSettings as SiteSettings;
    }
    
    return null;
  }
}

// This function generates static params at build time
export async function generateStaticParams() {
  // For static export, we need to return at least one valid path
  // If the API is not available during build, return a default path
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/site`, {
      cache: 'no-store',
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!res.ok) {
      console.error('Failed to fetch site settings for static params:', res.status, res.statusText);
      // Return a default path to prevent build failure
      return [{ id: '1' }];
    }
    
    const site = await res.json();
    
    if (!site?.facilities?.items || !Array.isArray(site.facilities.items)) {
      console.error('No facilities data available or invalid format');
      return [{ id: '1' }];
    }
    
    // Return all facilities as static params
    return site.facilities.items
      .filter((facility: { id?: string | number }) => facility?.id)
      .map((facility: { id: string | number }) => ({
        id: facility.id.toString(),
      }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    // Return a default path to prevent build failure
    return [{ id: '1' }];
  }
}

// Add revalidation to the page
export const revalidate = 3600; // Revalidate this page every hour

export default async function FacilityDetailPage({ params }: { params: { id: string } }) {
  const site = await getSiteSettings();
  
  if (!site) {
    return (
      <main className="container mx-auto px-4 py-16">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Failed to load facility data. Please try again later.
              </p>
            </div>
          </div>
        </div>
        <Link href="/facilities" className="text-blue-700 hover:text-blue-900">← Back to Facilities</Link>
      </main>
    );
  }
  
  const facility = site.facilities?.items?.find(i => i.id === params.id);

  if (!facility) {
    return (
      <main className="container mx-auto px-4 py-16">
        <p className="text-gray-600">Facility not found.</p>
        <Link href="/facilities" className="text-blue-700 hover:text-blue-900">← Back to Facilities</Link>
      </main>
    );
  }

  return (
    <main className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link href="/facilities" className="text-blue-700 hover:text-blue-900">← Back to Facilities</Link>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 pt-6 pb-2">
            <h1 className="text-3xl font-bold text-gray-900">{facility.name}</h1>
            <span className="inline-block mt-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">{facility.category}</span>
          </div>
      
         
          <div className="p-6 space-y-5">
            <div className="prose prose-lg max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: facility.description }} />
            {facility.gallery?.length ? (
              <div>
                <h2 className="text-xl font-semibold mb-2">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {facility.gallery.map((img, idx) => (
                    <div key={idx} className="relative w-full aspect-[4/3]">
                      <Image src={img} alt={`${facility.name} ${idx+1}`} fill className="object-cover rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {facility.features?.length ? (
              <div>
                <h2 className="text-xl font-semibold mb-2">Key Features</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {facility.features.map((feature, idx) => (
                    <li key={idx} className="text-gray-700 flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}


