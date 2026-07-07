'use client';

import Image from 'next/image';
import { AchievementsSection as AchievementsSectionType } from '@/types';

interface AchievementsSectionProps {
  achievements: AchievementsSectionType;
}

export default function AchievementsSection({ achievements }: AchievementsSectionProps) {
  const publishedItems = achievements.items
    .filter(item => item.published)
    .sort((a, b) => a.order - b.order);

  if (publishedItems.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-[var(--theme-bg-secondary)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[var(--theme-text)] mb-4">
            {achievements.title}
          </h2>
          <p className="text-xl text-[var(--theme-text-secondary)]">
            {achievements.subtitle}
          </p>
        </div>

        <div className="space-y-16">
          {publishedItems.map((item, index) => (
            <div
              key={item.id}
              className={`flex flex-col lg:flex-row items-center gap-8 ${
                item.alignment === 'right' || index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {(item.image || (item as any).images?.length) && (
                <div className="lg:w-1/2 w-full">
                  {item.image && (
                    <div className="relative h-64 lg:h-80 rounded-lg overflow-hidden mb-4">
                      <Image src={item.image} alt={item.title} fill className="object-cover" />
                    </div>
                  )}
                  {(item as any).images && (item as any).images.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {(item as any).images.map((img: any, idx: number) => (
                        <div key={`${img.url}-${idx}`} className="border rounded overflow-hidden">
                          <div className="relative h-28">
                            <Image src={img.url} alt={img.caption || item.title} fill className="object-cover" />
                          </div>
                          {(img.caption || img.subtitle) && (
                            <div className="p-2 bg-[var(--theme-bg-card)]">
                              {img.caption && <div className="text-sm font-medium text-[var(--theme-text)]">{img.caption}</div>}
                              {img.subtitle && <div className="text-xs text-[var(--theme-text-secondary)]">{img.subtitle}</div>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div className={`lg:w-1/2 ${
                item.alignment === 'center' ? 'text-center' : 
                item.alignment === 'right' ? 'text-right' : 'text-left'
              }`}>
                <h3 className="text-2xl font-bold text-[var(--theme-text)] mb-4">
                  {item.title}
                </h3>
                <div 
                  className="text-[var(--theme-text-secondary)] prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}