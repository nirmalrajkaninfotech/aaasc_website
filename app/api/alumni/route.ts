import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { corsHeaders } from '@/lib/cors';

interface AlumniMember {
  name: string;
  batch?: string;
  department?: string;
  position?: string;
  company?: string;
  image?: string;
  [key: string]: any; // Allow additional properties
}

interface AlumniAssociation {
  title: string;
  content: string;
  image?: string;
  members: AlumniMember[];
}

const alumniPath = path.join(process.cwd(), 'data', 'alumni.json');

function readAlumni(): AlumniAssociation {
  try {
    const data = fs.readFileSync(alumniPath, 'utf8');
    const alumniData = JSON.parse(data);
    // Ensure the data matches our interface
    return {
      title: alumniData.title || 'Alumni Association',
      content: alumniData.content || '',
      image: alumniData.image || '',
      members: Array.isArray(alumniData.members) ? alumniData.members : []
    };
  } catch (error) {
    return {
      title: 'Alumni Association',
      content: 'Arulmigu Arthanareeswarar Arts and Science College formed the Alumni Association with a vision to promote an inspiring relation with the former students of this college.',
      image: '',
      members: []
    };
  }
}

function writeAlumni(alumni: AlumniAssociation): void {
  fs.writeFileSync(alumniPath, JSON.stringify(alumni, null, 2));
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    const alumni = readAlumni();
    return NextResponse.json(alumni, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read alumni data' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as Partial<AlumniAssociation>;
    const currentData = readAlumni();
    
    // Update only the provided fields
    const updatedData: AlumniAssociation = {
      title: body.title ?? currentData.title,
      content: body.content ?? currentData.content,
      image: body.image ?? currentData.image,
      members: Array.isArray(body.members) ? body.members : currentData.members
    };
    
    writeAlumni(updatedData);
    return NextResponse.json(updatedData, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update alumni data' },
      { status: 500, headers: corsHeaders }
    );
  }
}
