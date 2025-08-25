
import Link from 'next/link';
import Image from 'next/image';
import { Collage, SiteSettings } from '@/types';
import { getSiteData, getCollagesData } from '@/lib/data';

function getSiteSettings(): SiteSettings {
  return getSiteData() as SiteSettings;
}

function getCollages(): Collage[] {
  return getCollagesData() as Collage[];
}

export default function CategoriesPage() {
  const siteSettings = getSiteSettings();
  const collages = getCollages();

  // Group collages by category
  const categoriesMap = collages.reduce((acc, collage) => {
    if (!acc[collage.category]) {
      acc[collage.category] = [];
    }
    acc[collage.category].push(collage);
    return acc;
  }, {} as Record<string, Collage[]>);

  const categories = Object.entries(categoriesMap);

  return (
    <div className="min-h-screen flex flex-col">

      
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Browse by Category
            </h1>
            <p className="text-xl text-gray-600">
              Discover collages organized by different aspects of college life
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No categories available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map(([category, categoryCollages]) => (
                <Link
                  key={category}
                  href={`/gallery?category=${encodeURIComponent(category)}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
                    <div className="aspect-video relative bg-gray-200">
                      {categoryCollages[0]?.images[0] ? (
                        <Image
                          src={categoryCollages[0].images[0]}
                          alt={category}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          No Image
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <h3 className="text-2xl font-bold mb-2">{category}</h3>
                          <p className="text-sm opacity-90">
                            {categoryCollages.length} collection{categoryCollages.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          {categoryCollages.reduce((total, collage) => total + collage.images.length, 0)} images total
                        </span>
                        <span className="text-blue-600 group-hover:text-blue-700 font-medium">
                          View All →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>


    </div>
  );
}