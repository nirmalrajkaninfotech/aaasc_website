import fs from 'fs';
import path from 'path';
import Image from 'next/image';
import { SiteSettings } from '@/types';
import Link from 'next/link';

// This function runs at build time to generate all possible paths
export async function generateStaticParams() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'site.json');
    const data = fs.readFileSync(filePath, 'utf8');
    const siteSettings: SiteSettings = JSON.parse(data);
    
    return siteSettings.facilities?.items?.map((facility) => ({
      id: facility.id,
    })) || [];
  } catch (error) {
    console.error('Error generating static params for facilities:', error);
    return [];
  }
}

async function getSiteSettings(): Promise<SiteSettings> {
  const filePath = path.join(process.cwd(), 'data', 'site.json');
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading site settings:', error);
    return {
      siteTitle: 'College Facilities',
      logo: '',
      navLinks: [],
      hero: {
        title: '',
        subtitle: '',
        backgroundImage: '',
        ctaText: '',
        ctaLink: ''
      },
      about: {
        title: '',
        content: '',
        image: '',
        stats: []
      },
      placements: {
        title: '',
        subtitle: '',
        items: []
      },
      achievements: {
        title: '',
        subtitle: '',
        items: []
      },
      facilities: {
        title: 'Our Facilities',
        subtitle: 'World-class infrastructure for learning and growth',
        items: []
      },
      carousel: {
        title: '',
        subtitle: '',
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
      footer: {
        text: '',
        socialLinks: []
      },
      examCell: {
        title: '',
        subtitle: '',
        content: '',
        showHero: false,
        showFeatures: false,
        showQuickLinks: false,
        showCTA: false,
        heroButtonText: '',
        ctaButtonText: ''
      },
      others: {
        aishe: { title: '', subtitle: '', content: '' },
        academicCoordinator: { title: '', subtitle: '', content: '' }
      },
      faculty: {
        title: '',
        items: []
      }
    };
  }
}

// This page is statically generated at build time
export const dynamic = 'force-static';

// Disable any automatic revalidation
export const revalidate = false;

export default async function FacilityDetailPage({ params }: { params: { id: string } }) {
  const site = await getSiteSettings();
  const facility = site.facilities.items.find(i => i.id === params.id);

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


