'use client';

import Image from 'next/image';
import { AboutSection as AboutSectionType } from '@/types';

interface AboutSectionProps {
  about: AboutSectionType;
}

export default function AboutSection({ about }: AboutSectionProps) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              {about.title}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              {about.content}
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              {about.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative h-96 rounded-lg overflow-hidden">
            <Image
              src={about.image}
              alt="About us"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}