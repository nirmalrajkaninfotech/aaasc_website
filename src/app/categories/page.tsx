
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

export default async function CategoriesPage() {
  const [siteSettings, collages] = await Promise.all([
    getSiteSettings(),
    getCollages()
  ]);

  // Group collages by category
  const categories = collages.reduce((acc, collage) => {
    if (!acc[collage.category]) {
      acc[collage.category] = [];
    }
    acc[collage.category].push(collage);
    return acc;
  }, {} as Record<string, Collage[]>);

  // Get unique categories
  const categoryNames = Object.keys(categories);

  if (categoryNames.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Categories</h1>
            <p className="text-gray-600">No categories found.</p>
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
          Gallery Categories
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categoryNames.map(category => (
            <div key={category} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{category}</h2>
                <p className="text-gray-600 mb-4">
                  {categories[category].length} {categories[category].length === 1 ? 'item' : 'items'}
                </p>
                
                {/* Show first few images as preview */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {categories[category].slice(0, 4).map((collage, index) => (
                    <div key={index} className="relative h-24 rounded overflow-hidden">
                      {collage.images[0] && (
                        <Image
                          src={collage.images[0]}
                          alt={collage.title}
                          fill
                          className="object-cover"
                          unoptimized={process.env.NODE_ENV !== 'production'}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <Link
                  href={`/categories/${encodeURIComponent(category)}`}
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  View Category
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}