import { notFound } from 'next/navigation';
import Image from 'next/image';
import BackButton from '@/components/BackButton';

import { Collage, SiteSettings } from '@/types';

async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/site`, {
      cache: 'no-store'
    });
    
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    
    console.error('Failed to fetch site settings:', res.status, res.statusText);
  } catch (error) {
    console.error('Error fetching site settings:', error);
  }
  
  // Return a minimal valid SiteSettings object with all required properties as fallback
  return {
    siteTitle: "My Collage Website",
    logo: "/logo.png",
    navLinks: [
      { label: "Home", href: "/" },
      { label: "Gallery", href: "/gallery" },
      { label: "About", href: "/about" }
    ],
    hero: {
      title: "Welcome to Our College",
      subtitle: "Excellence in Education",
      backgroundImage: "/hero-bg.jpg",
      ctaText: "Learn More",
      ctaLink: "/about"
    },
    about: {
      title: "About Us",
      content: "Welcome to our college.",
      image: "/about.jpg",
      stats: []
    },
    placements: {
      title: "Placements",
      subtitle: "Our Successful Placements",
      items: []
    },
    achievements: {
      title: "Achievements",
      subtitle: "Our Proud Achievements",
      items: []
    },
    facilities: {
      title: "Our Facilities",
      subtitle: "World-class facilities for students",
      items: []
    },
    carousel: {
      title: "Highlights",
      subtitle: "Campus Highlights",
      items: []
    },
    contact: {
      address: "123 College St, City, Country",
      phone: "+1 234 567 8900",
      email: "info@college.edu",
      officeHours: "Mon-Fri: 9:00 AM - 5:00 PM"
    },
    homepage: {
      sections: []
    },
    examCell: {
      title: "Exam Cell",
      subtitle: "Examination Information",
      content: "Exam cell information",
      showHero: true,
      showFeatures: true,
      showQuickLinks: true,
      showCTA: true,
      heroButtonText: "Learn More",
      ctaButtonText: "Contact Us"
    },
    others: {
      aishe: {
        title: "AISHE",
        subtitle: "All India Survey on Higher Education",
        content: "AISHE information"
      },
      academicCoordinator: {
        title: "Academic Coordinator",
        subtitle: "Academic Coordination",
        content: "Academic coordinator information"
      }
    },
    faculty: {
      title: "Our Faculty",
      items: []
    },
    footer: {
      text: "© 2025 My Collage Website. All rights reserved.",
      socialLinks: [
        { label: "Twitter", href: "https://twitter.com/myprofile" },
        { label: "GitHub", href: "https://github.com/myprofile" }
      ]
    }
  };
}

async function getCollage(id: string): Promise<Collage | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/collages/${id}`, {
      cache: 'no-store',
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (res.ok) {
      return await res.json();
    }
    
    console.error(`Failed to fetch collage ${id}:`, res.status, res.statusText);
    
    // Return a minimal fallback collage to prevent build failure
    if (process.env.NODE_ENV === 'production') {
      return {
        id: parseInt(id, 10),
        title: `Collage ${id}`,
        images: [],
        category: 'General',
        date: new Date().toISOString(),
        featured: false,
        tags: []
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching collage ${id}:`, error);
    
    // Return a minimal fallback collage to prevent build failure
    if (process.env.NODE_ENV === 'production') {
      return {
        id: parseInt(id, 10),
        title: `Collage ${id}`,
        images: [],
        category: 'General',
        date: new Date().toISOString(),
        featured: false,
        tags: []
      };
    }
    
    return null;
  }
}

// This function generates static params at build time
export async function generateStaticParams() {
  // For static export, we need to return at least one valid path
  // If the API is not available during build, return a default path
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/collages`, {
      cache: 'no-store',
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!res.ok) {
      console.error('Failed to fetch collages for static params:', res.status, res.statusText);
      // Return a default path to prevent build failure
      return [{ id: '1' }];
    }
    
    const collages = await res.json();
    
    if (!Array.isArray(collages) || collages.length === 0) {
      console.error('No collages found or invalid response format');
      return [{ id: '1' }];
    }
    
    // Return all collages as static params
    return collages.map((collage: { id: number | string }) => ({
      id: collage.id.toString(),
    }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    // Return a default path to prevent build failure
    return [{ id: '1' }];
  }
}

// Add revalidation to the page
export const revalidate = 3600; // Revalidate this page every hour

export default async function CollagePage({ params }: { params: { id: string } }) {
  const [siteSettings, collage] = await Promise.all([
    getSiteSettings(),
    getCollage(params.id)
  ]);

  if (!collage) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
   
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center items-center gap-4 mb-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {collage.category}
              </span>
              {collage.featured && (
                <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Featured
                </span>
              )}
            </div>
            
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              {collage.title}
            </h1>
            
            {collage.description && (
              <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
                {collage.description}
              </p>
            )}
            
            <div className="flex justify-center items-center gap-6 text-gray-500">
              <span>{collage.images.length} images</span>
              <span>•</span>
              <span>{new Date(collage.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collage.images.map((image, index) => (
              <div key={index} className="relative bg-gray-200 rounded-lg overflow-hidden group">
                <Image
                  src={image}
                  alt={`${collage.title} - Image ${index + 1}`}
                  width={400}
                  height={400}
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>

          {collage.images.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No images in this collage yet.</p>
            </div>
          )}
        </div>
      </main>

     
    </div>
  );
}