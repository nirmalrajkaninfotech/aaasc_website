import { NextResponse } from 'next/server';

/**
 * Add CORS headers to Next.js API response
 * Allows all origins for maximum compatibility
 */
export function addCorsHeaders(response: NextResponse, origin: string | null): NextResponse {
  // Allow all origins
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range, X-Requested-With, Referer');
  response.headers.set('Access-Control-Max-Age', '86400');

  return response;
}

/**
 * Handle OPTIONS preflight request
 */
export function handleOptionsRequest(origin: string | null): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(response, origin);
}

