import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { Collage, SiteSettings } from '@/types';
import { api } from '@/lib/api';

async function getSiteSettings(): Promise<SiteSettings> {
  const response = await api.site();
  if (response.error) {
    console.error('Failed to fetch site settings:', response.error);
    // Fallback to default settings if API fails
    return {
      siteTitle: "AAASC College",
      logo: "/logo.png",
      navLinks: [
        { label: "Home", href: "/" },
        { label: "Gallery", href: "/" },
        { label: "About", href: "/about" }
      ],
      footer: {
        text: "© 2025 AAASC College. All rights reserved.",
        socialLinks: [
          { label: "Twitter", href: "https://twitter.com/aaasc" },
          { label: "Facebook", href: "https://facebook.com/aaasc" }
        ]
      }
    };
  }
  return response.data;
}

async function getCollages(): Promise<Collage[]> {
  const response = await api.collages();
  if (response.error) {
    console.error('Failed to fetch collages:', response.error);
    return [];
  }
  return response.data || [];
}

export default async function GalleryPage() {
  const [siteSettings, collages] = await Promise.all([
    getSiteSettings(),
    getCollages()
  ]);

  if (collages.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Gallery</h1>
            <p className="text-gray-600">No gallery items found.</p>
            <Link href="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
              ← Back to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Photo Gallery
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collages.map((collage) => (
            <Link
              key={collage.id}
              href={`/collage/${collage.id}`}
              className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1"
            >
              <div className="aspect-square relative bg-gray-200">
                {collage.images[0] ? (
                  <Image
                    src={collage.images[0]}
                    alt={collage.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized={process.env.NODE_ENV !== 'production'}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image
                  </div>
                )}
                
                {/* Overlay with category and featured badge */}
                <div className="absolute top-2 left-2 flex gap-2">
                  <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {collage.category}
                  </span>
                  {collage.featured && (
                    <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Featured
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {collage.title}
                </h3>
                
                {collage.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {collage.description}
                  </p>
                )}
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{collage.images.length} images</span>
                  {collage.date && (
                    <span>{new Date(collage.date).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}