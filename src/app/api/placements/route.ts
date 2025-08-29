import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PlacementSection } from '@/types';

const placementsPath = path.join(process.cwd(), 'data', 'placements.json');

function readPlacements(): PlacementSection {
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

function writePlacements(placements: PlacementSection): void {
  fs.writeFileSync(placementsPath, JSON.stringify(placements, null, 2));
}

export async function GET() {
  try {
    const placements = readPlacements();
    return NextResponse.json(placements);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read placements data' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    writePlacements(body);
    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update placements data' }, { status: 500 });
  }
}
