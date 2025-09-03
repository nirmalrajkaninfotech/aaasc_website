const fs = require('fs');
const path = require('path');

// Template for page components
const createPageComponent = (pageName, importPath, componentName, additionalImports = '') => {
    return `'use client';

import { useEffect, useState } from 'react';
import { getSiteSettings } from '@/lib/api-utils';
import { SiteSettings } from '@/types';
${additionalImports}

export default function ${pageName}() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const settings = await getSiteSettings();
        setSiteSettings(settings);
      } catch (error) {
        console.error('Error loading ${pageName.toLowerCase()} data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!siteSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Page</h1>
          <p className="text-gray-600">Unable to load page data.</p>
        </div>
      </div>
    );
  }

  // Import the original page content here
  return ${componentName};
}`;
};

// Simple page components that just render existing components
const pages = [
    { name: 'AcademicsPage', component: '<div>Academics Page - TODO: Import from src/app/academics/page.tsx</div>' },
    { name: 'FacultiesPage', component: '<div>Facilities Page - TODO: Import from src/app/facilities/page.tsx</div>' },
    { name: 'GalleryPage', component: '<div>Gallery Page - TODO: Import from src/app/gallery/page.tsx</div>' },
    { name: 'ContactPage', component: '<div>Contact Page - TODO: Import from src/app/contact/page.tsx</div>' },
    { name: 'PlacementsPage', component: '<div>Placements Page - TODO: Import from src/app/placements/page.tsx</div>' },
    { name: 'AchievementsPage', component: '<div>Achievements Page - TODO: Import from src/app/achievements/page.tsx</div>' },
    { name: 'AdmissionFormsPage', component: '<div>Admission Forms Page - TODO: Import from src/app/admission-forms/page.tsx</div>' },
    { name: 'AlumniPage', component: '<div>Alumni Page - TODO: Import from src/app/alumni-association/page.tsx</div>' },
    { name: 'CategoriesPage', component: '<div>Categories Page - TODO: Import from src/app/categories/page.tsx</div>' },
    { name: 'ExamCellPage', component: '<div>Exam Cell Page - TODO: Import from src/app/exam-cell/page.tsx</div>' },
    { name: 'IQACPage', component: '<div>IQAC Page - TODO: Import from src/app/iqac/page.tsx</div>' },
    { name: 'LoginPage', component: '<div>Login Page - TODO: Import from src/app/login/page.tsx</div>' },
    { name: 'OthersPage', component: '<div>Others Page - TODO: Import from src/app/others/page.tsx</div>' },
    { name: 'AdminPage', component: '<div>Admin Page - TODO: Import from src/app/admin/page.tsx</div>' },
];

// Create page components
pages.forEach(page => {
    const content = `'use client';

export default function ${page.name}() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">${page.name.replace('Page', '')}</h1>
        <p className="text-gray-600">This page will be implemented with client-side routing.</p>
      </div>
    </div>
  );
}`;

    fs.writeFileSync(`src/components/pages/${page.name}.tsx`, content);
    console.log(`Created ${page.name}.tsx`);
});

// Create detail pages
const detailPages = [
    'FacilityDetailPage',
    'FacultyDetailPage',
    'CollageDetailPage'
];

detailPages.forEach(pageName => {
    const propName = pageName.includes('Faculty') ? 'slug' : 'id';
    const content = `'use client';

interface ${pageName}Props {
  ${propName}: string;
}

export default function ${pageName}({ ${propName} }: ${pageName}Props) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">${pageName.replace('DetailPage', '')} Detail</h1>
        <p className="text-gray-600">${propName.toUpperCase()}: {${propName}}</p>
        <p className="text-gray-600 mt-2">This page will be implemented with client-side routing.</p>
      </div>
    </div>
  );
}`;

    fs.writeFileSync(`src/components/pages/${pageName}.tsx`, content);
    console.log(`Created ${pageName}.tsx`);
});

console.log('All page components created!');