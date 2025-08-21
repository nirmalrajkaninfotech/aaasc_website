import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

import { Collage, SiteSettings } from '@/types';

// This function runs at build time to generate all possible paths
export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), 'data', 'collages.json');
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const collages = JSON.parse(data);
    return collages.map((collage: Collage) => ({
      id: collage.id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params for collages:', error);
    return [];
  }
}

function getDefaultSiteSettings(): SiteSettings {
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
      backgroundImage: "/images/hero-bg.jpg",
      ctaText: "Learn More",
      ctaLink: "/about"
    },
    about: {
      title: "About Us",
      content: "Welcome to our institution.",
      image: "/images/about.jpg",
      stats: []
    },
    placements: {
      title: "Placements",
      subtitle: "Our successful placements",
      items: []
    },
    achievements: {
      title: "Achievements",
      subtitle: "Our proud moments",
      items: []
    },
    facilities: {
      title: "Facilities",
      subtitle: "World-class infrastructure",
      items: []
    },
    carousel: {
      title: "Highlights",
      subtitle: "Campus life",
      items: []
    },
    contact: {
      address: "123 College Street, City",
      phone: "+1234567890",
      email: "info@college.edu",
      officeHours: "Mon-Fri: 9AM - 5PM"
    },
    homepage: {
      sections: []
    },
    footer: {
      text: "© 2025 My Collage Website. All rights reserved.",
      socialLinks: []
    },
    examCell: {
      title: "Exam Cell",
      subtitle: "Examination information",
      content: "Exam cell details",
      showHero: false,
      showFeatures: false,
      showQuickLinks: false,
      showCTA: false,
      heroButtonText: "",
      ctaButtonText: ""
    },
    others: {
      aishe: { title: "AISHE", subtitle: "", content: "" },
      academicCoordinator: { title: "Academic Coordinator", subtitle: "", content: "" }
    },
    faculty: {
      title: "Our Faculty",
      items: []
    }
  };
}

// Read site settings from file
async function getSiteSettings(): Promise<SiteSettings> {
  const filePath = path.join(process.cwd(), 'data', 'site.json');
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading site settings:', error);
    return getDefaultSiteSettings();
  }
}

// Read collage data from file
async function getCollage(id: string): Promise<Collage | null> {
  const filePath = path.join(process.cwd(), 'data', 'collages.json');
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const collages: Collage[] = JSON.parse(data);
    return collages.find(c => c.id.toString() === id) || null;
  } catch (error) {
    console.error('Error reading collage data:', error);
    return null;
  }
}

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
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Gallery
          </Link>
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
            
            {collage.tags && collage.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {collage.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
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