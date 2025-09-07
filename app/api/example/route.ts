import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { corsHeaders } from '@/lib/cors'

// Middleware function (similar to Express.js)
const withMiddleware = (handler: Function) => {
  return async (req: NextRequest) => {
    // Add your middleware logic here
    console.log('Middleware running for:', req.url)
    
    // Call the actual route handler
    return handler(req)
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// Route handlers for different HTTP methods
export async function GET(request: NextRequest) {
  return withMiddleware(async (req: NextRequest) => {
    return NextResponse.json(
      { message: 'GET request handled' },
      { headers: corsHeaders }
    )
  })(request)
}

export async function POST(request: NextRequest) {
  return withMiddleware(async (req: NextRequest) => {
    const data = await req.json()
    return NextResponse.json({ 
      message: 'POST request handled', 
      receivedData: data 
    }, { 
      headers: corsHeaders 
    })
  })(request)
}
