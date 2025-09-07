import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { PlacementsSection } from '@/types';
import { corsHeaders } from '@/lib/cors';

const placementsPath = path.join(process.cwd(), 'data', 'placements.json');

function readPlacements(): PlacementsSection {
  try {
    const data = fs.readFileSync(placementsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {
      title: 'Student Placements',
      subtitle: 'Our graduates excel in top companies worldwide.',
      items: []
    };
  }
}

function writePlacements(placements: PlacementsSection): void {
  fs.writeFileSync(placementsPath, JSON.stringify(placements, null, 2));
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    const placements = readPlacements();
    return NextResponse.json(placements, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read placements data' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    writePlacements(body);
    return NextResponse.json(body, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update placements data' },
      { status: 500, headers: corsHeaders }
    );
  }
}
