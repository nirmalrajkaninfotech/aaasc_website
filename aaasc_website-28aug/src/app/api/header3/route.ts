import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Header3Content, defaultHeader3Content } from '@/types/header3';

const dataPath = path.join(process.cwd(), 'data', 'header3.json');

function readHeader3(): Header3Content {
  try {
    const data = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    // Return a default payload if file missing or invalid
    return defaultHeader3Content;
  }
}

function writeHeader3(content: Header3Content): void {
  fs.writeFileSync(dataPath, JSON.stringify(content, null, 2));
}

export async function GET() {
  try {
    const content = readHeader3();
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
    writeHeader3({
      ...defaultHeader3Content,
      ...content,
      updatedAt: new Date().toISOString(),
    });
    
    // Return the saved content
    const savedContent = readHeader3();
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
