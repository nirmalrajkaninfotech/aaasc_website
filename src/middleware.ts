import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const allowedOrigins = ['*'] // Replace with your specific domains
const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
const allowedHeaders = ['Content-Type', 'Authorization']

export function middleware(request: NextRequest) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      headers: {
        'Access-Control-Allow-Origin': allowedOrigins.join(','),
        'Access-Control-Allow-Methods': allowedMethods.join(','),
        'Access-Control-Allow-Headers': allowedHeaders.join(','),
      },
    })
  }

  const response = NextResponse.next()

  // Apply CORS headers to all responses
  response.headers.set('Access-Control-Allow-Origin', allowedOrigins.join(','))
  response.headers.set('Access-Control-Allow-Methods', allowedMethods.join(','))
  response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(','))

  return response
}

export const config = {
  matcher: '/:path*',
}
