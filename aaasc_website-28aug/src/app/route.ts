import { NextResponse } from 'next/server';
import { addCorsHeaders } from '@/lib/cors';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const origin = request.headers.get('origin');
  const response = NextResponse.json({ status: 'ok', message: 'API server ready' });
  return addCorsHeaders(response, origin);
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return addCorsHeaders(new NextResponse(null, { status: 204 }), origin);
}
