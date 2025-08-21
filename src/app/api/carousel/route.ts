// This route is disabled for static export
// For static sites, we'll use client-side data fetching directly from JSON files

import { NextRequest, NextResponse } from 'next/server';

// This tells Next.js this route should be treated as static
export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json(
    { error: 'API route not available in static export' },
    { status: 404 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'API route not available in static export' },
    { status: 403 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'API route not available in static export' },
    { status: 403 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'API route not available in static export' },
    { status: 403 }
  );
}
