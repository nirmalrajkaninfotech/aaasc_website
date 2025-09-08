import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With',
  'Access-Control-Max-Age': '86400',
}

export function withCors(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const response = await handler(req)
    
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders
      })
    }
    
    // Add CORS headers to the response
    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.set(key, value)
    }
    
    return response
  }
}
