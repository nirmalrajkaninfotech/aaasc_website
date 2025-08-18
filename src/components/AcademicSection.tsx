'use client';

import { AcademicSection } from '@/types';
import Image from 'next/image';
import { useState } from 'react';

interface AcademicSectionProps {
  academic: AcademicSection;
}

export default function AcademicSectionComponent({ academic }: AcademicSectionProps) {
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  if (!academic) {
    return <div className="p-8 text-center">No academic information available.</div>;
  }

  const toggleProgram = (programId: string) => {
    setExpandedProgram(expandedProgram === programId ? null : programId);
  };

  const publishedPrograms = academic.programs
    .filter(program => program.published !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">{academic.title}</h2>
          {academic.subtitle && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{academic.subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publishedPrograms.map((program) => (
            <div 
              key={program.id} 
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
            >
              {program.image && (
                <div className="relative h-48 w-full bg-gray-200">
                  <Image
                    src={program.image}
                    alt={program.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{program.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{program.description}</p>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Duration:</span> {program.duration}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Eligibility:</span> {program.eligibility}
                  </p>
                </div>

                <button
                  onClick={() => toggleProgram(program.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {expandedProgram === program.id ? 'Show Less' : 'View Details'}
                </button>

                {expandedProgram === program.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="font-medium text-gray-800 mb-2">Syllabus:</h4>
                    <p className="text-sm text-gray-600 mb-4 whitespace-pre-line">{program.syllabus}</p>
                    
                    <h4 className="font-medium text-gray-800 mb-2">Career Prospects:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {program.careerProspects.map((prospect, idx) => (
                        <li key={idx}>{prospect}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {academic.additionalInfo && (
          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <div 
              className="prose max-w-none" 
              dangerouslySetInnerHTML={{ __html: academic.additionalInfo }} 
            />
          </div>
        )}
      </div>
    </section>
  );
}
