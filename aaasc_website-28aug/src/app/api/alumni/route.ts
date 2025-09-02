import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { AlumniAssociation } from '@/types';

const alumniPath = path.join(process.cwd(), 'data', 'alumni.json');

function readAlumni(): AlumniAssociation {
  try {
    const data = fs.readFileSync(alumniPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {
      title: 'Alumni Association',
      content: 'Welcome to the Alumni Association. Stay connected with your alma mater!',
      image: '',
      members: []
    };
  }
}

function writeAlumni(alumni: AlumniAssociation): void {
  fs.writeFileSync(alumniPath, JSON.stringify(alumni, null, 2));
}

export async function GET() {
  try {
    const alumni = readAlumni();
    return NextResponse.json(alumni);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read alumni data' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    writeAlumni(body);
    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update alumni data' }, { status: 500 });
  }
}
