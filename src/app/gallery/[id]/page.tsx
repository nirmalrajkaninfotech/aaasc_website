import Image from 'next/image';
import Link from 'next/link';
import { Collage } from '@/types';
import { getCollages } from '@/lib/api-utils';
import { getImageUrl } from '@/config';

export async function generateStaticParams() {
  const collages = await getCollages();
  
  return collages.map((collage: Collage) => ({
    id: collage.id?.toString() || '',
  }));
}

interface GalleryPageProps {
  params: {
    id: string;
  };
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const collages = await getCollages();
  const collageId = params.id;
  const collage = collages.find((c: Collage) => c.id?.toString() === collageId);

  if (!collage) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 bg-gray-50">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Gallery Not Found
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                The gallery you're looking for doesn't exist.
              </p>
              <Link
                href="/gallery"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Gallery
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
                <Link href="/gallery" className="hover:text-blue-600">
                  Gallery
                </Link>
              </li>
              <li>/</li>
              <li className="text-gray-800 font-medium">{collage.title}</li>
            </ol>
          </nav>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-gray-200">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                {collage.title}
              </h1>
              {collage.description && (
                <p className="text-lg text-gray-600">
                  {collage.description}
                </p>
              )}
              {collage.category && (
                <div className="mt-4">
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {collage.category}
                  </span>
                </div>
              )}
            </div>

            {/* Image Gallery */}
            <div className="p-8">
              {collage.images && collage.images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {collage.images.map((image: string, index: number) => (
                    <div key={index} className="aspect-video relative rounded-lg overflow-hidden shadow-md">
                      <Image
                        src={getImageUrl(image)}
                        alt={`${collage.title} - Image ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No images available for this gallery.</p>
                </div>
              )}

              {/* Back Button */}
              <div className="pt-8 mt-8 border-t border-gray-200">
                <Link
                  href="/gallery"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
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
                  Back to Gallery
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}