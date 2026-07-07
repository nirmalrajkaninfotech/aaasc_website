import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { Collage, SiteSettings } from '@/types';
import { fetchApi } from '@/lib/api';

async function getSiteSettings(): Promise<SiteSettings> {
  return fetchApi<SiteSettings>('/api/site', { cache: 'no-store' });
}

async function getCollage(id: string): Promise<Collage | null> {
  const collages = await fetchApi<Collage[]>('/api/collages', { cache: 'no-store' });
  return collages.find(c => c.id === parseInt(id)) || null;
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
            
            <h1 className="text-4xl font-bold text-[var(--theme-text)] mb-4">
              {collage.title}
            </h1>
            
            {collage.description && (
              <p className="text-xl text-[var(--theme-text-secondary)] mb-6 max-w-3xl mx-auto">
                {collage.description}
              </p>
            )}
            
            <div className="flex justify-center items-center gap-6 text-[var(--theme-text-secondary)]">
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
                    className="bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)] px-3 py-1 rounded-full text-sm"
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
              <p className="text-[var(--theme-text-secondary)]">No images in this collage yet.</p>
            </div>
          )}
        </div>
      </main>

     
    </div>
  );
}