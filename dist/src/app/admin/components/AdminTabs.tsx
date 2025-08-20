import React from 'react';
import Link from 'next/link';

export type TabType = 'collages' | 'site' | 'contact' | 'about' | 'academics' | 'placements' | 'achievements' | 'homepage' | 'others' | 'carousel' | 'gallery' | 'homepage_image' | 'alumni' | 'navigation' | 'iqac' | 'examCell' | 'faculty' | 'facilities';

interface AdminTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'site', label: 'Site Settings' },
    { id: 'contact', label: 'Contact Info' },
    { id: 'about', label: 'About' },
    { id: 'placements', label: 'Placements' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'homepage', label: 'Homepage Layout' },
    { id: 'others', label: 'Others' },
    { id: 'carousel', label: 'Carousel' },
    { id: 'navigation', label: 'Navigation' },
    { id: 'iqac', label: 'IQAC' },
    { id: 'examCell', label: 'Exam Cell' },
    { id: 'faculty', label: 'Faculty' },
  ];

  return (
    <nav className="flex flex-wrap gap-2 mb-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as TabType)}
          className={`px-4 py-2 rounded ${
            activeTab === tab.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {tab.label}
        </button>
      ))}
      <Link
        href="/admin/academics"
        className="px-4 py-2 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-700"
      >
        Academics
      </Link>
      <Link
        href="/admin/gallery"
        className="px-4 py-2 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-700"
      >
        Gallery
      </Link>
    </nav>
  );
};
