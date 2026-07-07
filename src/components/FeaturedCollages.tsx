'use client';

import CollageCard from './CollageCard';
import { Collage } from '@/types';

interface FeaturedCollagesProps {
  collages: Collage[];
}

export default function FeaturedCollages({ collages }: FeaturedCollagesProps) {
  const featuredCollages = collages.filter(collage => collage.featured);

  if (featuredCollages.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-[var(--theme-bg-secondary)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[var(--theme-text)] mb-4">
            Featured Collections
          </h2>
          <p className="text-xl text-[var(--theme-text-secondary)]">
            Discover our most popular and memorable college moments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCollages.map((collage) => (
            <CollageCard key={collage.id} collage={collage} />
          ))}
        </div>
      </div>
    </section>
  );
}