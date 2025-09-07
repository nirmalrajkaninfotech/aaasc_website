import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { corsHeaders } from '@/lib/cors';

const sitePath = path.join(process.cwd(), 'data', 'site.json');

interface FacultyImage {
  url: string;
  caption: string;
  subtitle: string;
}

interface FacultyItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  order: number;
  published: boolean;
  images: FacultyImage[];
  designation?: string;
}

interface FacultyData {
  title: string;
  items: FacultyItem[];
}

interface SiteData {
  faculty: FacultyData;
  [key: string]: any;
}

function readSiteData(): SiteData {
  try {
    const data = fs.readFileSync(sitePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error('Failed to read site data');
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    const siteData = readSiteData();
    if (!siteData.faculty) {
      return NextResponse.json(
        { error: 'Faculty data not found' },
        { status: 404, headers: corsHeaders }
      );
    }
    return NextResponse.json(siteData.faculty, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read faculty data' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const siteData = readSiteData();
    
    // Update the faculty data with the new data
    const updatedData = {
      ...siteData,
      faculty: {
        ...siteData.faculty,
        ...body,
        items: body.items || siteData.faculty.items
      }
    };
    
    // Save the updated data back to site.json
    fs.writeFileSync(sitePath, JSON.stringify(updatedData, null, 2));
    
    return NextResponse.json(updatedData.faculty, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update faculty data' },
      { status: 500, headers: corsHeaders }
    );
  }
}
