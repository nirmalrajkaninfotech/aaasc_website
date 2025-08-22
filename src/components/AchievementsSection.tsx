'use client';

import { useState } from 'react';
import Image from 'next/image';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
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
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            {achievements.title}
          </h2>
          <p className="text-xl text-gray-600">
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
                    <div className="relative h-64 lg:h-80 rounded-lg overflow-hidden mb-4 cursor-zoom-in">
                      <Zoom>
                        <Image 
                          src={item.image} 
                          alt={item.title} 
                          fill 
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </Zoom>
                    </div>
                  )}
                  {(item as any).images && (item as any).images.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {(item as any).images.map((img: any, idx: number) => (
                        <div key={`${img.url}-${idx}`} className="border rounded overflow-hidden">
                          <div className="relative h-28 cursor-zoom-in">
                            <Zoom>
                              <Image 
                                src={img.url} 
                                alt={img.caption || item.title} 
                                fill 
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, 25vw"
                              />
                            </Zoom>
                          </div>
                          {(img.caption || img.subtitle) && (
                            <div className="p-2 bg-white">
                              {img.caption && <div className="text-sm font-medium text-gray-800">{img.caption}</div>}
                              {img.subtitle && <div className="text-xs text-gray-500">{img.subtitle}</div>}
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
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {item.title}
                </h3>
                <div 
                  className="text-gray-600 prose prose-lg max-w-none"
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