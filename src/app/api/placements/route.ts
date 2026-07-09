import { NextRequest, NextResponse } from 'next/server';
import { readPlacements, writePlacements } from '@/lib/data';
import { PlacementSection } from '@/types';

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
