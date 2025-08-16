'use client';

import Link from 'next/link';
import Image from 'next/image';
import { HeroSection as HeroSectionType } from '@/types';

interface HeroSectionProps {
  hero: HeroSectionType;
}

export default function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section className="relative h-[600px] flex items-center justify-center text-white">
      <div className="absolute inset-0 z-0">
        <Image
          src={hero.backgroundImage}
          alt="Hero background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          {hero.title}
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-200">
          {hero.subtitle}
        </p>
        <Link
          href={hero.ctaLink}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-300"
        >
          {hero.ctaText}
        </Link>
      </div>
    </section>
  );
}