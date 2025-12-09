import { NextRequest, NextResponse } from 'next/server';

// Permissive CORS: allow all origins
export function middleware(request: NextRequest) {
  // Helper to attach headers
  const withCors = (response: NextResponse) => {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range, X-Requested-With, Referer');
    response.headers.set('Access-Control-Max-Age', '86400');
    return response;
  };

  // Preflight
  if (request.method === 'OPTIONS') {
    return withCors(new NextResponse(null, { status: 204 }));
  }

  // Other methods: continue and add CORS headers
  return withCors(NextResponse.next());
}

export const config = {
  matcher: ['/:path*'],
};

