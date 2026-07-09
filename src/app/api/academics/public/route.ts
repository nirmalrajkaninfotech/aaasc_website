import { NextResponse } from 'next/server';
import { readAcademicData } from '@/lib/data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const academicData = readAcademicData();
    
    // Normalize items to support both `image` and `img` and ensure defaults
    const normalized = (academicData.programs || []).map((program: any, index: number) => ({
      id: program.id || `prog_${index}`,
      title: program.title || '',
      section: program.section || program.category || '',
      description: program.description || program.content || '',
      content: program.content || '',
      image: program.image || program.img || '',
      duration: program.duration || '',
      eligibility: program.eligibility || '',
      syllabus: program.syllabus || '',
      careerProspects: program.careerProspects || [],
      order: program.order ?? index + 1,
      published: program.published !== false,
    }));

    // Only return published programs
    const publicData = {
      ...academicData,
      programs: normalized
        .filter((program: any) => program.published)
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
    };
    
    return NextResponse.json(publicData);
  } catch (error) {
    console.error('Error fetching public academics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch academics data' },
      { status: 500 }
    );
  }
}
