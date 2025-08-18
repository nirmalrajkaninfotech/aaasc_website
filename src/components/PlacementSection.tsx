import Image from 'next/image';
import { PlacementSection } from '@/types';

export default function PlacementSectionComponent({ placements }: { placements: PlacementSection }) {
  if (!placements) return <div className="p-8 text-center">No placement data found.</div>;
  
  // Filter only published items
  const publishedItems = placements.items
    .filter(item => item.published !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
    
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">{placements.title}</h2>
          {placements.subtitle && <p className="text-xl text-gray-600 max-w-3xl mx-auto">{placements.subtitle}</p>}
        </div>
        
        {publishedItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedItems.map((item, idx) => (
              <div key={item.id || idx} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {item.images && item.images.length > 0 && (
                  <div className="relative h-48 w-full bg-gray-200">
                    <Image 
                      src={item.images[0]} 
                      alt={item.title} 
                      fill 
                      className="object-cover" 
                    />
                    {item.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 px-2 py-1 rounded-md text-xs font-medium">
                        +{item.images.length - 1} more
                      </div>
                    )}
                  </div>
                )}
                <div className="p-6">
                  <h4 className="text-xl font-semibold mb-3 text-gray-800">{item.title}</h4>
                  <div 
                    className="prose prose-sm max-w-none text-gray-600" 
                    dangerouslySetInnerHTML={{ __html: item.content }} 
                  />
                  
                  {item.images && item.images.length > 1 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.images.slice(1, 4).map((img, i) => (
                        <div key={i} className="relative w-16 h-16">
                          <Image 
                            src={img} 
                            alt={`${item.title} image ${i+2}`} 
                            fill 
                            className="object-cover rounded-md" 
                          />
                        </div>
                      ))}
                      {item.images.length > 4 && (
                        <div className="relative w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-gray-600 text-xs font-medium">+{item.images.length - 4}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">No placement items available.</div>
        )}
      </div>
    </section>
  );
}
