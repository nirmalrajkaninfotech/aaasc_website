import { NextResponse } from 'next/server';

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://127.0.0.1:3000',
  'https://apiaasc.veetusaapadu.in',
  'https://aaasc.edu.in',
  'https://www.aaasc.edu.in',
  'https://admin.aaasc.edu.in',
  'https://demoaasc.xesstechlink.com',
  'http://demoaasc.xesstechlink.com'
];

/**
 * Add CORS headers to Next.js API response
 */
export function addCorsHeaders(response: NextResponse, origin: string | null): NextResponse {
  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  } else if (origin) {
    // Check if origin matches any allowed domain (with or without protocol)
    const originMatch = allowedOrigins.some(allowed => {
      const allowedDomain = allowed.replace(/^https?:\/\//, '');
      const originDomain = origin.replace(/^https?:\/\//, '');
      return originDomain === allowedDomain || origin === allowed;
    });
    if (originMatch) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
  } else if (!origin) {
    // Allow requests with no origin (server-to-server)
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

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

