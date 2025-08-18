import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data/academics.json');

export async function GET() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return NextResponse.json({
        title: 'Academic Programs',
        subtitle: 'Explore our diverse range of academic programs',
        programs: [],
        additionalInfo: ''
      });
    }
    
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    const academicData = JSON.parse(data);
    
    // Only return published programs
    const publicData = {
      ...academicData,
      programs: academicData.programs
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
