import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Collage } from '@/types';

// This tells Next.js this route should be treated as static
export const dynamic = 'force-static';

// This function generates static params for the route
export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), 'data', 'collages.json');
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const collages: Collage[] = JSON.parse(data);
    return collages.map(collage => ({
      id: collage.id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params for collages:', error);
    return [];
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'collages.json');
    const data = fs.readFileSync(filePath, 'utf8');
    const collages: Collage[] = JSON.parse(data);
    const collage = collages.find(c => c.id.toString() === params.id);

    if (!collage) {
      return NextResponse.json(
        { error: 'Collage not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(collage);
  } catch (error) {
    console.error('Error fetching collage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collage' },
      { status: 500 }
    );
  }
}

// Disable write operations in production
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Write operations are disabled in production' },
      { status: 403 }
    );
  }
  
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Write operations are disabled in production' },
      { status: 403 }
    );
  }
  
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Write operations are disabled in production' },
      { status: 403 }
    );
  }
  
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
