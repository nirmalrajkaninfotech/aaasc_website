import Image from 'next/image';
import { SiteSettings, Facility, FacilitiesSection } from '@/types';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/api-utils';
import { getImageUrl } from '@/config';

// Required for static export - return minimal params
export async function generateStaticParams() {
  return [{ id: '1' }];
}

interface SiteSettingsWithFacilities extends SiteSettings {
  facilities: FacilitiesSection;
}

interface FacilityPageProps {
  params: {
    id: string;
  };
}

export default async function FacilityPage({ params }: FacilityPageProps) {
  const siteSettings = await getSiteSettings() as SiteSettingsWithFacilities;
  const facilityId = params.id;
  
  // Find the facility by ID
  const facility = siteSettings.facilities?.items?.find(
    (f) => f.id?.toString() === facilityId
  );

  if (!facility) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 bg-gray-50">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Facility Not Found
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                The facility you're looking for doesn't exist.
              </p>
              <Link
                href="/facilities"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Facilities
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-blue-600">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/facilities" className="hover:text-blue-600">
                  Facilities
                </Link>
              </li>
              <li>/</li>
              <li className="text-gray-800 font-medium">{facility.name}</li>
            </ol>
          </nav>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Hero Image */}
            {facility.image && (
              <div className="aspect-video relative">
                <Image
                  src={getImageUrl(facility.image)}
                  alt={facility.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-6">
                {facility.name}
              </h1>

              {facility.description && (
                <div className="mb-8">
                  <div 
                    className="prose prose-lg max-w-none
                      prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                      prose-ol:text-gray-700 prose-ol:mb-4
                      prose-ul:text-gray-700 prose-ul:mb-4
                      prose-li:mb-2
                      prose-strong:text-gray-900 prose-strong:font-semibold
                      prose-h1:text-gray-900 prose-h1:font-bold prose-h1:text-2xl prose-h1:mb-4
                      prose-h2:text-gray-900 prose-h2:font-bold prose-h2:text-xl prose-h2:mb-3
                      prose-h3:text-gray-900 prose-h3:font-semibold prose-h3:text-lg prose-h3:mb-3
                      prose-a:text-blue-600 prose-a:hover:text-blue-700 prose-a:no-underline hover:prose-a:underline
                      [&_p[style*='text-align:center']]:text-center
                      [&_p[style*='text-align:justify']]:text-justify
                      [&_p[style*='text-align:right']]:text-right
                      [&_p[style*='text-align:left']]:text-left
                      [&_li[style*='text-align:center']]:text-center
                      [&_li[style*='text-align:justify']]:text-justify
                      [&_li[style*='text-align:right']]:text-right
                      [&_li[style*='text-align:left']]:text-left"
                    dangerouslySetInnerHTML={{ 
                      __html: facility.description 
                    }}
                  />
                </div>
              )}

              {/* Features */}
              {facility.features && facility.features.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Features
                  </h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {facility.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center">
                        <svg
                          className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gallery */}
              {facility.gallery && facility.gallery.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Gallery
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {facility.gallery.map((image: string, index: number) => (
                      <div key={index} className="aspect-video relative rounded-lg overflow-hidden">
                        <Image
                          src={getImageUrl(image)}
                          alt={`${facility.name} - Image ${index + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Back Button */}
              <div className="pt-8 border-t border-gray-200">
                <Link
                  href="/facilities"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to All Facilities
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
