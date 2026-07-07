'use client';
import { AcademicSection } from '@/types';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface AcademicSectionProps {
  academic: AcademicSection;
}

export default function AcademicSectionComponent({ academic }: AcademicSectionProps) {
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);
  const [modalProgramId, setModalProgramId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalProgramId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
    <section className="py-16 bg-[var(--theme-bg-card)]" aria-labelledby="academic-section-title">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 
            id="academic-section-title"
            className="text-4xl font-bold text-[var(--theme-text)] mb-4"
          >
            {academic.title}
          </h2>
          {academic.subtitle && (
            <p className="text-xl text-[var(--theme-text-secondary)] max-w-3xl mx-auto">
              {academic.subtitle}
            </p>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8 border-b border-[var(--theme-border)]">
          {Object.keys(programsBySection).map((sectionName) => (
            <button
              key={sectionName}
              onClick={() => setActiveTab(sectionName)}
              className={`px-6 py-3 font-medium text-sm md:text-base transition-colors duration-200 ${
                activeTab === sectionName
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)]'
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {programs.map((program) => (
                  <div 
                    key={program.id} 
                    className="bg-[var(--theme-bg-card)] rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col h-full"
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
                      <h3 className="text-xl font-semibold mb-2 text-[var(--theme-text)]">
                        {program.title}
                      </h3>
                      
                      {program.content ? (
                        <p className="text-[var(--theme-text-secondary)] mb-4 flex-grow line-clamp-3">
                          {(() => {
                            const text = getPlainText(program.content);
                            return text.length > 200 ? text.slice(0, 200) + '…' : text;
                          })()}
                        </p>
                      ) : (
                        <p className="text-[var(--theme-text-secondary)] mb-4 flex-grow line-clamp-3">
                          {program.description?.length > 200 ? program.description.slice(0, 200) + '…' : program.description}
                        </p>
                      )}
                      
                      <div className="mt-auto mb-4">
                        <p className="text-sm text-[var(--theme-text)]">
                        </p>
                        {program.eligibility && (
                          <p className="text-sm text-[var(--theme-text)] mt-1">
                            <span className="font-medium">Eligibility:</span> {program.eligibility}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setModalProgramId(program.id)}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium self-start transition-colors"
                        aria-label={`View details for ${program.title}`}
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {modalProgramId && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div 
              className="absolute inset-0 bg-black/70" 
              onClick={() => setModalProgramId(null)}
              aria-hidden="true"
            ></div>
            
            <div className="relative bg-[var(--theme-bg-card)] rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {(() => {
                const program = publishedPrograms.find(p => p.id === modalProgramId);
                if (!program) return null;
                
                return (
                  <>
                    <div className="p-6 border-b flex items-start justify-between gap-4 bg-[var(--theme-bg-secondary)]">
                      <div>
                        <h3 
                          id="modal-title"
                          className="text-2xl font-semibold text-[var(--theme-text)]"
                        >
                          {program.title}
                        </h3>
                        {program.section && (
                          <p className="text-sm text-[var(--theme-text-secondary)] mt-1">
                            Section: {program.section}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setModalProgramId(null)}
                        className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] text-3xl leading-none p-1"
                        aria-label="Close dialog"
                      >
                        ×
                      </button>
                    </div>
                    
                    {program.image && (
                      <div className="w-full h-64 bg-[var(--theme-bg-secondary)] relative">
                        <Image
                          src={program.image}
                          alt={program.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    )}
                    
                    <div className="p-6 overflow-y-auto flex-grow">
                      <div className="space-y-6">
                        {program.content ? (
                          <div 
                            className="prose max-w-none text-[var(--theme-text)]"
                            dangerouslySetInnerHTML={{ __html: program.content }} 
                          />
                        ) : (
                          <p className="text-[var(--theme-text)]">{program.description}</p>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <div className="space-y-2 text-sm text-[var(--theme-text)]">
                            </div>
                          </div>
                          
                          {program.syllabus && (
                            <div>
                              <h4 className="font-medium text-[var(--theme-text)] mb-2">Syllabus</h4>
                              <p className="text-sm text-[var(--theme-text)] whitespace-pre-line bg-[var(--theme-bg-secondary)] p-3 rounded">
                                {program.syllabus}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {program.careerProspects && program.careerProspects.length > 0 && (
                          <div>
                            <h4 className="font-medium text-[var(--theme-text)] mb-2">Career Prospects</h4>
                            <ul className="list-disc list-inside text-sm text-[var(--theme-text)] space-y-1 pl-4">
                              {program.careerProspects.map((c, i) => (
                                <li key={`${c}-${i}`}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {academic.additionalInfo && (
          <div className="mt-16 p-6 bg-[var(--theme-bg-secondary)] rounded-xl border border-[var(--theme-border)]">
            <h3 className="text-xl font-semibold text-[var(--theme-text)] mb-4">Additional Information</h3>
            <div 
              className="prose max-w-none text-[var(--theme-text)]" 
              dangerouslySetInnerHTML={{ __html: academic.additionalInfo }} 
            />
          </div>
        )}
      </div>
    </section>
  );
}