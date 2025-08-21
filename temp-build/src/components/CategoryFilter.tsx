'use client';

import { useState } from 'react';
import { Collage } from '@/types';

interface CategoryFilterProps {
  collages: Collage[];
  onFilterChange: (filteredCollages: Collage[]) => void;
}

export default function CategoryFilter({ collages, onFilterChange }: CategoryFilterProps) {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(collages.map(c => c.category)))];

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (category === 'All') {
      onFilterChange(collages);
    } else {
      onFilterChange(collages.filter(c => c.category === category));
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-4 mb-8">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryChange(category)}
          className={`px-6 py-2 rounded-full font-medium transition-colors duration-200 ${
            activeCategory === category
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}