import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { success: 0, message: 'No URL provided' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { success: 0, message: 'Invalid URL format' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if URL points to an image
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const isImage = imageExtensions.some(ext => 
      url.toLowerCase().includes(ext)
    );

    if (!isImage) {
      return NextResponse.json(
        { success: 0, message: 'URL does not point to an image' },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: 1,
      file: {
        url: url
      }
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Fetch image error:', error);
    return NextResponse.json(
      { success: 0, message: 'Failed to fetch image' },
      { status: 500, headers: corsHeaders }
    );
  }
}