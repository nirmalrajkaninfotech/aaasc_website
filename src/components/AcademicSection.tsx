'use client';
import { AcademicSection } from '@/types';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface AcademicSectionProps {
  academic: AcademicSection;
}

export default function AcademicSectionComponent({ academic }: AcademicSectionProps) {
  const [activeTab, setActiveTab] = useState<string>('');


  if (!academic) {
    return <div className="p-8 text-center">No academic information available.</div>;
  }

  const getPlainText = (html: string): string => {
    if (!html) return '';
    if (typeof window === 'undefined') return html;
    const div = document.createElement('div');
    div.innerHTML = html;
    return (div.textContent || div.innerText || '').trim();
  };

  const publishedPrograms = academic.programs
    .filter(program => program.published !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Group programs by section
  const programsBySection = publishedPrograms.reduce((acc, program) => {
    const section = program.section || 'Other';
    if (!acc[section]) acc[section] = [];
    acc[section].push(program);
    return acc;
  }, {} as Record<string, typeof publishedPrograms>);

  // Set initial active tab
  useEffect(() => {
    const sections = Object.keys(programsBySection);
    if (sections.length > 0 && !activeTab) {
      setActiveTab(sections[0]);
    }
  }, [programsBySection, activeTab]);

  return (
    <section className="py-16 bg-white" aria-labelledby="academic-section-title">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 
            id="academic-section-title"
            className="text-4xl font-bold text-gray-800 mb-4"
          >
            {academic.title}
          </h2>
          {academic.subtitle && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {academic.subtitle}
            </p>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8 border-b border-gray-200">
          {Object.keys(programsBySection).map((sectionName) => (
            <button
              key={sectionName}
              onClick={() => setActiveTab(sectionName)}
              className={`px-6 py-3 font-medium text-sm md:text-base transition-colors duration-200 ${
                activeTab === sectionName
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-selected={activeTab === sectionName}
              role="tab"
            >
              {sectionName}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mb-12">
          {Object.entries(programsBySection).map(([sectionName, programs]) => (
            <div
              key={sectionName}
              className={`${activeTab === sectionName ? 'block' : 'hidden'}`}
              role="tabpanel"
              aria-labelledby={`tab-${sectionName}`}
            >
              <div className={`grid ${programs.length === 1 ? 'grid-cols-1 max-w-2xl' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-8 w-full max-w-7xl mx-auto px-4`}>
                {programs.map((program) => (
                  <div 
                    key={program.id} 
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col h-full w-full"
                  >
                    {program.image && (
                      <div className="relative h-48 w-full bg-gray-200">
                        <Image
                          src={program.image}
                          alt={program.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-semibold mb-2 text-gray-800">
                        {program.title}
                      </h3>
                      
                      <div className="prose prose-sm text-gray-600 mb-4 flex-grow">
                        {program.content ? (
                          <div dangerouslySetInnerHTML={{ __html: program.content }} />
                        ) : (
                          <p>{program.description}</p>
                        )}
                      </div>
                      
                      {program.eligibility && (
                        <div className="mt-auto pt-4 border-t border-gray-100">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Eligibility:</span> {program.eligibility}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {academic.additionalInfo && (
          <div className="mt-16 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Additional Information</h3>
            <div 
              className="prose max-w-none text-gray-700" 
              dangerouslySetInnerHTML={{ __html: academic.additionalInfo }} 
            />
          </div>
        )}
      </div>
    </section>
  );
}