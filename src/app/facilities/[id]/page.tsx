import Image from 'next/image';
import { SiteSettings } from '@/types';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';

async function getSiteSettings(): Promise<SiteSettings> {
  return fetchApi<SiteSettings>('/api/site', { cache: 'no-store' });
}

export default async function FacilityDetailPage({ params }: { params: { id: string } }) {
  const site = await getSiteSettings();
  const facility = site.facilities.items.find(i => i.id === params.id);

  if (!facility) {
    return (
      <main className="container mx-auto px-4 py-16">
        <p className="text-[var(--theme-text-secondary)]">Facility not found.</p>
        <Link href="/facilities" className="text-blue-700 hover:text-blue-900">← Back to Facilities</Link>
      </main>
    );
  }

  return (
    <main className="py-16 bg-[var(--theme-bg-secondary)]">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link href="/facilities" className="text-blue-700 hover:text-blue-900">← Back to Facilities</Link>
        </div>

        <div className="bg-[var(--theme-bg-card)] rounded-xl shadow overflow-hidden">
          <div className="px-6 pt-6 pb-2">
            <h1 className="text-3xl font-bold text-[var(--theme-text)]">{facility.name}</h1>
            <span className="inline-block mt-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">{facility.category}</span>
          </div>
      
         
          <div className="p-6 space-y-5">
            <div className="prose prose-lg max-w-none text-[var(--theme-text)]" dangerouslySetInnerHTML={{ __html: facility.description }} />
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
                    <li key={idx} className="text-[var(--theme-text)] flex items-center">
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


