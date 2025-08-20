import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    
    if (!url) {
      return NextResponse.json(
        { success: 0, message: 'No URL provided' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { success: 0, message: 'Invalid URL format' },
        { status: 400 }
      );
    }

    try {
      // Fetch the URL to get metadata
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch URL');
      }

      const html = await response.text();
      
      // Extract basic metadata
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const descriptionMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i) ||
                              html.match(/<meta[^>]*property=["\']og:description["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
      const imageMatch = html.match(/<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);

      return NextResponse.json({
        success: 1,
        meta: {
          title: titleMatch ? titleMatch[1].trim() : url,
          description: descriptionMatch ? descriptionMatch[1].trim() : '',
          image: {
            url: imageMatch ? imageMatch[1] : ''
          }
        }
      });
    } catch (error) {
      // Fallback response
      return NextResponse.json({
        success: 1,
        meta: {
          title: url,
          description: '',
          image: {
            url: ''
          }
        }
      });
    }
  } catch (error) {
    console.error('Fetch URL error:', error);
    return NextResponse.json(
      { success: 0, message: 'Failed to fetch URL metadata' },
      { status: 500 }
    );
  }
}