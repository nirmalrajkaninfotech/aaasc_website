import { NextResponse } from 'next/server';
import { getHeader3Content, saveHeader3Content } from '@/lib/header3Storage';
import { Header3Content } from '@/types/header3';

export async function GET() {
  try {
    const content = getHeader3Content();
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching header3 content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch header content' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const content: Header3Content = await request.json();
    await saveHeader3Content(content);
    
    // Return the saved content
    const savedContent = getHeader3Content();
    return NextResponse.json(savedContent);
  } catch (error) {
    console.error('Error saving header3 content:', error);
    return NextResponse.json(
      { error: 'Failed to save header content' },
      { status: 500 }
    );
  }
}

// For pre-Next.js 13.4
// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: '1mb',
//     },
//   },
// };
